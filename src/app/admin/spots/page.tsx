import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import DeleteSpotButton from "./DeleteSpotButton";

export const dynamic = "force-dynamic";

const DEFAULT_LAT = 42.9023;
const DEFAULT_LNG = -78.868;

export default async function AdminSpotsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const cookieStore = await cookies();
  if (!cookieStore.get("rw_admin")?.value) redirect("/admin");

  const { filter } = await searchParams;
  const defaultCoordsOnly = filter === "default_coords";

  const spots = await prisma.spot.findMany({
    where: defaultCoordsOnly
      ? { lat: DEFAULT_LAT, lng: DEFAULT_LNG }
      : undefined,
    orderBy: { name: "asc" },
    include: { _count: { select: { ratings: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Admin — Spots</h1>
        <Link href="/admin/spots/merge" className="text-sm bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
          Merge Spots
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        <Link
          href="/admin/spots"
          className={`text-sm px-3 py-1.5 rounded-lg border ${!defaultCoordsOnly ? "bg-orange-500 border-orange-500 text-white" : "border-gray-700 text-gray-400 hover:text-gray-200"}`}
        >
          All ({defaultCoordsOnly ? "…" : spots.length})
        </Link>
        <Link
          href="/admin/spots?filter=default_coords"
          className={`text-sm px-3 py-1.5 rounded-lg border ${defaultCoordsOnly ? "bg-yellow-600 border-yellow-600 text-white" : "border-gray-700 text-gray-400 hover:text-gray-200"}`}
        >
          Default coords ({defaultCoordsOnly ? spots.length : "?"})
        </Link>
      </div>

      {defaultCoordsOnly && (
        <p className="text-sm text-yellow-500 mb-4">
          These spots share a placeholder coordinate (42.9023, -78.868) from the original import — their real locations are unknown. Edit each to set correct lat/lng.
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 text-left">
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2 pr-4">Address</th>
              <th className="pb-2 pr-4">City</th>
              <th className="pb-2 pr-4">State</th>
              <th className="pb-2 pr-4 text-center">Ratings</th>
              <th className="pb-2 pr-4 text-center">Coords</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {spots.map((spot) => {
              const isDefault = spot.lat === DEFAULT_LAT && spot.lng === DEFAULT_LNG;
              return (
                <tr key={spot.id} className={`border-b border-gray-800 hover:bg-gray-800/50 ${isDefault ? "bg-yellow-900/10" : ""}`}>
                  <td className="py-2 pr-4 text-gray-200">{spot.name}</td>
                  <td className="py-2 pr-4 text-gray-400">{spot.address}</td>
                  <td className="py-2 pr-4 text-gray-400">{spot.city}</td>
                  <td className="py-2 pr-4 text-gray-400">{spot.state}</td>
                  <td className="py-2 pr-4 text-center text-gray-400">{spot._count.ratings}</td>
                  <td className="py-2 pr-4 text-center">
                    {isDefault
                      ? <span className="text-yellow-500 text-xs">default</span>
                      : spot.lat
                      ? <span className="text-gray-500">✓</span>
                      : <span className="text-gray-700">—</span>}
                  </td>
                  <td className="py-2 flex gap-3">
                    <Link href={`/admin/spots/${spot.id}`} className="text-orange-400 hover:text-orange-300">
                      Edit
                    </Link>
                    <DeleteSpotButton id={spot.id} name={spot.name} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
