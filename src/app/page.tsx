import { prisma } from "@/lib/db";
import Link from "next/link";
import HeatBar from "@/components/HeatBar";

export const dynamic = "force-dynamic";

type Ranked = {
  id: string;
  name: string;
  city: string;
  state: string;
  totalRatings: number;
  avgOverall: number;
  avgSauce: number;
};

async function getStandings() {
  const spots = await prisma.spot.findMany({
    include: { ratings: { select: { overall: true, sauce: true } } },
  });

  let totalRatings = 0;
  const ranked: Ranked[] = [];

  for (const spot of spots) {
    const n = spot.ratings.length;
    totalRatings += n;
    if (n < 2) continue; // a spot needs 2 ratings to enter the standings

    const avg = (key: "overall" | "sauce") =>
      spot.ratings.reduce((sum, r) => sum + r[key], 0) / n;

    ranked.push({
      id: spot.id,
      name: spot.name,
      city: spot.city,
      state: spot.state,
      totalRatings: n,
      avgOverall: avg("overall"),
      avgSauce: avg("sauce"),
    });
  }

  ranked.sort((a, b) => b.avgOverall - a.avgOverall);
  return { ranked, totalSpots: spots.length, totalRatings };
}

function place(city: string, state: string) {
  return [city, state].filter(Boolean).join(", ");
}

export default async function Home() {
  const { ranked, totalSpots, totalRatings } = await getStandings();
  const champ = ranked[0];
  const chase = ranked.slice(1, 6);

  return (
    <div>
      {/* Fixed full-viewport background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
      >
        <source src="/videos/wings-bg.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-black/55 z-[1]" />

      <div className="relative z-[2]">
        {/* Thesis: ask the question the product exists to settle */}
        <header className="pt-6 pb-2">
          <h1 className="font-display text-4xl sm:text-6xl uppercase leading-[0.95] tracking-tight text-white">
            Who&apos;s got the <span className="text-orange-500">best</span> wings?
          </h1>
          <p className="mt-3 text-lg text-gray-300 max-w-xl">
            Ranked by the people doing the eating
            {totalSpots > 0 && (
              <>
                {" "}— {totalSpots} {totalSpots === 1 ? "spot" : "spots"}, {totalRatings}{" "}
                {totalRatings === 1 ? "rating" : "ratings"} and counting
              </>
            )}
            .
          </p>
        </header>

        {/* The board */}
        <div className="mt-6 rounded-2xl bg-[#1a1614] border border-[#2c2521] overflow-hidden">
          {champ ? (
            <>
              {/* Reigning champion */}
              <div className="fade-rise p-6 sm:p-8 border-b border-[#2c2521]">
                <p className="font-display text-xs uppercase tracking-[0.28em] text-orange-500">
                  ♛ Reigning champ
                </p>
                <div className="mt-3 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      href={`/spots/${champ.id}`}
                      className="group inline-block max-w-full"
                    >
                      <h2 className="font-display text-3xl sm:text-5xl uppercase leading-[0.9] text-[#f4ede2] truncate group-hover:text-orange-400 transition-colors">
                        {champ.name}
                      </h2>
                    </Link>
                    <p className="mt-2 text-sm text-[#9a8d82]">
                      {place(champ.city, champ.state)} · {champ.totalRatings} ratings
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display text-6xl sm:text-7xl leading-[0.8] text-orange-500 tabular-nums">
                      {champ.avgOverall.toFixed(1)}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#9a8d82]">
                      Overall
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <span className="text-[11px] uppercase tracking-[0.15em] text-[#9a8d82] w-9 shrink-0">
                    Heat
                  </span>
                  <div className="flex-1">
                    <HeatBar value={champ.avgSauce} size="lg" />
                  </div>
                  <span className="font-display text-base text-[#f4ede2] tabular-nums w-9 text-right">
                    {champ.avgSauce.toFixed(1)}
                  </span>
                </div>

                <Link
                  href={`/spots/${champ.id}`}
                  className="group mt-5 inline-flex items-center gap-1.5 font-display text-sm uppercase tracking-[0.12em] text-orange-500"
                >
                  See the spot
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>

              {/* The chase */}
              {chase.length > 0 && (
                <div className="p-4 sm:p-6">
                  <div className="flex items-baseline justify-between px-2 mb-2">
                    <p className="font-display text-xs uppercase tracking-[0.28em] text-[#9a8d82]">
                      The chase
                    </p>
                    <Link
                      href="/leaderboard"
                      className="text-xs uppercase tracking-wide text-[#9a8d82] hover:text-orange-400 transition-colors"
                    >
                      Full standings →
                    </Link>
                  </div>
                  <ol>
                    {chase.map((s, i) => (
                      <li key={s.id}>
                        <Link
                          href={`/spots/${s.id}`}
                          className="group flex items-center gap-3 sm:gap-4 rounded-xl px-2 sm:px-3 py-3 hover:bg-[#221b18] transition-colors"
                        >
                          <span className="font-display text-2xl text-[#5c534c] tabular-nums w-8 text-center group-hover:text-orange-500 transition-colors">
                            {String(i + 2).padStart(2, "0")}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-display text-lg uppercase leading-tight text-[#f4ede2] truncate">
                              {s.name}
                            </p>
                            <p className="text-xs text-[#9a8d82] truncate">
                              {place(s.city, s.state)} · {s.totalRatings} ratings
                            </p>
                          </div>
                          <div className="hidden sm:block w-24 shrink-0">
                            <HeatBar value={s.avgSauce} />
                          </div>
                          <span className="font-display text-2xl text-orange-500 tabular-nums w-12 text-right">
                            {s.avgOverall.toFixed(1)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </>
          ) : (
            /* Empty standings — an invitation, not a dead end */
            <div className="fade-rise p-8 sm:p-12 text-center">
              <p className="font-display text-xs uppercase tracking-[0.28em] text-orange-500">
                ♛ No champion yet
              </p>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl uppercase text-[#f4ede2] leading-tight">
                The throne is empty
              </h2>
              <p className="mt-3 text-[#9a8d82] max-w-md mx-auto">
                {totalSpots === 0
                  ? "No spots on the board. Add the first one and get the rankings started."
                  : "A spot needs two ratings to enter the standings. Rate a few and crown a champion."}
              </p>
            </div>
          )}
        </div>

        {/* Next actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/spots"
            className="bg-orange-500 text-[#1a1614] px-6 py-3 rounded-xl font-display text-sm uppercase tracking-[0.12em] hover:bg-orange-400 transition-colors"
          >
            Browse all spots
          </Link>
          <Link
            href="/spots/new"
            className="border border-[#2c2521] text-[#f4ede2] px-6 py-3 rounded-xl font-display text-sm uppercase tracking-[0.12em] hover:border-orange-500 hover:text-orange-500 transition-colors"
          >
            Add a spot
          </Link>
        </div>
      </div>
    </div>
  );
}
