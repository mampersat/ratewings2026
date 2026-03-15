import Link from "next/link";
import type { SpotWithAvgRating } from "@/types";

type Props = {
  spot: SpotWithAvgRating;
};

export default function SpotCard({ spot }: Props) {
  const rating = spot.avgOverall?.toFixed(1) ?? "—";

  return (
    <Link href={`/spots/${spot.id}`}>
      <div className="border rounded-xl p-4 hover:shadow-md transition-shadow bg-white">
        {spot.imageUrl && (
          <img
            src={spot.imageUrl}
            alt={spot.name}
            className="w-full h-40 object-cover rounded-lg mb-3"
          />
        )}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-semibold text-gray-900">{spot.name}</h2>
            <p className="text-sm text-gray-500">
              {spot.city}, {spot.state}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-2xl font-bold text-orange-500">{rating}</span>
            <p className="text-xs text-gray-400">{spot.totalRatings} ratings</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
