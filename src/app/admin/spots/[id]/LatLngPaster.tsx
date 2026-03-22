"use client";

import { useState } from "react";

function parseGoogleMapsUrl(url: string): { lat: number; lng: number } | null {
  // Formats:
  // /maps/@lat,lng,zoom
  // /maps/place/.../@lat,lng,zoom
  // ?q=lat,lng
  // ?ll=lat,lng
  const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };

  const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };

  const llMatch = url.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (llMatch) return { lat: parseFloat(llMatch[1]), lng: parseFloat(llMatch[2]) };

  return null;
}

export default function LatLngPaster({
  defaultLat,
  defaultLng,
}: {
  defaultLat: number | null;
  defaultLng: number | null;
}) {
  const [lat, setLat] = useState(defaultLat?.toString() ?? "");
  const [lng, setLng] = useState(defaultLng?.toString() ?? "");
  const [pasteError, setPasteError] = useState(false);

  function handleUrl(e: React.ChangeEvent<HTMLInputElement>) {
    const url = e.target.value.trim();
    if (!url) { setPasteError(false); return; }
    const result = parseGoogleMapsUrl(url);
    if (result) {
      setLat(result.lat.toString());
      setLng(result.lng.toString());
      setPasteError(false);
      e.target.value = "";
    } else {
      setPasteError(true);
    }
  }

  return (
    <div className="col-span-2 space-y-3">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Paste Google Maps URL</label>
        <input
          type="text"
          onChange={handleUrl}
          placeholder="https://www.google.com/maps/@43.145,−71.549,17z"
          className={`w-full bg-gray-900 border rounded-lg p-2 text-sm text-gray-100 placeholder-gray-600 ${pasteError ? "border-red-500" : "border-gray-600"}`}
        />
        {pasteError && <p className="text-red-400 text-xs mt-1">Couldn't parse coords from that URL.</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Lat</label>
          <input name="lat" value={lat} onChange={(e) => setLat(e.target.value)} type="number" step="any"
            className="w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-lg p-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Lng</label>
          <input name="lng" value={lng} onChange={(e) => setLng(e.target.value)} type="number" step="any"
            className="w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-lg p-2 text-sm" />
        </div>
      </div>
    </div>
  );
}
