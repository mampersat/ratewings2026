import { prisma } from "@/lib/db";
import RatingForm from "@/components/RatingForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getSpot(id: string) {
  return prisma.spot.findUnique({
    where: { id },
    include: {
      ratings: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export default async function SpotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const spot = await getSpot(id);

  if (!spot) notFound();

  const avg = (key: "overall" | "sauce" | "crispy" | "value") =>
    spot.ratings.length > 0
      ? (
          spot.ratings.reduce((sum, r) => sum + r[key], 0) /
          spot.ratings.length
        ).toFixed(1)
      : "—";

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-200 mb-1">{spot.name}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        {spot.address}, {spot.city}, {spot.state}
      </p>

      {/* Score summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Overall", val: avg("overall") },
          { label: "Sauce", val: avg("sauce") },
          { label: "Crispiness", val: avg("crispy") },
          { label: "Value", val: avg("value") },
        ].map(({ label, val }) => (
          <div key={label} className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-orange-500">{val}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Rating form */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Leave a Rating</h2>
        <RatingForm spotId={spot.id} />
      </div>

      {/* Reviews list */}
      <h2 className="text-lg font-semibold mb-4">
        Reviews ({spot.ratings.length})
      </h2>
      <div className="space-y-4">
        {spot.ratings.map((r) => (
          <div key={r.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-gray-800 dark:text-gray-100">{r.user.name}</span>
              <span className="text-orange-500 font-bold">
                {r.overall}/10
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex gap-4 mb-2">
              <span>Sauce: {r.sauce}</span>
              <span>Crispy: {r.crispy}</span>
              <span>Value: {r.value}</span>
            </div>
            {r.notes && <p className="text-sm text-gray-700 dark:text-gray-200">{r.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
