import Link from "next/link";

const linkFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1614] rounded";

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
      <nav className="bg-[#1a1614]">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/" className={`group flex items-center gap-2 ${linkFocus}`}>
            <span className="text-xl" aria-hidden>
              🍗
            </span>
            <span className="font-display text-2xl sm:text-3xl uppercase tracking-tight leading-none">
              <span className="text-[#f4ede2] transition-colors group-hover:text-white">
                Rate
              </span>
              <span className="text-orange-500">Wings</span>
            </span>
          </Link>

          <div className="flex items-center gap-5 sm:gap-7">
            <Link
              href="/spots"
              className={`font-display text-sm uppercase tracking-[0.16em] text-[#f4ede2] transition-colors hover:text-orange-400 ${linkFocus}`}
            >
              Browse
            </Link>
            <Link
              href="/spots/new"
              className={`font-display text-sm uppercase tracking-[0.12em] whitespace-nowrap bg-orange-500 text-[#1a1614] px-3.5 py-1.5 rounded-lg transition-colors hover:bg-orange-400 ${linkFocus}`}
            >
              + Add Spot
            </Link>
          </div>
        </div>

        {/* Signature: the heat ramp, carried up from the rating form's Heat scale */}
        <div
          className="h-[3px] w-full"
          style={{
            background:
              "linear-gradient(to right, #fde047, #f59e0b, #f97316, #ef4444, #b91c1c, #7f1d1d)",
          }}
          aria-hidden
        />
      </nav>
    </header>
  );
}
