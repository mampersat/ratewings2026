"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewSpotPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      address: form.get("address"),
      city: form.get("city"),
      state: form.get("state"),
      imageUrl: form.get("imageUrl") || null,
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
      <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-200 mb-6">Add a Wing Spot</h1>

      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            required
            className="w-full border rounded-lg p-2 text-sm"
            placeholder="Buffalo Wild Wings"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Address <span className="text-red-500">*</span>
          </label>
          <input
            name="address"
            className="w-full border rounded-lg p-2 text-sm"
            placeholder="123 Main St"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              City
            </label>
            <input
              name="city"
              className="w-full border rounded-lg p-2 text-sm"
              placeholder="Austin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              State
            </label>
            <input
              name="state"
              maxLength={2}
              className="w-full border rounded-lg p-2 text-sm uppercase"
              placeholder="TX"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Image URL (optional)
          </label>
          <input
            name="imageUrl"
            type="url"
            className="w-full border rounded-lg p-2 text-sm"
            placeholder="https://..."
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
        >
          {submitting ? "Adding..." : "Add Spot"}
        </button>
      </form>
    </div>
  );
}
