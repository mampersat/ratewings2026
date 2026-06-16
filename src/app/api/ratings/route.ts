import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/db";
import { HONEYPOT_FIELD, isHoneypotTripped } from "@/lib/honeypot";
import { TURNSTILE_FIELD, verifyTurnstile } from "@/lib/turnstile";

const COOKIE = "rw_uid";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get(COOKIE)?.value;

  if (!userId) {
    return NextResponse.json({ error: "No user cookie found" }, { status: 401 });
  }

  const body = await req.json();

  if (isHoneypotTripped(body[HONEYPOT_FIELD])) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const hdrs = await headers();
  const remoteIp = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;
  if (!(await verifyTurnstile(body[TURNSTILE_FIELD], remoteIp))) {
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  const { spotId, overall, sauce, crispy, value, notes } = body;

  if (!spotId) {
    return NextResponse.json({ error: "spotId is required" }, { status: 400 });
  }

  const scores = [overall, sauce, crispy, value];
  if (scores.some((s) => typeof s !== "number" || s < 1 || s > 10)) {
    return NextResponse.json(
      { error: "Scores must be numbers between 1 and 10" },
      { status: 400 }
    );
  }

  // Create user lazily on first rating
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, name: "Anonymous", email: `${userId}@anon.ratewings` },
  });

  const rating = await prisma.rating.create({
    data: {
      spotId,
      userId,
      overall,
      sauce,
      crispy,
      value,
      notes: notes ?? null,
      clientIp: remoteIp ?? null,
    },
  });

  return NextResponse.json(rating, { status: 201 });
}
