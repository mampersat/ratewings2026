import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

type LeaderboardEntry = {
  id: string;
  name: string;
  city: string;
  state: string;
  totalRatings: number;
  avgOverall: number;
  avgSauce: number;
  avgCrispy: number;
  avgValue: number;
};

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const spots = await prisma.spot.findMany({
    include: {
      ratings: {
        select: { overall: true, sauce: true, crispy: true, value: true },
      },
    },
  });

  const entries: LeaderboardEntry[] = [];

  for (const spot of spots) {
    const n = spot.ratings.length;
    if (n === 0) continue;

    const avg = (key: "overall" | "sauce" | "crispy" | "value") =>
      spot.ratings.reduce((sum, r) => sum + r[key], 0) / n;

    entries.push({
      id: spot.id,
      name: spot.name,
      city: spot.city,
      state: spot.state,
      totalRatings: n,
      avgOverall: avg("overall"),
      avgSauce: avg("sauce"),
      avgCrispy: avg("crispy"),
      avgValue: avg("value"),
    });
  }

  return entries.sort((a, b) => b.avgOverall - a.avgOverall);
}

export default async function LeaderboardPage() {
  const spots = await getLeaderboard();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Leaderboard</h1>

      {spots.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          No rated spots yet.{" "}
          <Link href="/spots" className="text-orange-500 underline">
            Browse spots
          </Link>{" "}
          and leave the first rating!
        </p>
      ) : (
        <div className="space-y-3">
          {spots.map((spot, i) => (
            <Link key={spot.id} href={`/spots/${spot.id}`}>
              <div className="bg-white border rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                <span className="text-2xl font-bold text-gray-300 w-8 text-center">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {spot.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {spot.city}, {spot.state} · {spot.totalRatings} ratings
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-500">
                    {spot.avgOverall.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-400">overall</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
