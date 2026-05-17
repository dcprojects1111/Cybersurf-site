// parser.js — extract job fields from SEEK DOM.
//
// SEEK changes their DOM frequently. Strategy: find each [data-automation="jobTitle"]
// and walk up the DOM until we find a container that ALSO has an advertiser/company
// reference. That container is the "card", whether SEEK is using <article>, <div>,
// <li>, or anything else.
//
// Two surfaces:
//   findCards()         — returns the list of card root elements on a results page
//   parseCard(cardEl)   — pulls structured fields out of one card
//   parseJobDetail()    — for the standalone job detail page

(function () {
  window.__SGB = window.__SGB || {};

  // ----- selectors (kept up here so future SEEK drift is one edit) ----------

  const SEL_TITLE_IN_CARD = [
    '[data-automation="jobTitle"]',
    'a[data-automation="jobTitle"]'
  ];
  const SEL_ADVERTISER_IN_CARD = [
    '[data-automation="jobAdvertiser"]',
    '[data-automation="jobCompany"]'
  ];
  const SEL_LOCATION_IN_CARD = [
    '[data-automation="jobLocation"]',
    '[data-automation="jobCardLocation"]'
  ];
  const SEL_SALARY_IN_CARD = [
    '[data-automation="jobSalary"]',
    '[data-automation="jobCardSalary"]'
  ];
  const SEL_DATE_IN_CARD = [
    '[data-automation="jobListingDate"]',
    '[data-automation="jobCardDate"]',
    "time"
  ];
  const SEL_SHORT_IN_CARD = [
    '[data-automation="jobShortDescription"]',
    '[data-automation="jobCardDescription"]',
    "span[role='paragraph']"
  ];

  const SEL_DETAIL_TITLE = [
    '[data-automation="job-detail-title"]',
    'h1[data-automation="job-detail-title"]',
    "h1"
  ];
  const SEL_DETAIL_ADVERTISER = [
    '[data-automation="advertiser-name"]',
    '[data-automation="jobAdvertiser"]',
    '[data-automation="jobCompany"]'
  ];
  const SEL_DETAIL_LOCATION = [
    '[data-automation="job-detail-location"]',
    '[data-automation="jobLocation"]'
  ];
  const SEL_DETAIL_SALARY = [
    '[data-automation="job-detail-salary"]',
    '[data-automation="jobSalary"]'
  ];
  const SEL_DETAIL_DATE = [
    '[data-automation="job-detail-date"]',
    '[data-automation="jobListingDate"]'
  ];

  // ----- helpers ------------------------------------------------------------

  function text(el) {
    return el && el.textContent ? el.textContent.trim() : "";
  }

  function firstText(scope, selectors) {
    if (!scope) return "";
    for (const s of selectors) {
      try {
        const el = scope.querySelector(s);
        const v = text(el);
        if (v) return v;
      } catch (_) {
        // bad selector — skip
      }
    }
    return "";
  }

  // Walk up from a child element looking for the nearest ancestor that also contains
  // an advertiser/company reference. That's the job card root.
  function findCardRoot(titleEl) {
    let el = titleEl;
    let hops = 0;
    while (el && el.parentElement && hops < 15) {
      el = el.parentElement;
      for (const sel of SEL_ADVERTISER_IN_CARD) {
        if (el.querySelector(sel)) return el;
      }
      hops++;
    }
    return null;
  }

  function parseAgeDays(s) {
    if (!s) return null;
    const lower = s.toLowerCase();
    if (/posted today|just listed|^new\b/.test(lower)) return 0;
    // "30d ago", "30 days ago", "3h ago", "Posted 30+ days ago"
    const m = lower.match(/(\d+)\s*(\+)?\s*(d|day|days|h|hr|hour|hours|m|min|minutes)\b/);
    if (!m) return null;
    const n = parseInt(m[1], 10);
    const unit = m[3];
    if (unit.startsWith("d")) return n;
    return 0; // hours / minutes resolve to "today"
  }

  function parseSalary(s) {
    if (!s || typeof s !== "string") return null;
    const unit = /\/hr|per hour|hourly|p\.?h\.?/i.test(s)
      ? "HOUR"
      : /\/day|per day/i.test(s)
      ? "DAY"
      : "YEAR";
    // Floor varies by unit: hourly rates can legitimately be $20–$100;
    // annual must be >= $20,000 to be a credible salary.
    const floor = unit === "HOUR" ? 10 : unit === "DAY" ? 100 : 20000;
    const matches = [...s.matchAll(/\$?\s*([\d,]+(?:\.\d+)?)\s*([kK])?/g)];
    const nums = matches
      .map((m) => {
        let n = parseFloat(m[1].replace(/,/g, ""));
        if (m[2]) n *= 1000;
        return n;
      })
      .filter((n) => Number.isFinite(n) && n >= floor);
    if (!nums.length) return null;
    return {
      raw: s.trim(),
      min: nums[0],
      max: nums[1] || nums[0],
      unit: unit
    };
  }

  // True only when there's an actual numeric salary in the text.
  // Prose like "Attractive salary", "Competitive remuneration", "$$" returns false.
  function hasNumericSalary(salaryText) {
    return !!parseSalary(salaryText);
  }

  function classifyEmployer(name) {
    if (!name) return null;
    const list = (window.__SGB.lists && window.__SGB.lists.recruiters) || [];
    const lower = name.toLowerCase();
    for (const r of list) {
      const rl = r.toLowerCase();
      if (
        lower === rl ||
        lower.startsWith(rl + " ") ||
        lower.endsWith(" " + rl) ||
        lower.includes(" " + rl + " ")
      ) {
        return "agency";
      }
    }
    if (/\b(recruitment|recruiting|recruiters|talent solutions|staffing)\b/i.test(name)) {
      return "agency";
    }
    return "direct";
  }

  // ----- public API ---------------------------------------------------------

  // Returns the list of card root elements found on the current page.
  function findCards() {
    const titleEls = document.querySelectorAll(
      '[data-automation="jobTitle"]'
    );
    const seen = new Set();
    const cards = [];
    titleEls.forEach((tEl) => {
      const card = findCardRoot(tEl);
      if (card && !seen.has(card)) {
        seen.add(card);
        cards.push(card);
      }
    });
    return cards;
  }

  function extractJobKeyFromCard(card) {
    // Find any anchor inside the card linking to /job/<id>
    const anchors = card.querySelectorAll('a[href*="/job/"]');
    for (const a of anchors) {
      const href = a.getAttribute("href") || "";
      const m = href.match(/\/job\/(\d+)/);
      if (m) return "/job/" + m[1];
    }
    return null;
  }

  function extractCardHref(card) {
    const anchor = card.querySelector('a[href*="/job/"]');
    return anchor ? anchor.getAttribute("href") || "" : "";
  }

  function isPromotedHref(href) {
    if (!href) return false;
    return /[?&]type=promoted\b/i.test(href);
  }

  function isFeaturedDateText(text) {
    if (!text) return false;
    return /^\s*(featured|promoted|sponsored)\s*$/i.test(text);
  }

  function extractJobKeyFromUrl(url) {
    if (!url) return null;
    const m = url.match(/\/job\/(\d+)/);
    return m ? "/job/" + m[1] : null;
  }

  function parseCard(card) {
    const title = firstText(card, SEL_TITLE_IN_CARD);
    const employer = firstText(card, SEL_ADVERTISER_IN_CARD);
    const location = firstText(card, SEL_LOCATION_IN_CARD);
    const salaryText = firstText(card, SEL_SALARY_IN_CARD);
    const dateText = firstText(card, SEL_DATE_IN_CARD);
    const shortDesc = firstText(card, SEL_SHORT_IN_CARD);
    const jobKey = extractJobKeyFromCard(card);
    const href = extractCardHref(card);
    const promoted = isPromotedHref(href);
    const dateHidden = isFeaturedDateText(dateText);
    const expiringSoon = !!card.querySelector(
      '[data-automation="expiringSoonSERPFooter"]'
    );

    return {
      kind: "card",
      jobKey,
      title,
      employer,
      location,
      salary: parseSalary(salaryText),
      salaryDisclosed: hasNumericSalary(salaryText),
      salaryText: salaryText || "",
      datePostedText: dateText,
      ageDays: parseAgeDays(dateText),
      descriptionText: shortDesc,
      wordCount: shortDesc ? shortDesc.split(/\s+/).filter(Boolean).length : 0,
      employerType: classifyEmployer(employer),
      applyUrl: "",
      promoted,
      dateHidden,
      expiringSoon
    };
  }

  function parseJobDetail(doc, overrideUrl) {
    doc = doc || document;
    const title = firstText(doc, SEL_DETAIL_TITLE);
    const employer = firstText(doc, SEL_DETAIL_ADVERTISER);
    const location = firstText(doc, SEL_DETAIL_LOCATION);
    const salaryText = firstText(doc, SEL_DETAIL_SALARY);
    const dateText = firstText(doc, SEL_DETAIL_DATE);
    const descEl = doc.querySelector('[data-automation="jobAdDetails"]');
    // innerText not always available on offscreen DOMParser docs — fall back to textContent
    const description = descEl
      ? (descEl.innerText || descEl.textContent || "").trim()
      : "";

    const applyEl = doc.querySelector('[data-automation="job-detail-apply"]');
    const applyUrl = applyEl ? applyEl.getAttribute("href") || "" : "";

    const urlForKey = overrideUrl || (doc === document ? window.location.href : "");

    const expiringSoon = !!doc.querySelector(
      '[data-automation="expiringSoonSERPFooter"]'
    );
    const dateHidden = isFeaturedDateText(dateText);
    const promoted = isPromotedHref(urlForKey || "");

    return {
      kind: "detail",
      jobKey: extractJobKeyFromUrl(urlForKey),
      promoted,
      dateHidden,
      expiringSoon,
      title,
      employer,
      location,
      salary: parseSalary(salaryText),
      salaryDisclosed: hasNumericSalary(salaryText),
      salaryText: salaryText || "",
      datePostedText: dateText,
      ageDays: parseAgeDays(dateText),
      descriptionText: description,
      wordCount: description ? description.split(/\s+/).filter(Boolean).length : 0,
      employerType: classifyEmployer(employer),
      applyUrl
    };
  }

  function parseDetailFromHtml(html, sourceUrl) {
    if (!html || typeof html !== "string") return null;
    try {
      const doc = new DOMParser().parseFromString(html, "text/html");
      return parseJobDetail(doc, sourceUrl);
    } catch (_) {
      return null;
    }
  }

  window.__SGB.parser = {
    findCards: findCards,
    parseCard: parseCard,
    parseJobDetail: parseJobDetail,
    parseDetailFromHtml: parseDetailFromHtml,
    extractJobKeyFromUrl: extractJobKeyFromUrl
  };
})();
