// store.js — local history of every job we've parsed.
//
// Single file: apps/seek-job-analyser/data/history.json
// Shape:
//   {
//     "<contentHash>": {
//       hash, urls: [], titles: [], firstSeen, lastSeen, seenCount
//     },
//     ...
//   }
//
// We hash on title + description (NOT URL), so a re-listed identical role
// matches its previous postings even when the URL changes.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "..", "data");
const HISTORY_FILE = path.join(DATA_DIR, "history.json");

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(HISTORY_FILE);
  } catch {
    await fs.writeFile(HISTORY_FILE, "{}\n", "utf8");
  }
}

export async function loadHistory() {
  await ensureFile();
  const raw = await fs.readFile(HISTORY_FILE, "utf8");
  try {
    return JSON.parse(raw);
  } catch {
    // Corrupt file — reset rather than crash
    return {};
  }
}

export async function saveHistory(history) {
  await ensureFile();
  await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2), "utf8");
}

/**
 * Record this parse, returning how many times this content has been seen
 * BEFORE this run (so a fresh parse = 0, a one-time repost = 1, etc).
 */
export async function recordAndCountReposts(job) {
  const history = await loadHistory();
  const key = job.contentHash;
  if (!key) return { repostCount: 0, history };

  const now = new Date().toISOString();
  const existing = history[key];
  const priorCount = existing ? existing.seenCount : 0;

  history[key] = {
    hash: key,
    titles: dedupe([...(existing?.titles || []), job.title].filter(Boolean)),
    urls: dedupe([...(existing?.urls || []), job.url].filter(Boolean)),
    firstSeen: existing?.firstSeen || now,
    lastSeen: now,
    seenCount: priorCount + 1,
  };

  await saveHistory(history);
  return { repostCount: priorCount, history };
}

function dedupe(arr) {
  return [...new Set(arr)];
}

export const HISTORY_FILE_PATH = HISTORY_FILE;
