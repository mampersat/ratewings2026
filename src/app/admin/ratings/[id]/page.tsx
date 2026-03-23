import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { updateRatingAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function AdminEditRatingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  if (!cookieStore.get("rw_admin")?.value) redirect("/admin");

  const { id } = await params;
  const rating = await prisma.rating.findUnique({
    where: { id },
    include: {
      spot: { select: { id: true, name: true } },
      user: { select: { name: true, email: true } },
    },
  });

  if (!rating) notFound();

  const updateAction = updateRatingAction.bind(null, id, rating.spot.id);

  const fields: { name: "overall" | "sauce" | "crispy" | "value"; label: string }[] = [
    { name: "overall", label: "Overall" },
    { name: "sauce",   label: "Heat (sauce)" },
    { name: "crispy",  label: "Crispy" },
    { name: "value",   label: "Value" },
  ];

  return (
    <div className="max-w-md">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/spots/${rating.spot.id}`} className="text-gray-400 hover:text-gray-200 text-sm">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Edit Rating</h1>
      </div>

      <p className="text-sm text-gray-400 mb-6">
        <span className="text-gray-200">{rating.user.name}</span>
        <span className="ml-2 text-gray-500">{rating.user.email}</span>
        <span className="mx-2 text-gray-600">·</span>
        <span className="text-gray-300">{rating.spot.name}</span>
      </p>

      <form action={updateAction} className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-4">
        {fields.map(({ name, label }) => (
          <div key={name}>
            <label className="block text-sm text-gray-400 mb-1">{label} (1–10)</label>
            <input
              name={name}
              type="number"
              min={1}
              max={10}
              defaultValue={rating[name]}
              required
              className="w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-lg p-2 text-sm"
            />
          </div>
        ))}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Notes</label>
          <textarea
            name="notes"
            defaultValue={rating.notes ?? ""}
            rows={3}
            className="w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-lg p-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600"
        >
          Save
        </button>
      </form>
    </div>
  );
}
