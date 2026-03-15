import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const { spotId, userId, overall, sauce, crispy, value, notes } = body;

  if (!spotId || !userId) {
    return NextResponse.json(
      { error: "spotId and userId are required" },
      { status: 400 }
    );
  }

  const scores = [overall, sauce, crispy, value];
  if (scores.some((s) => typeof s !== "number" || s < 1 || s > 10)) {
    return NextResponse.json(
      { error: "Scores must be numbers between 1 and 10" },
      { status: 400 }
    );
  }

  const rating = await prisma.rating.upsert({
    where: { spotId_userId: { spotId, userId } },
    update: { overall, sauce, crispy, value, notes: notes ?? null },
    create: { spotId, userId, overall, sauce, crispy, value, notes: notes ?? null },
  });

  return NextResponse.json(rating, { status: 201 });
}
