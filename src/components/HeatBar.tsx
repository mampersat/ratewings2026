// A compact heat-ramp bar — the same amber→nuclear-red scale used by the
// rating form's Heat axis, reused here so the standings speak the same language.
const HEAT_RAMP = [
  "#fde047", "#facc15", "#fbbf24", "#f59e0b", "#f97316",
  "#ea580c", "#ef4444", "#dc2626", "#b91c1c", "#7f1d1d",
];

export default function HeatBar({
  value,
  size = "sm",
}: {
  value: number;
  size?: "sm" | "lg";
}) {
  const filled = Math.round(value);
  const h = size === "lg" ? "h-2.5" : "h-1.5";
  return (
    <div className="flex gap-0.5" aria-hidden>
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className={`${h} flex-1 rounded-[2px]`}
          style={{ backgroundColor: i < filled ? HEAT_RAMP[i] : "#2c2521" }}
        />
      ))}
    </div>
  );
}
