"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Spot = { id: string; name: string; city: string; state: string; _count: { ratings: number } };

export default function MergeSpotsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Spot[]>([]);
  const [primary, setPrimary] = useState<Spot | null>(null);
  const [secondaries, setSecondaries] = useState<Spot[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(q: string) {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    const res = await fetch(`/api/admin/spots/search?q=${encodeURIComponent(q)}`);
    setResults(await res.json());
  }

  function select(spot: Spot) {
    const alreadySelected = spot.id === primary?.id || secondaries.some(s => s.id === spot.id);
    if (alreadySelected) return;
    if (!primary) {
      setPrimary(spot);
      setQuery("");
      setResults([]);
    } else {
      setSecondaries(prev => [...prev, spot]);
      // keep dropdown open for multi-select
    }
  }

  async function handleMerge() {
    if (!primary || secondaries.length === 0) return;
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/admin/spots/merge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ primaryId: primary.id, secondaryIds: secondaries.map(s => s.id) }),
    });
    if (!res.ok) {
      setError((await res.json()).error ?? "Merge failed");
      setSubmitting(false);
    } else {
      router.push(`/admin/spots/${primary.id}`);
    }
  }

  const totalRatings = secondaries.reduce((sum, s) => sum + s._count.ratings, 0);

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/spots" className="text-gray-400 hover:text-gray-200 text-sm">← Back</Link>
        <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Merge Spots</h1>
      </div>

      <p className="text-gray-400 text-sm mb-6">
        Select a <strong className="text-gray-200">primary</strong> spot to keep, then add as many spots to merge into it. Their ratings will be moved over and they'll be deleted.
      </p>

      {/* Primary */}
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-1">Primary (keep)</p>
        {primary ? (
          <div className="bg-gray-800 border border-orange-500 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-gray-200 text-sm font-medium">{primary.name}</p>
              <p className="text-gray-500 text-xs">{[primary.city, primary.state].filter(Boolean).join(", ")} · {primary._count.ratings} ratings</p>
            </div>
            <button onClick={() => { setPrimary(null); setSecondaries([]); }} className="text-xs text-red-400 hover:text-red-300">Clear</button>
          </div>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-600 text-sm italic">Search to select…</div>
        )}
      </div>

      {/* Secondaries */}
      {primary && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Merge into primary ({secondaries.length} selected)</p>
          <div className="space-y-2">
            {secondaries.map(s => (
              <div key={s.id} className="bg-gray-800 border border-gray-700 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-gray-200 text-sm">{s.name}</p>
                  <p className="text-gray-500 text-xs">{[s.city, s.state].filter(Boolean).join(", ")} · {s._count.ratings} ratings</p>
                </div>
                <button onClick={() => setSecondaries(prev => prev.filter(x => x.id !== s.id))} className="text-xs text-red-400 hover:text-red-300">Remove</button>
              </div>
            ))}
            <div className="bg-gray-800 border border-dashed border-gray-700 rounded-lg p-3 text-gray-600 text-sm italic">
              Search to add more…
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <input
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder="Search spots…"
          className="w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-lg p-2 text-sm"
        />
        {results.length > 0 && (
          <ul className="absolute z-10 w-full bg-gray-800 border border-gray-700 rounded-lg mt-1 max-h-60 overflow-y-auto">
            {results.map((s) => {
              const isPrimary = s.id === primary?.id;
              const isSecondary = secondaries.some(x => x.id === s.id);
              const taken = isPrimary || isSecondary;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => select(s)}
                    disabled={taken}
                    className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm text-gray-200 disabled:cursor-default flex items-center justify-between"
                  >
                    <span>
                      {s.name}
                      <span className="text-gray-500 ml-2">{[s.city, s.state].filter(Boolean).join(", ")} · {s._count.ratings} ratings</span>
                    </span>
                    {isPrimary && <span className="text-orange-400 text-xs ml-2 shrink-0">primary</span>}
                    {isSecondary && <span className="text-green-400 text-xs ml-2 shrink-0">✓ added</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {primary && secondaries.length > 0 && (
        <div className="space-y-3">
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            onClick={handleMerge}
            disabled={submitting}
            className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
          >
            {submitting ? "Merging…" : `Merge ${secondaries.length} spot${secondaries.length > 1 ? "s" : ""} into "${primary.name}" (${totalRatings} ratings moving)`}
          </button>
        </div>
      )}
    </div>
  );
}
