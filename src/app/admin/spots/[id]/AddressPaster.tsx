"use client";

import { useState } from "react";

// Splits a US-style address like "921 S 10th St, Manitowoc, WI 54220" into
// street / city / state. Tolerates a trailing country and extra street commas
// (e.g. "..., Suite 4, ..."), and a missing/zip-only trailing segment.
function parseAddress(
  input: string
): { address: string; city: string; state: string } | null {
  let s = input.trim();
  if (!s) return null;
  s = s.replace(/,\s*(USA|United States|US)\.?\s*$/i, "").trim();

  const parts = s.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;

  const last = parts[parts.length - 1];
  const stateMatch = last.match(/\b([A-Za-z]{2})\b(?:\s+\d{5}(?:-\d{4})?)?$/);

  let state = "";
  let cityIdx: number;
  if (stateMatch) {
    state = stateMatch[1].toUpperCase();
    cityIdx = parts.length - 2; // city is the segment before "ST 12345"
  } else {
    cityIdx = parts.length - 1; // no state token — treat the last segment as city
  }

  if (cityIdx < 1) return null; // need at least one segment left for the street
  const city = parts[cityIdx];
  const address = parts.slice(0, cityIdx).join(", ");
  if (!address || !city) return null;

  return { address, city, state };
}

export default function AddressPaster({
  defaultAddress,
  defaultCity,
  defaultState,
}: {
  defaultAddress: string;
  defaultCity: string;
  defaultState: string;
}) {
  const [address, setAddress] = useState(defaultAddress ?? "");
  const [city, setCity] = useState(defaultCity ?? "");
  const [state, setState] = useState(defaultState ?? "");
  const [pasteError, setPasteError] = useState(false);

  function handlePaste(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (!val.trim()) {
      setPasteError(false);
      return;
    }
    const parsed = parseAddress(val);
    if (parsed) {
      setAddress(parsed.address);
      setCity(parsed.city);
      if (parsed.state) setState(parsed.state);
      setPasteError(false);
      e.target.value = "";
    } else {
      // Only complain once it looks like a real attempt, not mid-typing.
      setPasteError(val.includes(","));
    }
  }

  const inputCls =
    "w-full bg-gray-900 border border-gray-600 text-gray-100 rounded-lg p-2 text-sm";

  return (
    <>
      <div className="col-span-2">
        <label className="block text-sm text-gray-400 mb-1">Paste full address</label>
        <input
          type="text"
          onChange={handlePaste}
          placeholder="921 S 10th St, Manitowoc, WI 54220"
          className={`w-full bg-gray-900 border rounded-lg p-2 text-sm text-gray-100 placeholder-gray-600 ${
            pasteError ? "border-red-500" : "border-gray-600"
          }`}
        />
        {pasteError && (
          <p className="text-red-400 text-xs mt-1">
            Couldn&apos;t split that into street, city, and state.
          </p>
        )}
      </div>
      <div className="col-span-2">
        <label className="block text-sm text-gray-400 mb-1">Address</label>
        <input
          name="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">City</label>
        <input
          name="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">State</label>
        <input
          name="state"
          value={state}
          onChange={(e) => setState(e.target.value.toUpperCase())}
          maxLength={2}
          className={`${inputCls} uppercase`}
        />
      </div>
    </>
  );
}
