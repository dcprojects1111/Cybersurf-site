// parser.js — extract structured fields from a SEEK job HTML page.
//
// Strategy (most reliable first):
//   1. JSON-LD JobPosting block (standard schema.org markup)
//   2. __NEXT_DATA__ Next.js props blob (SEEK uses Next.js)
//   3. Cheerio DOM fallback (last resort)
//
// Output shape is documented at the bottom of this file.

import * as cheerio from "cheerio";
import crypto from "node:crypto";

const JSON_LD_SELECTOR = 'script[type="application/ld+json"]';
const NEXT_DATA_SELECTOR = "script#__NEXT_DATA__";

export function parseJobPage({ url, finalUrl, html }) {
  const $ = cheerio.load(html);

  const fromJsonLd = tryJsonLd($);
  const fromNextData = tryNextData($);

  // Merge: JSON-LD wins where both exist (it's the official contract).
  const merged = {
    ...fromNextData,
    ...stripUndefined(fromJsonLd),
  };

  // Title / description fallback via DOM if neither block had it
  if (!merged.title) merged.title = $("h1").first().text().trim() || null;
  if (!merged.descriptionHtml) {
    merged.descriptionHtml =
      $('[data-automation="jobAdDetails"]').html() || null;
  }

  const descriptionText = merged.descriptionHtml
    ? cheerio.load(merged.descriptionHtml).root().text().trim()
    : merged.descriptionText || null;

  const datePosted = parseDate(merged.datePosted);
  const ageDays = datePosted
    ? Math.max(0, Math.floor((Date.now() - datePosted.getTime()) / 86400000))
    : null;

  const wordCount = descriptionText
    ? descriptionText.split(/\s+/).filter(Boolean).length
    : 0;

  // Stable content hash for repost detection — based on title + description
  // (NOT date or URL, so a re-listed identical role can be matched).
  const contentHash = crypto
    .createHash("sha256")
    .update((merged.title || "") + "::" + (descriptionText || ""))
    .digest("hex")
    .slice(0, 16);

  return {
    url,
    finalUrl,
    title: merged.title || null,
    employer: merged.employer || null,
    employerType: merged.employerType || null, // "direct" | "agency" | null
    location: merged.location || null,
    salary: merged.salary || null, // { raw, min, max, currency } or null
    salaryDisclosed: !!(merged.salary && (merged.salary.min || merged.salary.raw)),
    employmentType: merged.employmentType || null,
    datePosted: datePosted ? datePosted.toISOString() : null,
    ageDays,
    descriptionText,
    wordCount,
    applyUrl: merged.applyUrl || null,
    contentHash,
    parseSource: fromJsonLd && Object.keys(fromJsonLd).length
      ? "json-ld"
      : fromNextData && Object.keys(fromNextData).length
      ? "next-data"
      : "dom-fallback",
  };
}

// ----- JSON-LD path ---------------------------------------------------------

function tryJsonLd($) {
  const out = {};
  $(JSON_LD_SELECTOR).each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw) return;
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }
    const blocks = Array.isArray(parsed) ? parsed : [parsed];
    for (const block of blocks) {
      if (block && block["@type"] === "JobPosting") {
        mergeJsonLdJob(out, block);
      }
    }
  });
  return Object.keys(out).length ? out : null;
}

function mergeJsonLdJob(out, j) {
  if (j.title) out.title = j.title;
  if (j.description) out.descriptionHtml = j.description;
  if (j.datePosted) out.datePosted = j.datePosted;
  if (j.employmentType) {
    out.employmentType = Array.isArray(j.employmentType)
      ? j.employmentType.join(", ")
      : j.employmentType;
  }
  if (j.hiringOrganization) {
    out.employer = j.hiringOrganization.name || null;
  }
  if (j.jobLocation) {
    const loc = Array.isArray(j.jobLocation) ? j.jobLocation[0] : j.jobLocation;
    if (loc && loc.address) {
      const a = loc.address;
      out.location = [a.addressLocality, a.addressRegion, a.addressCountry]
        .filter(Boolean)
        .join(", ");
    }
  }
  if (j.baseSalary) {
    const bs = j.baseSalary;
    const v = bs.value || {};
    out.salary = {
      raw: typeof bs === "string" ? bs : null,
      min: numberOrNull(v.minValue),
      max: numberOrNull(v.maxValue),
      currency: bs.currency || v.currency || null,
      unit: v.unitText || null,
    };
  }
  if (j.directApply === false) {
    // Common SEEK signal — true means apply in-platform, false = external apply
    out._externalApply = true;
  }
}

// ----- __NEXT_DATA__ path ---------------------------------------------------

function tryNextData($) {
  const raw = $(NEXT_DATA_SELECTOR).contents().text();
  if (!raw) return null;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  // SEEK shapes shift over time — defensively walk common paths.
  const job =
    deepFind(parsed, "jobDetails") ||
    deepFind(parsed, "job") ||
    null;

  if (!job || typeof job !== "object") return null;

  const out = {};
  if (job.title) out.title = job.title;
  if (job.advertiser?.description) out.employer = job.advertiser.description;
  if (job.advertiser?.isAgency != null) {
    out.employerType = job.advertiser.isAgency ? "agency" : "direct";
  }
  if (job.location?.label) out.location = job.location.label;
  if (job.workType) out.employmentType = job.workType;
  if (job.salary?.label) {
    out.salary = parseSalaryString(job.salary.label);
  }
  if (job.listingDate || job.postedDate) {
    out.datePosted = job.listingDate || job.postedDate;
  }
  if (job.content) out.descriptionHtml = job.content;
  if (job.applyUrl) out.applyUrl = job.applyUrl;

  return Object.keys(out).length ? out : null;
}

// ----- helpers --------------------------------------------------------------

function parseSalaryString(s) {
  if (!s || typeof s !== "string") return null;
  // Common SEEK formats: "$120,000 - $150,000 + super", "$50/hr", "Up to $90k"
  const numbers = [...s.matchAll(/\$?\s*([\d,]+(?:\.\d+)?)\s*[kK]?/g)]
    .map((m) => {
      let n = parseFloat(m[1].replace(/,/g, ""));
      if (/k/i.test(m[0])) n *= 1000;
      return n;
    })
    .filter((n) => Number.isFinite(n) && n > 0);
  return {
    raw: s,
    min: numbers[0] || null,
    max: numbers[1] || numbers[0] || null,
    currency: /AUD|\$/.test(s) ? "AUD" : null,
    unit: /\/hr|per hour/i.test(s) ? "HOUR" : /\/day/i.test(s) ? "DAY" : "YEAR",
  };
}

function parseDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isFinite(d.getTime()) ? d : null;
}

function numberOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function stripUndefined(obj) {
  if (!obj) return {};
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)
  );
}

function deepFind(node, key, depth = 0) {
  if (depth > 8 || node == null || typeof node !== "object") return null;
  if (Object.prototype.hasOwnProperty.call(node, key)) return node[key];
  for (const v of Object.values(node)) {
    const found = deepFind(v, key, depth + 1);
    if (found != null) return found;
  }
  return null;
}

/* Parsed job shape:
{
  url, finalUrl,
  title, employer, employerType,
  location, salary: { raw, min, max, currency, unit } | null, salaryDisclosed,
  employmentType, datePosted (ISO), ageDays,
  descriptionText, wordCount,
  applyUrl, contentHash,
  parseSource: "json-ld" | "next-data" | "dom-fallback"
}
*/
