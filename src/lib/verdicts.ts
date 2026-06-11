export type RatingKey = "overall" | "sauce" | "crispy" | "value";

// Verdict words, indexed by score (1–10 → index 0–9). Each axis says what it
// measures, not just a number — Heat reads as a spice scale, not quality.
export const RATING_VERDICTS: Record<RatingKey, readonly string[]> = {
  overall: ["Skip it", "Rough", "Meh", "Below par", "Decent", "Pretty good", "Solid", "Great", "Elite", "Legendary"],
  sauce: ["Mild", "Mild", "Warm", "Warm", "Medium", "Medium-hot", "Hot", "Fiery", "Scorching", "Nuclear"],
  crispy: ["Soggy", "Soggy", "Limp", "Soft", "Some bite", "Crisp", "Crispy", "Very crispy", "Shatter-crisp", "Shatter-crisp"],
  value: ["Rip-off", "Rip-off", "Pricey", "Pricey", "Fair", "Fair", "Good deal", "Great deal", "Steal", "Steal"],
};

// Map a 1–10 score — or a decimal average — to its verdict word.
export function verdictFor(key: RatingKey, value: number): string {
  const i = Math.min(10, Math.max(1, Math.round(value))) - 1;
  return RATING_VERDICTS[key][i];
}
