"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  spotId: string;
};

const FIELDS = [
  { key: "overall", label: "Overall" },
  { key: "sauce", label: "Heat" },
  { key: "crispy", label: "Crispiness" },
  { key: "value", label: "Value" },
] as const;

type RatingKey = (typeof FIELDS)[number]["key"];

const defaultScores = (): Record<RatingKey, number> => ({
  overall: 7,
  sauce: 7,
  crispy: 7,
  value: 7,
});

export default function RatingForm({ spotId }: Props) {
  const router = useRouter();
  const [scores, setScores] = useState(defaultScores());
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spotId, ...scores, notes }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      setSubmitting(false);
      return;
    }

    router.refresh();
    setScores(defaultScores());
    setNotes("");
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {FIELDS.map(({ key, label }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            {label}: <span className="text-orange-500 font-bold">{scores[key]}</span>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={scores[key]}
            onChange={(e) =>
              setScores((s) => ({ ...s, [key]: Number(e.target.value) }))
            }
            className="w-full accent-orange-500"
          />
        </div>
      ))}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full border rounded-lg p-2 text-sm"
          placeholder="Buffalo style, extra crispy..."
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Rating"}
      </button>
    </form>
  );
}
