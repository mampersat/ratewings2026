"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import HoneypotField from "@/components/HoneypotField";
import TurnstileWidget from "@/components/TurnstileWidget";
import { HONEYPOT_FIELD } from "@/lib/honeypot";
import { TURNSTILE_FIELD } from "@/lib/turnstile";

const TURNSTILE_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function NewSpotPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const handleToken = useCallback((token: string) => setTurnstileToken(token), []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (TURNSTILE_ENABLED && !turnstileToken) {
      setError("Please complete the verification challenge");
      setSubmitting(false);
      return;
    }

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      address: form.get("address"),
      city: form.get("city"),
      state: form.get("state"),
      imageUrl: null,
      [HONEYPOT_FIELD]: form.get(HONEYPOT_FIELD) ?? "",
      [TURNSTILE_FIELD]: turnstileToken,
    };

    const res = await fetch("/api/spots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      setSubmitting(false);
      return;
    }

    const spot = await res.json();
    router.push(`/spots/${spot.id}`);
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-100 mb-6">Add a Wing Spot</h1>

      <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-4">
        <HoneypotField />
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            required
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm text-gray-100 placeholder-gray-400"
            placeholder="Buffalo Wild Wings"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Address <span className="text-red-500">*</span>
          </label>
          <input
            name="address"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm text-gray-100 placeholder-gray-400"
            placeholder="123 Main St"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              City
            </label>
            <input
              name="city"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm text-gray-100 placeholder-gray-400"
              placeholder="Austin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              State
            </label>
            <input
              name="state"
              maxLength={2}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm text-gray-100 placeholder-gray-400 uppercase"
              placeholder="TX"
            />
          </div>
        </div>


<TurnstileWidget onToken={handleToken} theme="dark" />

{error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting || (TURNSTILE_ENABLED && !turnstileToken)}
          className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
        >
          {submitting ? "Adding..." : "Add Spot"}
        </button>
      </form>
    </div>
  );
}
