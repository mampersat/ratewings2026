import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const COOKIE = "rw_uid";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get(COOKIE)?.value;

  if (!userId) {
    return NextResponse.json({ error: "No user cookie found" }, { status: 401 });
  }

  const body = await req.json();
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
    data: { spotId, userId, overall, sauce, crispy, value, notes: notes ?? null },
  });

  return NextResponse.json(rating, { status: 201 });
}
