import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { updateSpotAction, deleteRatingAction } from "../../actions";
import LatLngPaster from "./LatLngPaster";

export const dynamic = "force-dynamic";

export default async function AdminEditSpotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  if (!cookieStore.get("rw_admin")?.value) redirect("/admin");

  const { id } = await params;
  const spot = await prisma.spot.findUnique({
    where: { id },
    include: {
      ratings: {
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!spot) notFound();

  const updateAction = updateSpotAction.bind(null, id);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/spots" className="text-gray-400 hover:text-gray-200 text-sm">← Back</Link>
        <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Edit Spot</h1>
      </div>

      <form action={updateAction} className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-4 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input name="name" defaultValue={spot.name} required
              className="w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-lg p-2 text-sm" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Address</label>
            <input name="address" defaultValue={spot.address}
              className="w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-lg p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">City</label>
            <input name="city" defaultValue={spot.city}
              className="w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-lg p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">State</label>
            <input name="state" defaultValue={spot.state} maxLength={2}
              className="w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-lg p-2 text-sm uppercase" />
          </div>
          <LatLngPaster defaultLat={spot.lat} defaultLng={spot.lng} />
          <div className="col-span-2">
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(`${spot.name} ${spot.address} ${spot.city} ${spot.state}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-orange-400 hover:text-orange-300 underline"
            >
              Look up on Google Maps ↗
            </a>
          </div>
        </div>
        <button type="submit"
          className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600">
          Save
        </button>
      </form>

      <h2 className="text-lg font-semibold text-gray-200 mb-3">
        Ratings ({spot.ratings.length})
      </h2>
      <div className="space-y-2">
        {spot.ratings.map((r) => (
          <div key={r.id} className="bg-gray-800 border border-gray-700 rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="text-gray-300 text-sm font-medium">{r.user.name}</span>
              <span className="text-gray-500 text-xs ml-2">{r.user.email}</span>
              <div className="text-xs text-gray-500 mt-0.5">
                Overall: {r.overall} · Heat: {r.sauce} · Crispy: {r.crispy} · Value: {r.value}
                {r.notes && <span className="ml-2 italic">"{r.notes}"</span>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/admin/ratings/${r.id}`} className="text-orange-400 hover:text-orange-300 text-sm">Edit</Link>
              <form action={deleteRatingAction.bind(null, r.id, id)}>
                <button type="submit" className="text-red-400 hover:text-red-300 text-sm">Delete</button>
              </form>
            </div>
          </div>
        ))}
        {spot.ratings.length === 0 && (
          <p className="text-gray-500 text-sm">No ratings yet.</p>
        )}
      </div>
    </div>
  );
}
