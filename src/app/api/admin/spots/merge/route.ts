import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  if (!cookieStore.get("rw_admin")?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { primaryId, secondaryIds } = await req.json();
  if (!primaryId || !Array.isArray(secondaryIds) || secondaryIds.length === 0) {
    return NextResponse.json({ error: "Invalid spot IDs" }, { status: 400 });
  }
  if (secondaryIds.includes(primaryId)) {
    return NextResponse.json({ error: "Primary cannot be in secondaries" }, { status: 400 });
  }

  await prisma.rating.updateMany({
    where: { spotId: { in: secondaryIds } },
    data: { spotId: primaryId },
  });

  await prisma.spot.deleteMany({ where: { id: { in: secondaryIds } } });

  return NextResponse.json({ ok: true });
}
