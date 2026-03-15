import Link from "next/link";

export default function Home() {
  return (
    <div className="text-center py-16">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">🍗 RateWings</h1>
      <p className="text-xl text-gray-600 mb-8">
        Discover, review, and rank the best chicken wing spots.
      </p>
      <div className="flex gap-4 justify-center flex-wrap">
        <Link
          href="/spots"
          className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
        >
          Browse Spots
        </Link>
        <Link
          href="/leaderboard"
          className="border border-orange-500 text-orange-500 px-6 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-colors"
        >
          View Leaderboard
        </Link>
      </div>
    </div>
  );
}
