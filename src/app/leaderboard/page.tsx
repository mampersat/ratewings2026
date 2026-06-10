import { prisma } from "@/lib/db";
import Link from "next/link";
import HeatBar from "@/components/HeatBar";

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
    if (n < 2) continue;

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
      <header className="pt-6 pb-2">
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-gray-900 dark:text-[#f4ede2]">
          Standings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-[#9a8d82]">
          {spots.length > 0
            ? `${spots.length} spots ranked by overall score — two ratings to qualify.`
            : "The board is empty for now."}
        </p>
      </header>

      <div className="mt-6 rounded-2xl bg-[#1a1614] border border-[#2c2521] overflow-hidden">
        {spots.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <p className="font-display text-xs uppercase tracking-[0.28em] text-orange-500">
              ♛ No champion yet
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase text-[#f4ede2]">
              The throne is empty
            </h2>
            <p className="mt-3 text-[#9a8d82] max-w-md mx-auto">
              A spot needs two ratings to enter the standings.{" "}
              <Link href="/spots" className="text-orange-500 hover:text-orange-400">
                Browse spots
              </Link>{" "}
              and crown a champion.
            </p>
          </div>
        ) : (
          <ol className="p-3 sm:p-4">
            {spots.map((spot, i) => {
              const rank = i + 1;
              const top = rank === 1;
              return (
                <li key={spot.id}>
                  <Link
                    href={`/spots/${spot.id}`}
                    className="group flex items-center gap-3 sm:gap-4 rounded-xl px-2 sm:px-3 py-3 hover:bg-[#221b18] transition-colors"
                  >
                    <span
                      className={`font-display text-2xl tabular-nums w-9 text-center transition-colors ${
                        top
                          ? "text-orange-500"
                          : "text-[#5c534c] group-hover:text-orange-500"
                      }`}
                    >
                      {String(rank).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg uppercase leading-tight text-[#f4ede2] truncate">
                        {top && <span className="text-orange-500 mr-1.5">♛</span>}
                        {spot.name}
                      </p>
                      <p className="text-xs text-[#9a8d82] truncate">
                        {[spot.city, spot.state].filter(Boolean).join(", ")} ·{" "}
                        {spot.totalRatings} ratings
                      </p>
                    </div>
                    <div className="hidden sm:block w-24 shrink-0">
                      <HeatBar value={spot.avgSauce} />
                    </div>
                    <span className="font-display text-2xl text-orange-500 tabular-nums w-12 text-right">
                      {spot.avgOverall.toFixed(1)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
