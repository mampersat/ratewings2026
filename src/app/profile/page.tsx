import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { updateNameAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("rw_uid")?.value;

  if (!userId) {
    return (
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-gray-100 mb-4">Your Profile</h1>
        <p className="text-gray-400">
          Submit your first rating to create an identity, then come back here to claim it with a name.
        </p>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { _count: { select: { ratings: true } } },
  });

  const ratingCount = user?._count.ratings ?? 0;
  const currentName = user?.name === "Anonymous" ? "" : (user?.name ?? "");

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-100 mb-2">Your Profile</h1>
      <p className="text-gray-400 mb-6">
        {ratingCount === 0
          ? "No ratings yet."
          : `You have ${ratingCount} rating${ratingCount === 1 ? "" : "s"}.`}
      </p>

      <form action={updateNameAction} className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Display name
          </label>
          <input
            name="name"
            required
            defaultValue={currentName}
            placeholder="What should we call you?"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm text-gray-100 placeholder-gray-400"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600"
        >
          {currentName ? "Update name" : "Claim my ratings"}
        </button>
      </form>
    </div>
  );
}
