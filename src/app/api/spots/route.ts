import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const spots = await prisma.spot.findMany({
    orderBy: { createdAt: "desc" },
    include: { ratings: { select: { overall: true } } },
  });

  const data = spots.map((spot) => ({
    ...spot,
    avgOverall:
      spot.ratings.length > 0
        ? spot.ratings.reduce((sum, r) => sum + r.overall, 0) /
          spot.ratings.length
        : null,
    totalRatings: spot.ratings.length,
    ratings: undefined,
  }));

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, address, city, state, imageUrl } = body;

  if (!name || !address || !city || !state) {
    return NextResponse.json(
      { error: "name, address, city, and state are required" },
      { status: 400 }
    );
  }

  const spot = await prisma.spot.create({
    data: { name, address, city, state, imageUrl: imageUrl ?? null },
  });

  return NextResponse.json(spot, { status: 201 });
}
