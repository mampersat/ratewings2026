import { prisma } from "@/lib/db";
import RatingForm from "@/components/RatingForm";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";

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
  const [spot, cookieStore] = await Promise.all([getSpot(id), cookies()]);
  const isAdmin = !!cookieStore.get("rw_admin")?.value;

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
      <div className="flex items-start justify-between mb-1">
        <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-200">{spot.name}</h1>
        {isAdmin && (
          <Link href={`/admin/spots/${spot.id}`} className="text-sm bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-600 shrink-0 ml-4">
            Edit Spot
          </Link>
        )}
      </div>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        {(() => {
          const addressText = [spot.address, spot.city, spot.state].filter(Boolean).join(", ");
          const mapsUrl = addressText
            ? `https://www.google.com/maps/search/${encodeURIComponent(addressText)}`
            : spot.lat && spot.lng
            ? `https://www.google.com/maps?q=${spot.lat},${spot.lng}`
            : null;
          if (!mapsUrl) return addressText || null;
          return (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 underline underline-offset-2">
              {addressText || "View in Google Maps"}
            </a>
          );
        })()}
      </p>

      {/* Score summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Overall", val: avg("overall") },
          { label: "Heat", val: avg("sauce") },
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
              <div>
                <span className="font-medium text-gray-800 dark:text-gray-100">{r.user.name}</span>
                <span className="text-gray-600 text-xs ml-2">{r.createdAt.toLocaleDateString()}</span>
              </div>
              <span className="text-orange-500 font-bold">
                {r.overall}/10
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex gap-4 mb-2">
              <span>Heat: {r.sauce}</span>
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
