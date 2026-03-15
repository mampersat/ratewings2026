import Link from "next/link";

export default function Nav() {
  return (
    <nav className="bg-orange-500 text-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          🍗 RateWings
        </Link>
        <div className="flex gap-6 text-sm font-medium">
          <Link href="/spots" className="hover:underline">
            Browse
          </Link>
          <Link href="/leaderboard" className="hover:underline">
            Leaderboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
