// output.js — render the verdict to the terminal.
//
// Thresholds locked in README:
//   GREEN  : Ghost < 40 AND Scam < 25
//   ORANGE : Ghost 40-70 OR Scam 25-50
//   RED    : Ghost > 70 OR Scam > 50

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  grey: "\x1b[90m",
};

export function verdict(ghostScore, scamScore) {
  if (ghostScore > 70 || scamScore > 50) {
    return { light: "RED", emoji: "🔴", color: ANSI.red, label: "DON'T APPLY" };
  }
  if (ghostScore >= 40 || scamScore >= 25) {
    return {
      light: "ORANGE",
      emoji: "🟠",
      color: ANSI.yellow,
      label: "PROCEED WITH CAUTION",
    };
  }
  return { light: "GREEN", emoji: "🟢", color: ANSI.green, label: "GO" };
}

export function renderJob(job, ghost, scam) {
  const v = verdict(ghost.score, scam.score);
  const out = [];

  out.push("");
  out.push(line());
  out.push(`${v.color}${ANSI.bold}${v.emoji} ${v.light} — ${v.label}${ANSI.reset}`);
  out.push(line());
  out.push("");
  out.push(`${ANSI.bold}${job.title || "(no title)"}${ANSI.reset}`);
  out.push(field("Employer", job.employer));
  if (job.employerType) out.push(field("  Type", job.employerType));
  out.push(field("Location", job.location));
  out.push(field("Salary", job.salary?.raw || (job.salaryDisclosed ? formatSalary(job.salary) : "not disclosed")));
  out.push(field("Employment", job.employmentType));
  out.push(field("Posted", job.datePosted ? `${job.datePosted.slice(0, 10)} (${job.ageDays}d ago)` : "unknown"));
  out.push(field("Words", String(job.wordCount || 0)));
  out.push(field("Source", job.parseSource));
  out.push("");

  out.push(`${ANSI.bold}Ghost score:${ANSI.reset} ${scoreBar(ghost.score)}  ${ghost.score}/100`);
  if (ghost.reasons.length === 0) {
    out.push(`  ${ANSI.dim}— no ghost signals detected${ANSI.reset}`);
  } else {
    for (const r of ghost.reasons) {
      out.push(`  ${ANSI.dim}+${pad(r.points, 2)}${ANSI.reset}  ${r.label}`);
    }
  }
  out.push("");

  out.push(`${ANSI.bold}Scam score:${ANSI.reset}  ${scoreBar(scam.score)}  ${scam.score}/100`);
  if (scam.reasons.length === 0) {
    out.push(`  ${ANSI.dim}— no scam signals detected${ANSI.reset}`);
  } else {
    for (const r of scam.reasons) {
      out.push(`  ${ANSI.dim}+${pad(r.points, 2)}${ANSI.reset}  ${r.label}`);
    }
  }
  out.push("");
  out.push(line());
  out.push("");

  return out.join("\n");
}

function line() {
  return ANSI.grey + "─".repeat(60) + ANSI.reset;
}

function field(label, value) {
  if (value == null || value === "") {
    return `  ${ANSI.dim}${label.padEnd(11)}${ANSI.reset} ${ANSI.dim}—${ANSI.reset}`;
  }
  return `  ${ANSI.dim}${label.padEnd(11)}${ANSI.reset} ${value}`;
}

function scoreBar(score) {
  const filled = Math.round((Math.min(100, Math.max(0, score)) / 100) * 20);
  const empty = 20 - filled;
  const colour =
    score > 70 ? ANSI.red : score >= 40 ? ANSI.yellow : ANSI.green;
  return `${colour}${"█".repeat(filled)}${ANSI.grey}${"░".repeat(empty)}${ANSI.reset}`;
}

function pad(n, w) {
  return String(n).padStart(w, " ");
}

function formatSalary(s) {
  if (!s) return "not disclosed";
  if (s.min && s.max && s.min !== s.max) {
    return `$${s.min.toLocaleString()}–$${s.max.toLocaleString()} ${s.unit || ""}`.trim();
  }
  if (s.min) return `$${s.min.toLocaleString()} ${s.unit || ""}`.trim();
  return s.raw || "not disclosed";
}
