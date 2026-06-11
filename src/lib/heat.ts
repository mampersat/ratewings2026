// The heat signature: a literal Scoville ramp — amber climbing to nuclear red.
// Shared by the rating form's Heat axis, the HeatBar, and score summaries.
export const HEAT_RAMP = [
  "#fde047", "#facc15", "#fbbf24", "#f59e0b", "#f97316",
  "#ea580c", "#ef4444", "#dc2626", "#b91c1c", "#7f1d1d",
];

// Color for a given 1–10 heat score (or decimal average).
export function heatColor(value: number): string {
  return HEAT_RAMP[Math.min(10, Math.max(1, Math.round(value))) - 1];
}
