import Link from "next/link";
import type { SpotWithAvgRating } from "@/types";

type Props = {
  spot: SpotWithAvgRating;
  distanceKm: number | null;
};

export default function SpotCard({ spot, distanceKm }: Props) {
  const rating = spot.avgOverall?.toFixed(1) ?? "—";
  const heat = spot.avgSauce?.toFixed(1) ?? null;

  return (
    <Link href={`/spots/${spot.id}`}>
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow">
        {spot.imageUrl && (
          <img
            src={spot.imageUrl}
            alt={spot.name}
            className="w-full h-40 object-cover rounded-lg mb-3"
          />
        )}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-semibold text-gray-100">{spot.name}</h2>
            <p className="text-sm text-gray-400">
              {[spot.city, spot.state].filter(Boolean).join(", ")}
              {distanceKm !== null && (
                <span className="ml-2 text-gray-500">
                  · {distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)}km`}
                </span>
              )}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-2xl font-bold text-orange-500">{rating}</span>
            {heat && <span className="text-xs text-red-400 ml-1">🌶 {heat}</span>}
            <p className="text-xs text-gray-400">{spot.totalRatings} ratings</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
