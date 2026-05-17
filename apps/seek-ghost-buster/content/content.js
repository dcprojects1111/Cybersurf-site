// content.js — runs on every SEEK page.
//
// v0.2.0 flow on a search results page:
//   1. Find all cards (parser.findCards)
//   2. For each card:
//      a. Score from card preview text — render a "preview" badge immediately.
//      b. If we have a cached detail-verdict from a past session, swap to that.
//      c. Otherwise, ask the service worker to fetch the full job page.
//   3. When the SW posts back the result, parse the full JD, re-score, replace badge.
//
// On a single job detail page:
//   - Parse + score + render banner.
//   - Cache the verdict so card views of this job stay accurate next time.

(function () {
  const SGB = window.__SGB;
  if (!SGB || !SGB.parser || !SGB.scorers || !SGB.history) {
    console.warn("[SGB] lib not loaded — aborting");
    return;
  }

  const JOB_DETAIL_SELECTORS = [
    '[data-automation="job-detail-title"]',
    '[data-automation="jobAdDetails"]'
  ];
  const PROCESSED_FLAG = "sgbProcessed";

  let settings = { hideRed: false };
  let lastUrl = location.href;
  let pendingRun = null;
  const cardByJobKey = new Map(); // jobKey -> { card, fields }

  init();

  function init() {
    chrome.storage.local.get(["settings"], (result) => {
      if (result && result.settings) {
        settings = Object.assign({}, settings, result.settings);
      }
      schedule();
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes.settings) {
        settings = Object.assign({}, settings, changes.settings.newValue || {});
        document
          .querySelectorAll("[data-" + PROCESSED_FLAG + "='1']")
          .forEach(applyHideToggle);
        schedule();
      }
    });

    // Listen for background-fetch results
    chrome.runtime.onMessage.addListener((msg) => {
      if (!msg || msg.type !== "jobDetailResult") return;
      handleFetchResult(msg);
    });

    // SPA navigation watcher
    const obs = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        document
          .querySelectorAll("[data-" + PROCESSED_FLAG + "]")
          .forEach((el) => {
            delete el.dataset[PROCESSED_FLAG];
            const old = el.querySelector(".sgb-badge");
            if (old) old.remove();
          });
        const banner = document.getElementById("sgb-banner");
        if (banner) banner.remove();
        cardByJobKey.clear();
      }
      schedule();
    });
    obs.observe(document.body, { subtree: true, childList: true });
  }

  function schedule() {
    if (pendingRun) return;
    pendingRun = setTimeout(() => {
      pendingRun = null;
      try {
        run();
      } catch (err) {
        console.error("[SGB] run failed:", err);
      }
    }, 250);
  }

  async function run() {
    if (isJobDetailPage()) {
      await annotateJobDetail();
    } else {
      await annotateSearchResults();
    }
  }

  function isJobDetailPage() {
    return JOB_DETAIL_SELECTORS.some((s) => document.querySelector(s));
  }

  // ----- search-results path --------------------------------------------

  async function annotateSearchResults() {
    const cards = SGB.parser.findCards();
    console.log("[SGB] found cards:", cards.length);
    const stats = { green: 0, orange: 0, red: 0 };

    for (const card of cards) {
      if (card.dataset[PROCESSED_FLAG] === "1") {
        const lt = card.dataset.sgbLight;
        if (lt === "GREEN") stats.green++;
        else if (lt === "ORANGE") stats.orange++;
        else if (lt === "RED") stats.red++;
        applyHideToggle(card);
        continue;
      }

      const fields = SGB.parser.parseCard(card);
      if (!fields.title) continue;

      // 1. Try cached detail verdict
      const cached = fields.jobKey
        ? await SGB.history.getCachedDetailVerdict(fields.jobKey)
        : null;

      if (cached) {
        renderFromVerdict(card, fields, {
          ghost: { score: cached.ghost, reasons: [{ label: "Cached from detail page", points: cached.ghost }] },
          scam: { score: cached.scam, reasons: [{ label: "Cached from detail page", points: cached.scam }] },
          verdict: SGB.scorers.verdict(cached.ghost, cached.scam),
          source: "cached"
        });
      } else {
        // 2. Preview score from card text only
        const repostCount = await safeRepostCount(fields);
        const ghost = SGB.scorers.scoreGhost(fields, { repostCount });
        const scam = SGB.scorers.scoreScam(fields);
        const verdict = SGB.scorers.verdict(ghost.score, scam.score);
        renderFromVerdict(card, fields, { ghost, scam, verdict, source: "preview" });

        // 3. Track this card and enqueue a background fetch for the full JD
        if (fields.jobKey) {
          cardByJobKey.set(fields.jobKey, { card: card, cardFields: fields });
          const fullUrl = location.origin + fields.jobKey;
          chrome.runtime.sendMessage({
            type: "fetchJobDetail",
            url: fullUrl,
            jobKey: fields.jobKey
          });
        }
      }

      applyHideToggle(card);
      const lt = card.dataset.sgbLight;
      if (lt === "GREEN") stats.green++;
      else if (lt === "ORANGE") stats.orange++;
      else if (lt === "RED") stats.red++;
    }

    chrome.storage.local.set({
      lastStats: stats,
      lastUrl: location.href,
      lastUpdatedAt: Date.now()
    });
  }

  async function safeRepostCount(fields) {
    try {
      return await SGB.history.recordAndCountReposts(fields);
    } catch (e) {
      return 0;
    }
  }

  // ----- job-detail path -------------------------------------------------

  async function annotateJobDetail() {
    if (document.getElementById("sgb-banner")) return;
    const fields = SGB.parser.parseJobDetail();
    if (!fields.title) return;

    const repostCount = await safeRepostCount(fields);
    const ghost = SGB.scorers.scoreGhost(fields, { repostCount });
    const scam = SGB.scorers.scoreScam(fields);
    const v = SGB.scorers.verdict(ghost.score, scam.score);

    injectBanner(v, ghost, scam, fields);

    if (fields.jobKey) {
      await SGB.history.cacheDetailVerdict(fields.jobKey, {
        ghost: ghost.score,
        scam: scam.score,
        light: v.light
      });
    }

    chrome.storage.local.set({
      lastDetailVerdict: {
        url: location.href,
        title: fields.title,
        light: v.light,
        ghost: ghost.score,
        scam: scam.score,
        at: Date.now()
      }
    });
  }

  // ----- handle background-fetch results --------------------------------

  async function handleFetchResult(msg) {
    if (!msg.ok) {
      console.log("[SGB] fetch failed for", msg.jobKey, msg.error);
      return;
    }
    const entry = cardByJobKey.get(msg.jobKey);
    if (!entry || !entry.card.isConnected) return;

    const fields = SGB.parser.parseDetailFromHtml(
      msg.html,
      location.origin + msg.jobKey
    );
    if (!fields || !fields.title) return;

    const repostCount = await safeRepostCount(fields);
    const ghost = SGB.scorers.scoreGhost(fields, { repostCount });
    const scam = SGB.scorers.scoreScam(fields);
    const verdict = SGB.scorers.verdict(ghost.score, scam.score);

    renderFromVerdict(entry.card, fields, {
      ghost,
      scam,
      verdict,
      source: "deep"
    });
    applyHideToggle(entry.card);

    await SGB.history.cacheDetailVerdict(msg.jobKey, {
      ghost: ghost.score,
      scam: scam.score,
      light: verdict.light
    });
  }

  // ----- rendering ------------------------------------------------------

  function renderFromVerdict(card, fields, payload) {
    const { ghost, scam, verdict: v, source } = payload;

    card.dataset[PROCESSED_FLAG] = "1";
    card.dataset.sgbLight = v.light;
    card.dataset.sgbGhost = String(ghost.score);
    card.dataset.sgbScam = String(scam.score);
    card.dataset.sgbSource = source;

    const existing = card.querySelector(".sgb-badge");
    if (existing) existing.remove();

    const badge = document.createElement("div");
    badge.className =
      "sgb-badge sgb-" + v.light.toLowerCase() + " sgb-source-" + source;
    const sourceMark =
      source === "deep"
        ? '<span class="sgb-mark" title="Verified from full job ad">✓</span>'
        : source === "cached"
        ? '<span class="sgb-mark" title="Cached from a previous visit">●</span>'
        : '<span class="sgb-mark" title="Preview score — full ad not yet loaded">…</span>';

    badge.innerHTML =
      '<div class="sgb-badge-row">' +
      "<span class=\"sgb-light\">" + v.emoji + " " + v.light + "</span>" +
      sourceMark +
      "</div>" +
      "<div class=\"sgb-scores\">Ghost " + ghost.score + " · Scam " + scam.score + "</div>" +
      "<div class=\"sgb-tooltip\">" +
      "<div class=\"sgb-tooltip-title\">" + escapeHtml(v.label) + "</div>" +
      renderReasonGroup("Ghost", ghost.reasons) +
      renderReasonGroup("Scam", scam.reasons) +
      sourceFootnote(source) +
      "</div>";

    const cs = window.getComputedStyle(card);
    if (cs.position === "static") card.style.position = "relative";
    card.appendChild(badge);
  }

  function injectBanner(v, ghost, scam, fields) {
    const banner = document.createElement("div");
    banner.id = "sgb-banner";
    banner.className = "sgb-banner sgb-" + v.light.toLowerCase();
    banner.innerHTML =
      '<div class="sgb-banner-row">' +
      "<div class=\"sgb-banner-light\">" + v.emoji + " " + v.light + " — " + escapeHtml(v.label) + "</div>" +
      "<div class=\"sgb-banner-scores\">Ghost: " + ghost.score + "/100 · Scam: " + scam.score + "/100</div>" +
      "</div>" +
      '<div class="sgb-banner-reasons">' +
      renderReasonGroup("Ghost signals", ghost.reasons, true) +
      renderReasonGroup("Scam signals", scam.reasons, true) +
      "</div>";

    const target =
      document.querySelector('[data-automation="job-detail-title"]') ||
      document.querySelector('[data-automation="jobAdDetails"]') ||
      document.body;
    const insertParent = target.parentElement || document.body;
    insertParent.insertBefore(banner, target);
  }

  function renderReasonGroup(label, reasons, alwaysShow) {
    if (!reasons || !reasons.length) {
      return alwaysShow
        ? '<div class="sgb-reason-group"><strong>' + escapeHtml(label) + ':</strong><em>none detected</em></div>'
        : "";
    }
    const items = reasons
      .map((r) => {
        const sign = r.points > 0 ? "+" : "";
        return "<li>" + sign + r.points + " " + escapeHtml(r.label) + "</li>";
      })
      .join("");
    return (
      '<div class="sgb-reason-group">' +
      "<strong>" + escapeHtml(label) + ":</strong>" +
      "<ul>" + items + "</ul>" +
      "</div>"
    );
  }

  function sourceFootnote(source) {
    if (source === "deep")
      return '<div class="sgb-source-foot">Score from full job ad ✓</div>';
    if (source === "cached")
      return '<div class="sgb-source-foot">Cached from previous visit</div>';
    return '<div class="sgb-source-foot">Preview score — deep-checking…</div>';
  }

  function applyHideToggle(card) {
    const light = card.dataset.sgbLight;
    if (settings.hideRed && light === "RED") {
      card.style.display = "none";
    } else if (card.style.display === "none") {
      card.style.display = "";
    }
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[m]);
  }
})();
