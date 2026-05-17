// ghost.js — score the likelihood that a job listing is a "ghost".
//
// Returns:
//   { score: 0..100, reasons: [{ label, points }] }
//
// Weights mirror what's locked in apps/seek-job-analyser/README.md.
// Tune values here only — never silently invent new dimensions.

import { countBoilerplateHits } from "../lists/boilerplate.js";

export function scoreGhost(job, { repostCount = 0 } = {}) {
  const reasons = [];
  const add = (label, points) => {
    if (points > 0) reasons.push({ label, points });
  };

  // 1. Posting age
  if (Number.isFinite(job.ageDays)) {
    if (job.ageDays >= 60) {
      add(`Posted ${job.ageDays} days ago (60+)`, 35);
    } else if (job.ageDays >= 30) {
      add(`Posted ${job.ageDays} days ago (30+)`, 20);
    }
  }

  // 2. Salary disclosure
  if (!job.salaryDisclosed) {
    add("No salary band disclosed", 15);
  }

  // 3. Boilerplate copy
  const bp = countBoilerplateHits(job.descriptionText);
  if (bp.hits >= 3) {
    add(`Heavy boilerplate (${bp.hits} stock phrases)`, 10);
  } else if (bp.hits >= 1) {
    add(`Some boilerplate (${bp.hits} stock phrases)`, 5);
  }

  // 4. JD length anomaly
  if (job.wordCount > 0) {
    if (job.wordCount < 200) {
      add(`Very short JD (${job.wordCount} words)`, 5);
    } else if (job.wordCount > 1500) {
      add(`Very long JD (${job.wordCount} words)`, 5);
    }
  }

  // 5. Repost detection — strongest single signal
  if (repostCount >= 2) {
    add(`Reposted ${repostCount} times in our history`, 25);
  } else if (repostCount === 1) {
    add("Identical ad seen once before", 15);
  }

  // 6. Agency-posted
  if (job.employerType === "agency") {
    add("Posted by a recruitment agency", 10);
  }

  // 7. No company name / confidential employer
  if (!job.employer || /confidential|undisclosed/i.test(job.employer)) {
    add("Employer is confidential / not disclosed", 10);
  }

  // 8. Impossible requirements — basic heuristic
  if (job.descriptionText) {
    const txt = job.descriptionText.toLowerCase();
    const mentionsEntry =
      /\b(entry[- ]level|junior|graduate|new grad|no experience|trainee)\b/.test(
        txt
      );
    const yearsMatch = txt.match(/(\d+)\s*\+?\s*(years|yrs)\s+(of\s+)?experience/);
    const years = yearsMatch ? parseInt(yearsMatch[1], 10) : 0;
    if (mentionsEntry && years >= 5) {
      add(`Entry-level role demanding ${years}+ years experience`, 15);
    }
  }

  const total = reasons.reduce((s, r) => s + r.points, 0);
  return {
    score: Math.min(100, total),
    reasons,
  };
}
