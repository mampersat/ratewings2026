import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import DeleteRatingButton from "./DeleteRatingButton";

export const dynamic = "force-dynamic";

type Filter = "all" | "sevens" | "flat" | "nonotes";
type Sort = "new" | "old" | "flat" | "overall" | "spot" | "user";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "sevens", label: "All 7s" },
  { key: "flat", label: "Flat (uniform)" },
  { key: "nonotes", label: "No notes" },
];

const SORTS: { key: Sort; label: string }[] = [
  { key: "new", label: "Newest" },
  { key: "old", label: "Oldest" },
  { key: "flat", label: "Flattest" },
  { key: "overall", label: "Overall ↓" },
  { key: "spot", label: "Spot" },
  { key: "user", label: "User" },
];

export default async function AdminRatingsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: Filter; sort?: Sort }>;
}) {
  const cookieStore = await cookies();
  if (!cookieStore.get("rw_admin")?.value) redirect("/admin");

  const { filter = "all", sort = "new" } = await searchParams;

  const ratings = await prisma.rating.findMany({
    include: {
      spot: { select: { id: true, name: true } },
      user: { select: { name: true, email: true } },
    },
  });

  const withMeta = ratings.map((r) => {
    const vals = [r.overall, r.sauce, r.crispy, r.value];
    const spread = Math.max(...vals) - Math.min(...vals);
    const isFlat = spread === 0;
    return { ...r, spread, isFlat, isSevens: isFlat && r.overall === 7 };
  });

  const counts: Record<Filter, number> = {
    all: withMeta.length,
    sevens: withMeta.filter((r) => r.isSevens).length,
    flat: withMeta.filter((r) => r.isFlat).length,
    nonotes: withMeta.filter((r) => !r.notes).length,
  };

  let list = withMeta;
  if (filter === "sevens") list = list.filter((r) => r.isSevens);
  else if (filter === "flat") list = list.filter((r) => r.isFlat);
  else if (filter === "nonotes") list = list.filter((r) => !r.notes);

  list = [...list].sort((a, b) => {
    switch (sort) {
      case "old": return a.createdAt.getTime() - b.createdAt.getTime();
      case "flat": return a.spread - b.spread || b.createdAt.getTime() - a.createdAt.getTime();
      case "overall": return b.overall - a.overall || b.createdAt.getTime() - a.createdAt.getTime();
      case "spot": return a.spot.name.localeCompare(b.spot.name);
      case "user": return a.user.name.localeCompare(b.user.name);
      default: return b.createdAt.getTime() - a.createdAt.getTime();
    }
  });

  // Build a query string preserving the param we're not changing.
  const href = (f: Filter, s: Sort) => {
    const p = new URLSearchParams();
    if (f !== "all") p.set("filter", f);
    if (s !== "new") p.set("sort", s);
    const str = p.toString();
    return str ? `/admin/ratings?${str}` : "/admin/ratings";
  };

  // Current view's query string, so a delete redirects back to the same filter/sort.
  const currentQuery = href(filter, sort).replace("/admin/ratings", "");

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Admin — Ratings</h1>
        <Link href="/admin/spots" className="text-sm text-gray-400 hover:text-gray-200 border border-gray-700 px-4 py-2 rounded-lg">
          Spots →
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs text-gray-500 mr-1">Filter:</span>
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={href(f.key, sort)}
            className={`text-sm px-3 py-1.5 rounded-lg border ${
              filter === f.key
                ? "bg-orange-500 border-orange-500 text-white"
                : "border-gray-700 text-gray-400 hover:text-gray-200"
            }`}
          >
            {f.label} ({counts[f.key]})
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs text-gray-500 mr-1">Sort:</span>
        {SORTS.map((s) => (
          <Link
            key={s.key}
            href={href(filter, s.key)}
            className={`text-sm px-3 py-1.5 rounded-lg border ${
              sort === s.key
                ? "bg-gray-700 border-gray-600 text-gray-100"
                : "border-gray-700 text-gray-400 hover:text-gray-200"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Showing {list.length} of {counts.all}. Flat ratings (all four axes equal) are highlighted — the
        all-7s case is the untouched default form, a strong spam signal.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 text-left">
              <th className="pb-2 pr-4">Spot</th>
              <th className="pb-2 pr-4">User</th>
              <th className="pb-2 pr-4">Date</th>
              <th className="pb-2 pr-4 text-center" title="Overall · Heat · Crispy · Value">Scores</th>
              <th className="pb-2 pr-4">Notes</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr
                key={r.id}
                className={`border-b border-gray-800 hover:bg-gray-800/50 ${
                  r.isSevens ? "bg-red-900/15" : r.isFlat ? "bg-yellow-900/10" : ""
                }`}
              >
                <td className="py-2 pr-4">
                  <Link href={`/admin/spots/${r.spot.id}`} className="text-gray-200 hover:text-orange-300">
                    {r.spot.name}
                  </Link>
                </td>
                <td className="py-2 pr-4 text-gray-400">
                  <div>{r.user.name}</div>
                  <div className="text-gray-600 text-xs">{r.user.email}</div>
                </td>
                <td className="py-2 pr-4 text-gray-500 whitespace-nowrap">{r.createdAt.toLocaleDateString()}</td>
                <td className="py-2 pr-4 text-center whitespace-nowrap">
                  <span
                    title={`Overall ${r.overall} · Heat ${r.sauce} · Crispy ${r.crispy} · Value ${r.value}`}
                    className={`font-mono ${
                      r.isSevens ? "text-red-400 font-medium" : r.isFlat ? "text-yellow-500" : "text-gray-300"
                    }`}
                  >
                    {r.overall}·{r.sauce}·{r.crispy}·{r.value}
                  </span>
                  {r.isSevens ? (
                    <span className="text-red-400 text-xs ml-1.5">7s</span>
                  ) : r.isFlat ? (
                    <span className="text-yellow-500 text-xs ml-1.5">flat</span>
                  ) : null}
                </td>
                <td className="py-2 pr-4 text-gray-500 max-w-[12rem] truncate">
                  {r.notes ? <span className="italic">&ldquo;{r.notes}&rdquo;</span> : <span className="text-gray-700">—</span>}
                </td>
                <td className="py-2 flex gap-3">
                  <Link href={`/admin/ratings/${r.id}`} className="text-orange-400 hover:text-orange-300">
                    Edit
                  </Link>
                  <DeleteRatingButton id={r.id} label={`${r.user.name} · ${r.spot.name}`} query={currentQuery} />
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-500">No ratings match this filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
