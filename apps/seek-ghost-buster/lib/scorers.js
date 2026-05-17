// scorers.js — Ghost + Scam scoring, plus traffic-light verdict.
//
// Locked thresholds (do not change without scope sign-off):
//   GREEN  : Ghost < 40 AND Scam < 25
//   ORANGE : Ghost 40-70 OR Scam 25-50
//   RED    : Ghost > 70 OR Scam > 50

(function () {
  window.__SGB = window.__SGB || {};

  function lists() {
    return window.__SGB.lists || {};
  }

  function matchAny(patterns, haystack) {
    if (!haystack || !patterns) return [];
    const out = [];
    for (const p of patterns) {
      const m = haystack.match(p);
      if (m) out.push(m[0]);
    }
    return out;
  }

  function truncate(s, n) {
    n = n || 40;
    if (!s) return "";
    return s.length > n ? s.slice(0, n - 1) + "…" : s;
  }

  // ----- Ghost ----------------------------------------------------------

  function scoreGhost(job, opts) {
    opts = opts || {};
    const repostCount = Number.isFinite(opts.repostCount) ? opts.repostCount : 0;
    const reasons = [];
    const add = (label, points) => {
      if (points !== 0) reasons.push({ label: label, points: points });
    };

    // 0a. Repost detection (highest single signal — runs first to anchor verdict)
    if (repostCount >= 2) {
      add("Reposted " + repostCount + " times before", 25);
    } else if (repostCount === 1) {
      add("Identical ad seen once before", 15);
    }

    // 0b. Promoted/Featured-with-hidden-date signals
    if (job.promoted && job.dateHidden) {
      add("Promoted listing with hidden posting date", 15);
    } else if (job.promoted) {
      add("Promoted (paid placement)", 5);
    } else if (job.dateHidden) {
      add("Posting date obscured (Featured tag)", 10);
    }

    // 0c. Expiring soon — INTENTIONALLY NOT SCORED.
    //   The "Expiring" badge is just SEEK's default state for any ad in days 23-30
    //   of its 30-day life. A ghost ad shows "Expiring" right before the advertiser
    //   pays to roll it over. The badge alone can't distinguish real-hire-ending
    //   from ghost-about-to-be-refreshed. Parser still captures job.expiringSoon
    //   in case future rollover detection wants to combine "was Expiring last week"
    //   with "now shows Posted today" to flag a confirmed rollover.
    // (no points added — this comment exists so future-me doesn't re-add the signal
    //  without thinking through the ambiguity.)

    // 1. Posting age (text-based so we work from card AND detail)
    if (Number.isFinite(job.ageDays)) {
      if (job.ageDays >= 60) add("Posted " + job.ageDays + " days ago (60+)", 35);
      else if (job.ageDays >= 30) add("Posted " + job.ageDays + " days ago (30+)", 20);
      else if (job.ageDays >= 14) add("Posted " + job.ageDays + " days ago (14+)", 10);
    }

    // 2. Salary disclosure
    if (!job.salaryDisclosed) {
      const t = (job.salaryText || "").trim();
      // Distinguish "no salary text at all" (cardinal sin) from "prose without
      // numbers" (the dodge: "Attractive salary", "$$", "Competitive remuneration")
      if (t && /[a-z$]/i.test(t)) {
        add("Salary teaser without numbers (\"" + truncate(t, 30) + "\")", 15);
      } else {
        add("No salary band disclosed", 15);
      }
    }

    // 3. Ghost keyword hits (highest-signal single dimension)
    const haystackText =
      ((job.title || "") + " " + (job.descriptionText || "")).toLowerCase();
    const ghostKw = lists().ghostKeywords || [];
    const ghostHits = [];
    for (const kw of ghostKw) {
      if (haystackText.includes(kw.toLowerCase())) ghostHits.push(kw);
    }
    if (ghostHits.length) {
      const display = ghostHits.slice(0, 3).join(", ");
      add("Ghost keyword(s): " + display, 40);
    }

    // 4. Boilerplate copy (lighter signal)
    const bp = lists().boilerplate || [];
    let bpHits = 0;
    for (const phrase of bp) {
      if (haystackText.includes(phrase)) bpHits++;
    }
    if (bpHits >= 3) add("Heavy boilerplate (" + bpHits + " stock phrases)", 10);
    else if (bpHits >= 1) add("Some boilerplate (" + bpHits + " stock phrases)", 5);

    // 5. JD length anomaly (only meaningful on detail page)
    if (job.kind === "detail" && job.wordCount > 0) {
      if (job.wordCount < 200) add("Very short JD (" + job.wordCount + " words)", 5);
      else if (job.wordCount > 1500) add("Very long JD (" + job.wordCount + " words)", 5);
    }

    // 6. Agency-posted
    if (job.employerType === "agency") {
      add("Posted by a recruitment agency", 10);
    }

    // 7. Confidential employer
    if (!job.employer || /confidential|undisclosed|private/i.test(job.employer || "")) {
      add("Employer is confidential / undisclosed", 10);
    }

    // 8. Impossible requirements (detail only)
    if (job.kind === "detail" && job.descriptionText) {
      const txt = job.descriptionText.toLowerCase();
      const mentionsEntry =
        /\b(?:entry[- ]level|junior|graduate|new grad|no experience|trainee)\b/.test(txt);
      const yrsMatch = txt.match(/(\d+)\s*\+?\s*(?:years|yrs)/);
      const years = yrsMatch ? parseInt(yrsMatch[1], 10) : 0;
      if (mentionsEntry && years >= 5) {
        add("Entry-level role demanding " + years + "+ years experience", 15);
      }
    }

    const total = reasons.reduce(function (s, r) {
      return s + r.points;
    }, 0);
    // Clamp 0..100 (signals can be negative for counter-signals like Expiring)
    return { score: Math.max(0, Math.min(100, total)), reasons: reasons };
  }

  // ----- Scam -----------------------------------------------------------

  function scoreScam(job) {
    const reasons = [];
    const add = (label, points) => {
      if (points > 0) reasons.push({ label: label, points: points });
    };
    const signals = lists().scamSignals || {};

    const haystack =
      (job.title || "") +
      "\n" +
      (job.descriptionText || "") +
      "\n" +
      (job.applyUrl || "");

    const pay = matchAny(signals.upfrontPayment, haystack);
    if (pay.length) add("Mentions upfront payment (\"" + truncate(pay[0]) + "\")", 50);

    const docs = matchAny(signals.sensitiveDocs, haystack);
    if (docs.length) add("Asks for sensitive docs (\"" + truncate(docs[0]) + "\")", 50);

    const contact = matchAny(signals.suspiciousContact, haystack);
    if (contact.length)
      add("Suspicious apply channel (\"" + truncate(contact[0]) + "\")", 25);

    // Generic title with inflated salary
    const isGeneric =
      job.title &&
      (signals.genericTitles || []).some(function (rx) {
        return rx.test(job.title);
      });
    if (isGeneric && job.salary && job.salary.max) {
      const max = job.salary.max;
      if (job.salary.unit === "YEAR" && max >= 150000) {
        add("$" + max.toLocaleString() + " for a generic-title role", 30);
      } else if (job.salary.unit === "HOUR" && max >= 80) {
        add("$" + max + "/hr for a generic-title role", 30);
      }
    }

    const tooGood = matchAny(signals.tooGood, job.descriptionText || "");
    if (tooGood.length)
      add("Too-good-to-be-true pattern (\"" + truncate(tooGood[0]) + "\")", 25);

    if (isGeneric) add("Generic role title (\"" + job.title + "\")", 10);

    if (job.applyUrl) {
      const m = job.applyUrl.match(/mailto:([^?]+@([^?&]+))/i);
      if (m) {
        const dom = m[2].toLowerCase();
        const domains = signals.genericEmailDomains || [];
        if (domains.indexOf(dom) !== -1) {
          add("Apply via personal email domain (" + dom + ")", 20);
        }
      }
    }

    if (!job.employer || /\b(?:confidential|private)\b/i.test(job.employer || "")) {
      add("Vague / undisclosed employer", 15);
    }

    const total = reasons.reduce(function (s, r) {
      return s + r.points;
    }, 0);
    return { score: Math.min(100, total), reasons: reasons };
  }

  // ----- Verdict --------------------------------------------------------

  // Thresholds — keep in sync with PROJECT_STATE.md and README.md.
  //   GREEN  : Ghost < 35  AND Scam < 25
  //   ORANGE : Ghost 35-70 OR  Scam 25-50
  //   RED    : Ghost > 70  OR  Scam > 50
  function verdict(ghostScore, scamScore) {
    if (ghostScore > 70 || scamScore > 50) {
      return { light: "RED", emoji: "🔴", label: "Don't apply" };
    }
    if (ghostScore >= 35 || scamScore >= 25) {
      return { light: "ORANGE", emoji: "🟠", label: "Proceed with caution" };
    }
    return { light: "GREEN", emoji: "🟢", label: "Go" };
  }

  window.__SGB.scorers = {
    scoreGhost: scoreGhost,
    scoreScam: scoreScam,
    verdict: verdict
  };
})();
