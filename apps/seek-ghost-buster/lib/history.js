// history.js — wraps chrome.storage.local for two things:
//   1) Repost detection — content-hash keyed, tracks seenCount across sessions.
//   2) Detail-verdict cache — job-URL keyed, lets cards display the more
//      accurate verdict the user already saw on the detail page.
//
// Both stores share a single root key "sgbStore" with this shape:
//   {
//     reposts: { "<contentHash>": { seenCount, firstSeen, lastSeen, titles: [], urls: [] } },
//     detailVerdicts: { "<jobKey>": { ghost, scam, light, at } }
//   }
//
// Pruning: caps each store at MAX_ENTRIES, FIFO by lastSeen / at timestamp.

(function () {
  window.__SGB = window.__SGB || {};

  const ROOT_KEY = "sgbStore";
  const MAX_REPOST_ENTRIES = 5000;
  const MAX_VERDICT_ENTRIES = 2000;
  const DETAIL_VERDICT_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

  function hashString(s) {
    // Stable, non-cryptographic string hash. Fine for de-duping job content.
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return (h >>> 0).toString(36);
  }

  function normaliseForHash(text) {
    return (text || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[^\w\s]/g, "")
      .trim();
  }

  function contentHashFromFields(fields) {
    const title = normaliseForHash(fields.title);
    const desc = normaliseForHash((fields.descriptionText || "").slice(0, 400));
    return hashString(title + "::" + desc);
  }

  async function loadStore() {
    return new Promise((resolve) => {
      chrome.storage.local.get([ROOT_KEY], (result) => {
        const s = result[ROOT_KEY] || {};
        if (!s.reposts) s.reposts = {};
        if (!s.detailVerdicts) s.detailVerdicts = {};
        resolve(s);
      });
    });
  }

  async function saveStore(store) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [ROOT_KEY]: store }, () => resolve());
    });
  }

  function pruneOldest(map, max, timestampKey) {
    const keys = Object.keys(map);
    if (keys.length <= max) return map;
    const sorted = keys
      .map((k) => ({ k, t: map[k][timestampKey] || 0 }))
      .sort((a, b) => a.t - b.t);
    const drop = sorted.slice(0, sorted.length - max);
    drop.forEach(({ k }) => delete map[k]);
    return map;
  }

  /**
   * Record this sighting and return how many times the content was seen
   * BEFORE this run (so a fresh ad = 0; one prior sighting = 1; etc.).
   * Does NOT increment the count for the current sighting if it's already
   * been recorded in the last 60 minutes (avoids same-session double counting).
   */
  async function recordAndCountReposts(fields) {
    const key = contentHashFromFields(fields);
    if (!key) return 0;

    const now = Date.now();
    const store = await loadStore();
    const existing = store.reposts[key];

    // Cooldown: ignore re-records within 60 minutes of last sighting
    if (existing && existing.lastSeen && now - existing.lastSeen < 60 * 60 * 1000) {
      return Math.max(0, existing.seenCount - 1);
    }

    const priorCount = existing ? existing.seenCount : 0;
    store.reposts[key] = {
      seenCount: priorCount + 1,
      firstSeen: existing ? existing.firstSeen : now,
      lastSeen: now,
      titles: dedupe([...(existing?.titles || []), fields.title].filter(Boolean)).slice(-5),
      urls: dedupe([...(existing?.urls || []), fields.jobKey].filter(Boolean)).slice(-5)
    };

    pruneOldest(store.reposts, MAX_REPOST_ENTRIES, "lastSeen");
    await saveStore(store);
    return priorCount;
  }

  async function getRepostInfo(fields) {
    const key = contentHashFromFields(fields);
    if (!key) return null;
    const store = await loadStore();
    return store.reposts[key] || null;
  }

  /**
   * Cache a verdict computed from a job detail page so future card views
   * of the same job can reuse it.
   */
  async function cacheDetailVerdict(jobKey, verdict) {
    if (!jobKey || !verdict) return;
    const store = await loadStore();
    store.detailVerdicts[jobKey] = {
      ghost: verdict.ghost,
      scam: verdict.scam,
      light: verdict.light,
      at: Date.now()
    };
    pruneOldest(store.detailVerdicts, MAX_VERDICT_ENTRIES, "at");
    await saveStore(store);
  }

  async function getCachedDetailVerdict(jobKey) {
    if (!jobKey) return null;
    const store = await loadStore();
    const v = store.detailVerdicts[jobKey];
    if (!v) return null;
    if (Date.now() - v.at > DETAIL_VERDICT_TTL_MS) return null; // stale
    return v;
  }

  function dedupe(arr) {
    return [...new Set(arr)];
  }

  window.__SGB.history = {
    contentHashFromFields,
    recordAndCountReposts,
    getRepostInfo,
    cacheDetailVerdict,
    getCachedDetailVerdict
  };
})();
