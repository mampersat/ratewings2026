"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import HoneypotField from "./HoneypotField";
import TurnstileWidget from "./TurnstileWidget";
import { HONEYPOT_FIELD } from "@/lib/honeypot";
import { TURNSTILE_FIELD } from "@/lib/turnstile";

const TURNSTILE_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type Props = {
  spotId: string;
};

type RatingKey = "overall" | "sauce" | "crispy" | "value";

// Verdict words, indexed by score (1–10 → index 0–9). The control says what
// it measures, not just a number — and Heat reads as a spice scale, not quality.
const VERDICTS: Record<RatingKey, readonly string[]> = {
  overall: ["Skip it", "Rough", "Meh", "Below par", "Decent", "Pretty good", "Solid", "Great", "Elite", "Legendary"],
  sauce: ["Mild", "Mild", "Warm", "Warm", "Medium", "Medium-hot", "Hot", "Fiery", "Scorching", "Nuclear"],
  crispy: ["Soggy", "Soggy", "Limp", "Soft", "Some bite", "Crisp", "Crispy", "Very crispy", "Shatter-crisp", "Shatter-crisp"],
  value: ["Rip-off", "Rip-off", "Pricey", "Pricey", "Fair", "Fair", "Good deal", "Great deal", "Steal", "Steal"],
};

// The signature: a literal Scoville ramp — amber climbing to nuclear red.
const HEAT_RAMP = [
  "#fde047", "#facc15", "#fbbf24", "#f59e0b", "#f97316",
  "#ea580c", "#ef4444", "#dc2626", "#b91c1c", "#7f1d1d",
];

const AXES: { key: RatingKey; label: string; heat?: boolean; hero?: boolean }[] = [
  { key: "overall", label: "Overall", hero: true },
  { key: "sauce", label: "Heat", heat: true },
  { key: "crispy", label: "Crispiness" },
  { key: "value", label: "Value" },
];

const defaultScores = (): Record<RatingKey, number> => ({
  overall: 7,
  sauce: 7,
  crispy: 7,
  value: 7,
});

function TickScale({
  axisKey,
  value,
  onChange,
  heat,
}: {
  axisKey: RatingKey;
  value: number;
  onChange: (n: number) => void;
  heat?: boolean;
}) {
  function handleKey(e: React.KeyboardEvent) {
    let next = value;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = Math.min(10, value + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(1, value - 1);
    else if (e.key === "Home") next = 1;
    else if (e.key === "End") next = 10;
    else return;
    e.preventDefault();
    onChange(next);
    // Keep keyboard focus on the newly selected tick so the focus ring tracks the value.
    const group = e.currentTarget as HTMLElement;
    (group.children[next - 1] as HTMLElement | undefined)?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={`${axisKey} rating, ${value} of 10`}
      onKeyDown={handleKey}
      className="flex gap-1"
    >
      {Array.from({ length: 10 }, (_, i) => {
        const level = i + 1;
        const filled = level <= value;
        const selected = level === value;
        const bg = !filled
          ? "#2c2521"
          : heat
          ? HEAT_RAMP[i]
          : "#f97316";
        return (
          <button
            key={level}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${level} of 10`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(level)}
            style={{
              backgroundColor: bg,
              boxShadow: selected && heat ? `0 0 12px ${HEAT_RAMP[i]}` : undefined,
            }}
            className={`h-9 flex-1 rounded-[3px] border transition-[background-color,box-shadow,transform] duration-150 motion-reduce:transition-none hover:scale-y-110 ${
              filled ? "border-transparent" : "border-[#3a322d]"
            } ${selected ? "ring-2 ring-[#f4ede2] ring-offset-2 ring-offset-[#1a1614]" : ""}`}
          />
        );
      })}
    </div>
  );
}

export default function RatingForm({ spotId }: Props) {
  const router = useRouter();
  const [scores, setScores] = useState(defaultScores());
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const handleToken = useCallback((token: string) => setTurnstileToken(token), []);

  const setScore = (key: RatingKey, n: number) =>
    setScores((s) => ({ ...s, [key]: n }));

  function ensureUserCookie() {
    if (!document.cookie.split("; ").find((c) => c.startsWith("rw_uid="))) {
      const id = crypto.randomUUID();
      document.cookie = `rw_uid=${id}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    ensureUserCookie();

    const honeypot = new FormData(e.currentTarget).get(HONEYPOT_FIELD) ?? "";

    if (TURNSTILE_ENABLED && !turnstileToken) {
      setError("Please complete the verification challenge");
      setSubmitting(false);
      return;
    }

    const res = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spotId,
        ...scores,
        notes,
        [HONEYPOT_FIELD]: honeypot,
        [TURNSTILE_FIELD]: turnstileToken,
      }),
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
    setTurnstileToken("");
    if (typeof window !== "undefined" && window.turnstile) window.turnstile.reset();
    setSubmitting(false);
  }

  const overall = scores.overall;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-[#f4ede2]">
      <HoneypotField />

      {/* Hero: the gut verdict */}
      <div className="flex items-end gap-4 border-b border-[#2c2521] pb-5">
        <span
          className="font-display leading-[0.8] text-orange-500 tabular-nums"
          style={{ fontSize: "4.5rem" }}
        >
          {overall}
        </span>
        <div className="pb-2">
          <p className="font-display text-2xl uppercase tracking-wide leading-none">
            {VERDICTS.overall[overall - 1]}
          </p>
          <p className="text-xs uppercase tracking-[0.2em] text-[#9a8d82] mt-1">
            Overall · {overall}/10
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {AXES.map(({ key, label, heat, hero }) => (
          <div key={key}>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="font-display text-sm uppercase tracking-[0.18em] text-[#f4ede2]">
                {heat && <span className="mr-1.5">🔥</span>}
                {label}
              </span>
              <span className="text-xs uppercase tracking-wide text-[#9a8d82]">
                {VERDICTS[key][scores[key] - 1]}
                <span className="text-[#f4ede2] ml-2 tabular-nums">{scores[key]}</span>
              </span>
            </div>
            <TickScale
              axisKey={key}
              value={scores[key]}
              onChange={(n) => setScore(key, n)}
              heat={heat}
            />
            {hero && (
              <p className="sr-only">Drag or use arrow keys to set your overall score.</p>
            )}
          </div>
        ))}
      </div>

      <div>
        <label
          htmlFor="rating-notes"
          className="font-display text-sm uppercase tracking-[0.18em] text-[#f4ede2] block mb-1.5"
        >
          Notes <span className="text-[#9a8d82] tracking-normal lowercase">— optional</span>
        </label>
        <textarea
          id="rating-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-lg bg-[#120f0d] border border-[#3a322d] p-3 text-sm text-[#f4ede2] placeholder:text-[#6b6058] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          placeholder="Buffalo style, extra crispy, dry-rub..."
        />
      </div>

      <TurnstileWidget onToken={handleToken} theme="dark" />
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting || (TURNSTILE_ENABLED && !turnstileToken)}
        className="w-full bg-orange-500 text-[#1a1614] py-3 rounded-lg font-display text-lg uppercase tracking-[0.15em] hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting…" : "Submit Rating"}
      </button>
    </form>
  );
}
