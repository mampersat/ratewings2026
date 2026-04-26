import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const cookieStore = await cookies();
  if (!cookieStore.get("rw_admin")?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = new URL(req.url).searchParams.get("q") ?? "";
  const spots = await prisma.spot.findMany({
    where: { name: { contains: q, mode: "insensitive" } },
    orderBy: { name: "asc" },
    take: 20,
    include: { _count: { select: { ratings: true } } },
  });

  return NextResponse.json(spots);
}
