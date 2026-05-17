// service-worker.js — MV3 background.
//
// Two jobs:
//   1) Seed default settings on first install.
//   2) Rate-limited background fetch of SEEK job detail pages for the
//      content script. Receives { type: 'fetchJobDetail', url, jobKey }
//      messages, sends back { type: 'jobDetailResult', jobKey, ok, html, error }
//      via chrome.tabs.sendMessage to the originating tab.

// ---------- install / settings -----------------------------------------------

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get(["settings"]);
  if (!existing.settings) {
    await chrome.storage.local.set({
      settings: { hideRed: false }
    });
  }
});

// ---------- fetch queue ------------------------------------------------------

const MIN_DELAY_MS = 1200;
const MAX_DELAY_MS = 2500;
const MAX_QUEUE = 100;
const FETCH_TIMEOUT_MS = 12000;

let queue = [];
let processing = false;
const inflight = new Set(); // dedupe by jobKey

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (!msg || msg.type !== "fetchJobDetail") return;
  if (!msg.url || !msg.jobKey) return;
  if (inflight.has(msg.jobKey)) return;

  inflight.add(msg.jobKey);
  queue.push({
    url: msg.url,
    jobKey: msg.jobKey,
    tabId: sender && sender.tab ? sender.tab.id : null
  });

  // Cap the queue — newest wins
  if (queue.length > MAX_QUEUE) {
    const dropped = queue.splice(0, queue.length - MAX_QUEUE);
    dropped.forEach((d) => inflight.delete(d.jobKey));
  }

  processQueue();
});

async function processQueue() {
  if (processing) return;
  processing = true;
  while (queue.length) {
    const item = queue.shift();
    let payload;
    try {
      payload = await fetchWithTimeout(item.url, FETCH_TIMEOUT_MS);
    } catch (err) {
      payload = { ok: false, error: err.message || String(err) };
    }
    inflight.delete(item.jobKey);

    if (item.tabId != null) {
      try {
        await chrome.tabs.sendMessage(item.tabId, {
          type: "jobDetailResult",
          jobKey: item.jobKey,
          ok: !!payload.ok,
          html: payload.html || null,
          error: payload.error || null
        });
      } catch (_) {
        // Tab closed or navigated away — drop result
      }
    }

    // Jittered delay to mimic natural reading pace
    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
    await sleep(delay);
  }
  processing = false;
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      credentials: "include",
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-AU,en;q=0.9"
      },
      signal: controller.signal
    });
    if (!res.ok) {
      return { ok: false, error: "HTTP " + res.status };
    }
    const html = await res.text();
    if (typeof html !== "string" || html.length < 500) {
      return { ok: false, error: "unexpectedly small response" };
    }
    return { ok: true, html };
  } finally {
    clearTimeout(t);
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
