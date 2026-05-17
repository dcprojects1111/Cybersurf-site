// scam.js — score the likelihood that a job listing is a recruitment scam.
//
// Returns:
//   { score: 0..100, reasons: [{ label, points }] }
//
// Weights mirror what's locked in apps/seek-job-analyser/README.md.

import {
  UPFRONT_PAYMENT_PATTERNS,
  SENSITIVE_DOC_PATTERNS,
  SUSPICIOUS_CONTACT_PATTERNS,
  TOO_GOOD_PATTERNS,
  GENERIC_TITLES,
  GENERIC_EMAIL_DOMAINS,
  matchAny,
} from "../lists/scam-signals.js";

export function scoreScam(job) {
  const reasons = [];
  const add = (label, points) => {
    if (points > 0) reasons.push({ label, points });
  };

  const haystack = [
    job.title || "",
    job.descriptionText || "",
    job.applyUrl || "",
  ].join("\n");

  // 1. Upfront payment / fees — auto-flag
  const pay = matchAny(UPFRONT_PAYMENT_PATTERNS, haystack);
  if (pay.length) {
    add(`Mentions upfront payment ("${truncate(pay[0])}")`, 50);
  }

  // 2. Sensitive doc requests
  const docs = matchAny(SENSITIVE_DOC_PATTERNS, haystack);
  if (docs.length) {
    add(`Asks for sensitive docs ("${truncate(docs[0])}")`, 50);
  }

  // 3. Apply via WhatsApp / Telegram / SMS
  const contact = matchAny(SUSPICIOUS_CONTACT_PATTERNS, haystack);
  if (contact.length) {
    add(`Suspicious apply channel ("${truncate(contact[0])}")`, 25);
  }

  // 4. Salary wildly above market for generic title
  if (job.salary?.max && job.title) {
    const max = job.salary.max;
    const isGeneric = GENERIC_TITLES.some((rx) => rx.test(job.title));
    if (isGeneric && job.salary.unit === "YEAR" && max >= 150000) {
      add(`$${max.toLocaleString()} for a generic-title role`, 30);
    }
    if (isGeneric && job.salary.unit === "HOUR" && max >= 80) {
      add(`$${max}/hr for a generic-title role`, 30);
    }
  }

  // 5. "Too good to be true" patterns
  const tooGood = matchAny(TOO_GOOD_PATTERNS, job.descriptionText || "");
  if (tooGood.length) {
    add(`Too-good-to-be-true pattern ("${truncate(tooGood[0])}")`, 25);
  }

  // 6. Generic role title
  if (job.title && GENERIC_TITLES.some((rx) => rx.test(job.title))) {
    add(`Generic role title ("${job.title}")`, 10);
  }

  // 7. Apply URL points to a free email domain
  if (job.applyUrl) {
    const emailMatch = job.applyUrl.match(/mailto:([^?]+@([^?&]+))/i);
    if (emailMatch) {
      const domain = emailMatch[2].toLowerCase();
      if (GENERIC_EMAIL_DOMAINS.includes(domain)) {
        add(`Apply via personal email domain (${domain})`, 20);
      }
    }
  }

  // 8. Vague employer footprint — heuristic only (no online check yet)
  if (!job.employer || /\b(confidential|private)\b/i.test(job.employer || "")) {
    add("Vague / undisclosed employer", 15);
  }

  const total = reasons.reduce((s, r) => s + r.points, 0);
  return {
    score: Math.min(100, total),
    reasons,
  };
}

function truncate(s, n = 40) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
