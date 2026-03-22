"use client";

import { useMemo, useState } from "react";
import SpotCard from "@/components/SpotCard";
import { useUserLocation } from "@/hooks/useUserLocation";
import type { SpotWithAvgRating } from "@/types";

const MI_TO_KM = 1.60934;

const DISTANCE_OPTIONS = [
  { label: "Any distance", value: null },
  { label: "Within 10 mi", value: 10 },
  { label: "Within 25 mi", value: 25 },
  { label: "Within 50 mi", value: 50 },
  { label: "Within 100 mi", value: 100 },
];

const RATINGS_OPTIONS = [
  { label: "Any", value: 0 },
  { label: "1+", value: 1 },
  { label: "2+", value: 2 },
  { label: "5+", value: 5 },
  { label: "10+", value: 10 },
];

type SortKey = "distance" | "rating" | "ratings_count" | "heat" | "newest";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type Props = { spots: SpotWithAvgRating[] };

export default function SpotsList({ spots }: Props) {
  const location = useUserLocation();
  const hasLocation = location.status === "granted";

  const [query, setQuery] = useState("");
  const [maxMiles, setMaxMiles] = useState<number | null>(null);
  const [minRatings, setMinRatings] = useState(0);
  const [sortBy, setSortBy] = useState<SortKey>("distance");

  const getDistance = (spot: SpotWithAvgRating): number | null => {
    if (!hasLocation || !spot.lat || !spot.lng) return null;
    return haversineKm(location.lat, location.lng, spot.lat, spot.lng);
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return spots.filter((spot) => {
      if (q && !spot.name.toLowerCase().includes(q) && !spot.city.toLowerCase().includes(q)) return false;
      if (minRatings > 0 && spot.totalRatings < minRatings) return false;
      if (maxMiles !== null) {
        const d = getDistance(spot);
        if (d === null || d > maxMiles * MI_TO_KM) return false;
      }
      return true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spots, location, query, maxMiles, minRatings]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === "rating") {
        return (b.avgOverall ?? -1) - (a.avgOverall ?? -1);
      }
      if (sortBy === "heat") {
        return (b.avgSauce ?? -1) - (a.avgSauce ?? -1);
      }
      if (sortBy === "ratings_count") {
        return b.totalRatings - a.totalRatings;
      }
      if (sortBy === "newest") {
        return (b.latestRating?.getTime() ?? 0) - (a.latestRating?.getTime() ?? 0);
      }
      // distance
      const dA = getDistance(a);
      const dB = getDistance(b);
      if (dA === null && dB === null) return 0;
      if (dA === null) return 1;
      if (dB === null) return -1;
      return dA - dB;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sortBy, location]);

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-6">
        <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-200">Wing Spots</h1>
        {location.status === "loading" && (
          <span className="text-sm text-gray-500">
            Finding your location<AnimatedDots />
          </span>
        )}
      </div>
      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6 items-end">
        <div className="flex-1 min-w-48">
          <label className="block text-xs text-gray-500 mb-1">Search</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or city…"
            className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-1.5 text-sm placeholder-gray-600"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Sort by</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="distance" disabled={!hasLocation}>
              {hasLocation ? "Distance" : "Distance (no location)"}
            </option>
            <option value="rating">Rating</option>
            <option value="heat">Heat</option>
            <option value="ratings_count">Most rated</option>
            <option value="newest">Newest rating</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Distance</label>
          <select
            value={maxMiles ?? ""}
            onChange={(e) => setMaxMiles(e.target.value ? Number(e.target.value) : null)}
            disabled={!hasLocation}
            className="bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-1.5 text-sm disabled:opacity-40"
          >
            {DISTANCE_OPTIONS.map((o) => (
              <option key={o.label} value={o.value ?? ""}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Min ratings</label>
          <select
            value={minRatings}
            onChange={(e) => setMinRatings(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-1.5 text-sm"
          >
            {RATINGS_OPTIONS.map((o) => (
              <option key={o.label} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <p className="text-xs text-gray-500 ml-auto self-end pb-1.5">
          {sorted.length} spot{sorted.length !== 1 ? "s" : ""}
        </p>
      </div>

      {sorted.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No spots match your filters.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((spot) => (
            <SpotCard key={spot.id} spot={spot} distanceKm={getDistance(spot)} />
          ))}
        </div>
      )}
    </div>
  );
}

function AnimatedDots() {
  return (
    <span className="inline-flex gap-px">
      <span className="animate-bounce [animation-delay:0ms]">.</span>
      <span className="animate-bounce [animation-delay:150ms]">.</span>
      <span className="animate-bounce [animation-delay:300ms]">.</span>
    </span>
  );
}
