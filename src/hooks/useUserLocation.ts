"use client";

import { useState, useEffect } from "react";

type LocationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "granted"; lat: number; lng: number }
  | { status: "denied" };

const STORAGE_KEY = "rw_location";
const MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

function readCache(): { lat: number; lng: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { lat, lng, ts } = JSON.parse(raw);
    if (Date.now() - ts > MAX_AGE_MS) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

function writeCache(lat: number, lng: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lng, ts: Date.now() }));
  } catch {}
}

export function useUserLocation(): LocationState {
  const [state, setState] = useState<LocationState>({ status: "idle" });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ status: "denied" });
      return;
    }

    // Serve cached coords instantly, then refresh in the background
    const cached = readCache();
    if (cached) {
      setState({ status: "granted", lat: cached.lat, lng: cached.lng });
    } else {
      setState({ status: "loading" });
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        writeCache(lat, lng);
        setState({ status: "granted", lat, lng });
      },
      () => {
        if (!cached) setState({ status: "denied" });
      }
    );
  }, []);

  return state;
}
