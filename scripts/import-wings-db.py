#!/usr/bin/env python3
"""
Import data from wings.db (SQLite) into the RateWings PostgreSQL database.

Mapping:
  wing_locations  -> Spot
  wing_reviews    -> Rating (with a seed "import" user)
"""

import sqlite3
import os
import re
import sys
from datetime import datetime, timezone

# Read DATABASE_URL from .env.local
def load_env(path=".env.local"):
    env = {}
    try:
        with open(path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, _, v = line.partition("=")
                    env[k.strip()] = v.strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    return env

env = load_env()
db_url = env.get("DATABASE_URL") or os.environ.get("DATABASE_URL")

if not db_url:
    print("ERROR: DATABASE_URL not found in .env.local or environment", file=sys.stderr)
    sys.exit(1)

try:
    import psycopg2
    import psycopg2.extras
except ImportError:
    print("Installing psycopg2-binary...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary"])
    import psycopg2
    import psycopg2.extras

# Generate cuid-like IDs using uuid4 (compatible with Prisma's @id field)
import uuid
def new_id():
    return str(uuid.uuid4())

def parse_address(raw: str):
    """Best-effort parse of 'Street, City, ST' into (address, city, state)."""
    parts = [p.strip() for p in raw.split(",")]
    if len(parts) >= 3:
        return parts[0], parts[-2].strip(), parts[-1].strip()
    elif len(parts) == 2:
        return parts[0], parts[1], ""
    else:
        return raw, "", ""

def parse_comment(comment: str | None) -> dict:
    """Extract key:value pairs from the YAML-like comment field."""
    result = {}
    if not comment:
        return result
    for line in comment.splitlines():
        if ": " in line:
            k, _, v = line.partition(": ")
            result[k.strip()] = v.strip()
    return result

def clamp_int(val, default=5) -> int:
    try:
        v = int(float(val))
        return max(1, min(10, v)) if v != 0 else default
    except (TypeError, ValueError):
        return default

# ---- Connect to SQLite ----
sqlite_conn = sqlite3.connect("wings.db")
sqlite_conn.row_factory = sqlite3.Row

# ---- Connect to PostgreSQL ----
pg_conn = psycopg2.connect(db_url)
pg_cur = pg_conn.cursor()

print("Connected to both databases.")

# ---- Seed user ----
SEED_USER_ID = new_id()
SEED_USER_EMAIL = "import@ratewings.local"

pg_cur.execute('SELECT id FROM "User" WHERE email = %s', (SEED_USER_EMAIL,))
row = pg_cur.fetchone()
if row:
    SEED_USER_ID = row[0]
    print(f"Seed user already exists: {SEED_USER_ID}")
else:
    pg_cur.execute(
        'INSERT INTO "User" (id, name, email, "createdAt") VALUES (%s, %s, %s, %s)',
        (SEED_USER_ID, "Unknown User", SEED_USER_EMAIL, datetime.now(timezone.utc)),
    )
    print(f"Created seed user: {SEED_USER_ID}")

# ---- Import Spots ----
locations = sqlite_conn.execute("SELECT * FROM wing_locations").fetchall()
old_id_to_new = {}  # old sqlite int id -> new uuid

spots_inserted = 0
spots_skipped = 0

for loc in locations:
    address, city, state = parse_address(loc["address"])
    new_spot_id = new_id()
    old_id_to_new[loc["id"]] = new_spot_id

    lat = loc["lat"] if loc["lat"] else None
    lng = loc["lon"] if loc["lon"] else None

    # Check for duplicate by name+address
    pg_cur.execute('SELECT id FROM "Spot" WHERE name = %s AND address = %s', (loc["name"], address))
    existing = pg_cur.fetchone()
    if existing:
        old_id_to_new[loc["id"]] = existing[0]
        # Backfill coordinates if missing
        pg_cur.execute(
            'UPDATE "Spot" SET lat = %s, lng = %s WHERE id = %s AND lat IS NULL',
            (lat, lng, existing[0]),
        )
        spots_skipped += 1
        continue

    pg_cur.execute(
        'INSERT INTO "Spot" (id, name, address, city, state, lat, lng, "createdAt") VALUES (%s, %s, %s, %s, %s, %s, %s, %s)',
        (new_spot_id, loc["name"], address, city, state, lat, lng, datetime.now(timezone.utc)),
    )
    spots_inserted += 1

print(f"Spots: {spots_inserted} inserted, {spots_skipped} skipped (already exist)")

# ---- Import Ratings ----
# Wipe all existing seed-user ratings and re-insert fresh from wings.db
pg_cur.execute('DELETE FROM "Rating" WHERE "userId" = %s', (SEED_USER_ID,))
deleted = pg_cur.rowcount
print(f"Cleared {deleted} existing imported ratings")

reviews = sqlite_conn.execute("SELECT * FROM wing_reviews").fetchall()

ratings_inserted = 0
ratings_skipped = 0

for rev in reviews:
    spot_id = old_id_to_new.get(rev["location_id"])
    if not spot_id:
        ratings_skipped += 1
        continue

    meta = parse_comment(rev["comment"])
    overall = clamp_int(rev["rating"])
    sauce   = clamp_int(rev["heat"] if rev["heat"] else meta.get("heat"), default=5)
    crispy  = clamp_int(meta.get("doneness"), default=5)
    value   = clamp_int(meta.get("size"), default=5)
    notes   = meta.get("note") if meta.get("note") not in (None, "None") else None

    try:
        created_at = datetime.fromisoformat(rev["created_at"].replace("Z", "+00:00"))
    except Exception:
        created_at = datetime.now(timezone.utc)

    pg_cur.execute(
        """INSERT INTO "Rating" (id, "spotId", "userId", overall, sauce, crispy, value, notes, "createdAt")
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
        (new_id(), spot_id, SEED_USER_ID, overall, sauce, crispy, value, notes, created_at),
    )
    ratings_inserted += 1

print(f"Ratings: {ratings_inserted} inserted, {ratings_skipped} skipped")

pg_conn.commit()
pg_cur.close()
pg_conn.close()
sqlite_conn.close()

print("Done!")
