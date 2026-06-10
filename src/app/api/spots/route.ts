import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { HONEYPOT_FIELD, isHoneypotTripped } from "@/lib/honeypot";
import { TURNSTILE_FIELD, verifyTurnstile } from "@/lib/turnstile";

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

  if (isHoneypotTripped(body[HONEYPOT_FIELD])) {
    return NextResponse.json({ error: "Submission rejected" }, { status: 400 });
  }

  const hdrs = await headers();
  const remoteIp = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;
  if (!(await verifyTurnstile(body[TURNSTILE_FIELD], remoteIp))) {
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

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
