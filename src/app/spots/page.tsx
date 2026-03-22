import { prisma } from "@/lib/db";
import SpotsList from "@/components/SpotsList";

export const dynamic = "force-dynamic";

async function getSpots() {
  const spots = await prisma.spot.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      ratings: { select: { overall: true, sauce: true, createdAt: true } },
    },
  });

  return spots.map((spot) => ({
    ...spot,
    avgOverall: spot.ratings.length > 0
      ? spot.ratings.reduce((sum, r) => sum + r.overall, 0) / spot.ratings.length
      : null,
    avgSauce: spot.ratings.length > 0
      ? spot.ratings.reduce((sum, r) => sum + r.sauce, 0) / spot.ratings.length
      : null,
    totalRatings: spot.ratings.length,
    latestRating: spot.ratings.length > 0
      ? spot.ratings.reduce((latest, r) => r.createdAt > latest ? r.createdAt : latest, spot.ratings[0].createdAt)
      : null,
  }));
}

export default async function SpotsPage() {
  const spots = await getSpots();

  return (
    <div>
      <SpotsList spots={spots} />
    </div>
  );
}
