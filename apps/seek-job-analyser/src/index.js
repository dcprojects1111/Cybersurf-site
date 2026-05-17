// SEEK Job Analyser — entry point
//
// Usage:
//   npm start -- check <SEEK_JOB_URL>     run Mode B on a single job
//   npm start -- filter <SEEK_SEARCH_URL> run Mode A (not yet built)
//   npm start -- help                     show this help
//
// Scope: ghost-likelihood + scam-likelihood filter. Traffic light output.

import { fetchJobPage } from "./fetcher.js";
import { parseJobPage } from "./parser.js";
import { scoreGhost } from "./scorers/ghost.js";
import { scoreScam } from "./scorers/scam.js";
import { recordAndCountReposts } from "./store.js";
import { renderJob } from "./output.js";

const argv = process.argv.slice(2);
const command = argv[0] || "help";
const arg = argv[1];

main(command, arg).catch((err) => {
  console.error("\nError:", err.message);
  if (process.env.DEBUG) console.error(err);
  process.exit(1);
});

async function main(cmd, target) {
  switch (cmd) {
    case "check":
      return runCheck(target);
    case "filter":
      return runFilter(target);
    case "help":
    case "--help":
    case "-h":
      return showHelp();
    default:
      console.error(`Unknown command: ${cmd}\n`);
      return showHelp(1);
  }
}

async function runCheck(url) {
  if (!url) {
    console.error("Missing URL. Usage:  npm start -- check <SEEK_JOB_URL>");
    process.exit(1);
  }

  process.stdout.write("Fetching SEEK page... ");
  const page = await fetchJobPage(url);
  console.log("ok");

  process.stdout.write("Parsing fields... ");
  const job = parseJobPage(page);
  console.log(`ok (via ${job.parseSource})`);

  process.stdout.write("Updating history... ");
  const { repostCount } = await recordAndCountReposts(job);
  console.log(`ok (seen ${repostCount} time${repostCount === 1 ? "" : "s"} before)`);

  const ghost = scoreGhost(job, { repostCount });
  const scam = scoreScam(job);

  console.log(renderJob(job, ghost, scam));
}

async function runFilter(_url) {
  console.log("");
  console.log("Mode A (search-results filter) is not built yet.");
  console.log("Mode B (single-job check) is working — use:");
  console.log("  npm start -- check <SEEK_JOB_URL>");
  console.log("");
}

function showHelp(exitCode = 0) {
  console.log(`
CyberSurf — SEEK Job Analyser

Usage:
  npm start -- check <SEEK_JOB_URL>     check one job (Mode B) ✓
  npm start -- filter <SEEK_SEARCH_URL> filter a search results page (Mode A) — coming soon
  npm start -- help                     this message

What it does:
  Scores SEEK job listings on two dimensions only:
    - Ghost likelihood (is this job really hiring?)
    - Scam  likelihood (is this listing fraudulent?)
  Verdict shown as traffic light:
    🟢 GREEN   — Go
    🟠 ORANGE  — Proceed with caution
    🔴 RED     — Don't apply

Examples:
  npm start -- check "https://www.seek.com.au/job/12345678"
`);
  if (exitCode) process.exit(exitCode);
}
