"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import Link from "next/link";
import HeatBar from "@/components/HeatBar";
import type { SpotWithAvgRating } from "@/types";

type Props = {
  spots: SpotWithAvgRating[];
  center: { lat: number; lng: number } | null;
  getDistance: (s: SpotWithAvgRating) => number | null;
};

// A spot definitely has coords once filtered — narrow the type so lat/lng are numbers.
type LocatedSpot = SpotWithAvgRating & { lat: number; lng: number };

// On-brand pin built with divIcon — avoids Leaflet's bundler-broken default marker
// images and lets the pin show the rating in the wing-scorecard style.
function ratingIcon(spot: LocatedSpot): L.DivIcon {
  const label = spot.avgOverall?.toFixed(1) ?? "—";
  return L.divIcon({
    className: "",
    html: `<div style="
      display:flex;align-items:center;justify-content:center;
      width:34px;height:34px;border-radius:9999px;
      background:#1a1614;border:2px solid #f97316;
      color:#f97316;font-family:var(--font-display,sans-serif);
      font-size:13px;font-weight:700;line-height:1;
      box-shadow:0 1px 4px rgba(0,0,0,.5);">${label}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

// Centers the map on the user/city location, or fits to all plotted markers.
// Re-runs when the location changes (e.g. the user picks a different city).
function FitView({ center, points }: { center: Props["center"]; points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], 11);
    } else if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 13 });
    }
    // `points` intentionally omitted: refit on location change, not on every filter tweak.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center?.lat, center?.lng]);
  return null;
}

export default function SpotsMap({ spots, center, getDistance }: Props) {
  const located = spots.filter((s): s is LocatedSpot => s.lat != null && s.lng != null);
  const hidden = spots.length - located.length;
  const points = located.map((s) => [s.lat, s.lng] as [number, number]);

  // Fallback view when there's neither a location nor any plottable spot.
  const fallbackCenter: [number, number] = center
    ? [center.lat, center.lng]
    : points[0] ?? [39.8283, -98.5795]; // geographic center of the US

  return (
    <div>
      <div className="h-[70vh] rounded-xl overflow-hidden border border-[#2c2521]">
        <MapContainer
          center={fallbackCenter}
          zoom={center ? 11 : 4}
          scrollWheelZoom
          style={{ height: "100%", width: "100%", background: "#120f0d" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitView center={center} points={points} />
          {located.map((spot) => {
            const dist = getDistance(spot);
            const distLabel =
              dist !== null
                ? dist < 1
                  ? `${Math.round(dist * 1000)}m`
                  : `${dist.toFixed(1)}km`
                : null;
            return (
              <Marker key={spot.id} position={[spot.lat, spot.lng]} icon={ratingIcon(spot)}>
                <Popup>
                  <Link href={`/spots/${spot.id}`} className="block min-w-44">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-display text-base uppercase leading-tight text-[#f4ede2] truncate">
                          {spot.name}
                        </p>
                        <p className="text-xs text-[#9a8d82] mt-0.5 truncate">
                          {[spot.city, spot.state].filter(Boolean).join(", ")}
                          {distLabel && <span className="text-[#5c534c]"> · {distLabel}</span>}
                        </p>
                      </div>
                      <span className="font-display text-2xl leading-none text-orange-500 tabular-nums shrink-0">
                        {spot.avgOverall?.toFixed(1) ?? "—"}
                      </span>
                    </div>
                    {spot.avgOverall !== null ? (
                      <div className="mt-2">
                        <HeatBar value={spot.avgSauce ?? 0} />
                        <p className="text-[11px] text-[#9a8d82] mt-1">
                          {spot.totalRatings} {spot.totalRatings === 1 ? "rating" : "ratings"} · heat{" "}
                          {spot.avgSauce?.toFixed(1)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-[#5c534c] mt-2">Not yet rated — be the first</p>
                    )}
                  </Link>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
      {hidden > 0 && (
        <p className="text-xs text-[#9a8d82] mt-2">
          {hidden} spot{hidden !== 1 ? "s" : ""} hidden — no map location yet
        </p>
      )}
    </div>
  );
}
