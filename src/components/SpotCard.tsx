import Link from "next/link";
import HeatBar from "@/components/HeatBar";
import type { SpotWithAvgRating } from "@/types";

type Props = {
  spot: SpotWithAvgRating;
  distanceKm: number | null;
};

export default function SpotCard({ spot, distanceKm }: Props) {
  const rating = spot.avgOverall?.toFixed(1) ?? "—";
  const rated = spot.avgOverall !== null;
  const dist =
    distanceKm !== null
      ? distanceKm < 1
        ? `${Math.round(distanceKm * 1000)}m`
        : `${distanceKm.toFixed(1)}km`
      : null;

  return (
    <Link href={`/spots/${spot.id}`} className="group block h-full">
      <div className="h-full flex flex-col bg-[#1a1614] border border-[#2c2521] rounded-xl p-4 hover:border-orange-500/60 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-lg uppercase leading-tight text-[#f4ede2] truncate group-hover:text-orange-400 transition-colors">
              {spot.name}
            </h2>
            <p className="text-xs text-[#9a8d82] mt-1 truncate">
              {[spot.city, spot.state].filter(Boolean).join(", ")}
              {dist && <span className="text-[#5c534c]"> · {dist}</span>}
            </p>
          </div>
          <span className="font-display text-3xl leading-none text-orange-500 tabular-nums shrink-0">
            {rating}
          </span>
        </div>

        <div className="mt-auto pt-4">
          {rated ? (
            <>
              <HeatBar value={spot.avgSauce ?? 0} />
              <p className="text-[11px] text-[#9a8d82] mt-1.5">
                {spot.totalRatings} {spot.totalRatings === 1 ? "rating" : "ratings"} · heat{" "}
                {spot.avgSauce?.toFixed(1)}
              </p>
            </>
          ) : (
            <p className="text-[11px] text-[#5c534c]">Not yet rated — be the first</p>
          )}
        </div>
      </div>
    </Link>
  );
}
