import { prisma } from "@/lib/db";
import SpotCard from "@/components/SpotCard";

export const dynamic = "force-dynamic";

async function getSpots() {
  const spots = await prisma.spot.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      ratings: { select: { overall: true } },
    },
  });

  return spots.map((spot) => ({
    ...spot,
    avgOverall:
      spot.ratings.length > 0
        ? spot.ratings.reduce((sum, r) => sum + r.overall, 0) /
          spot.ratings.length
        : null,
    totalRatings: spot.ratings.length,
  }));
}

export default async function SpotsPage() {
  const spots = await getSpots();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Wing Spots</h1>
      </div>

      {spots.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          No spots yet. Be the first to add one!
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {spots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      )}
    </div>
  );
}
