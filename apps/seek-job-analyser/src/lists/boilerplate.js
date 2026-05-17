// boilerplate.js — stock phrases that appear in vague/template job ads.
// Higher hit-count == higher ghost score.
// Curated, not exhaustive — tune as we see real SEEK data.

export const BOILERPLATE_PHRASES = [
  "fast-paced environment",
  "fast paced environment",
  "wear many hats",
  "team player",
  "self-starter",
  "self starter",
  "go-getter",
  "rock star",
  "rockstar",
  "ninja",
  "guru",
  "various duties as assigned",
  "other duties as required",
  "excellent communication skills",
  "strong communication skills",
  "attention to detail",
  "hit the ground running",
  "dynamic team",
  "passionate about",
  "thinks outside the box",
  "outside the box",
  "results driven",
  "results-driven",
  "highly motivated",
  "ability to work independently",
  "work well under pressure",
  "growing company",
  "exciting opportunity",
  "great opportunity",
  "amazing opportunity",
  "join our team",
  "be part of",
  "competitive salary",
  "competitive remuneration",
];

export function countBoilerplateHits(text) {
  if (!text) return { hits: 0, matched: [] };
  const lower = text.toLowerCase();
  const matched = [];
  for (const phrase of BOILERPLATE_PHRASES) {
    if (lower.includes(phrase)) matched.push(phrase);
  }
  return { hits: matched.length, matched };
}
