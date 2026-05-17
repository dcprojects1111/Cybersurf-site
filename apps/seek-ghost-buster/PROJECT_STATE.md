# SEEK Ghost Buster — Project State

**READ THIS FILE FIRST** before doing any work on the SEEK Ghost Buster. It captures locked scope, decisions, current state, and the next pickup point so we don't re-litigate settled choices.

Last updated: **2026-05-16** · Current version: **v0.2.4**

---

## What this tool is

A **Chrome / Edge browser extension** (Manifest V3) that filters ghost jobs and scams on SEEK with a traffic-light verdict per listing.

- Runs only when Darryl is on SEEK pages he initiated himself
- Reads the DOM his browser has already loaded
- No scraping, no backend, no scheduler, no data leaves the machine
- Sideload only (load unpacked via `chrome://extensions`)

## Scope — LOCKED. Do not invent extra features.

Two scoring dimensions. Nothing else.

| Dimension | What it answers |
|---|---|
| **Ghost likelihood** (0–100) | Is this job really hiring, or is it always-on / EOI / pipeline / re-listed? |
| **Scam likelihood** (0–100) | Is this listing fraudulent — upfront fees, sensitive doc requests, WhatsApp apply, etc.? |

Traffic light verdict (tuned in v0.2.2 by Darryl):

| Light | Rule |
|---|---|
| 🟢 GREEN | Ghost < 35 AND Scam < 25 |
| 🟠 ORANGE | Ghost 35–70 OR Scam 25–50 |
| 🔴 RED | Ghost > 70 OR Scam > 50 |

**NOT in scope (do not add unless Darryl explicitly asks):**
- Skill matching / Fit Score / profile.json — rejected, never reintroduce
- CV upload / candidate scoring
- Scheduled background runs
- Headless browser scraping (Python or Node)
- Tampermonkey userscript
- A separate Mode A / Mode B CLI

## Why a browser extension (not a scraper)

Darryl made this call explicitly. Three reasons it's the right architecture:
1. **No Cloudflare issue** — the browser already loaded the page legitimately
2. **No SEEK ToU issue** — extension just annotates DOM the user can already see
3. **No data egress** — everything runs client-side; history in `chrome.storage.local`

A pre-existing Node.js scraper scaffold at `apps/seek-job-analyser/` is deprecated. There is a `DEPRECATED.md` inside that folder. It should be deleted by Darryl with `rm -rf apps/seek-job-analyser`.

## File layout (current)

```
apps/seek-ghost-buster/
├── PROJECT_STATE.md            ← this file
├── README.md                   install + scope + signal weights
├── manifest.json               Manifest V3, matches au.seek.com + seek.com.au
├── content/
│   ├── content.js              orchestrates preview-then-deep scoring
│   └── content.css             Maldives Beach styled badges + banner
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── background/
│   └── service-worker.js       seeds settings + rate-limited fetch queue
└── lib/
    ├── history.js              chrome.storage.local: reposts + detail-verdict cache
    ├── parser.js               findCards(), parseCard(), parseJobDetail(doc), parseDetailFromHtml()
    ├── scorers.js              scoreGhost({repostCount}) + scoreScam + verdict
    └── lists/
        ├── boilerplate.js
        ├── ghost-keywords.js   "EOI" / "Talent Pool" / "Future Opportunities" etc.
        ├── scam-signals.js     upfront-fee / sensitive-doc / WhatsApp patterns
        └── au-recruiters.js    ~45 AU recruitment agency names
```

## Architectural decisions (do not undo without reason)

1. **Classic content scripts, not ES modules.** MV3 content scripts can't natively use `import`. All shared state attaches to `window.__SGB`. Each lib file is an IIFE.
2. **Manifest declares files in dependency order** in `content_scripts[0].js`. Lists load first, then parser + scorers, then `content.js`. Don't reorder.
3. **Cards are found by walking UP from `[data-automation="jobTitle"]` to the nearest ancestor containing `[data-automation="jobAdvertiser"]`.** Do not hard-code `article[data-automation="normalJob"]` — SEEK dropped that wrapper. The walker is in `lib/parser.js → findCardRoot()`.
4. **`jobAdvertiser` is the current employer attribute.** `jobCompany` is kept as a fallback for older SEEK pages.
5. **Two domains:** SEEK serves from both `au.seek.com` AND `seek.com.au`. Manifest must match both. Don't drop either.
6. **Traffic light thresholds are LOCKED.** Don't tune them without Darryl's say-so.

## Signal weights — locked

### Ghost (max 100)

| Signal | Points |
|---|---|
| Posted 60+ days ago | +35 |
| Posted 30+ days ago | +20 |
| Posted 14+ days ago | +10 |
| No salary disclosed | +15 |
| Ghost keyword hit (EOI, Talent Pool, Future Opps, etc.) | +40 |
| Heavy boilerplate (3+ stock phrases) | +10 |
| Some boilerplate (1–2 stock phrases) | +5 |
| Very short JD (<200 words) — detail page only | +5 |
| Very long JD (>1500 words) — detail page only | +5 |
| Posted by recruitment agency | +10 |
| Employer confidential / undisclosed | +10 |
| Entry-level + 5+ yrs exp required | +15 |

### Scam (max 100)

| Signal | Points |
|---|---|
| Mentions upfront payment / training fee | +50 |
| Asks for TFN / driver's licence / bank details | +50 |
| Suspicious apply channel (WhatsApp / Telegram / SMS) | +25 |
| "Too good to be true" pattern | +25 |
| Generic title with inflated salary ($150k+ YEAR or $80+ HOUR) | +30 |
| Apply via free email domain (gmail / yahoo / etc.) | +20 |
| Vague / undisclosed employer | +15 |
| Generic role title alone | +10 |

## Current status — v0.2.0

**Built.** Awaiting verification on a real SEEK search page.

### v0.1.0 → v0.1.1 changes

- Manifest now matches both `https://*.seek.com/*` AND `https://*.seek.com.au/*` (SEEK serves both domains)
- Parser rewritten: no longer requires `<article>` tags; uses `findCardRoot()` walker
- Switched primary advertiser attribute from `jobCompany` → `jobAdvertiser`

### v0.2.3 → v0.2.4 changes

Bug fix + new signal split, both surfaced by Darryl's diagnostic on a real detail page:

- **Bug fix: `salaryDisclosed` now requires a real number.** Previously any text in the `jobSalary` element (including "Attractive salary + Hybrid role", "$$ - lets chat today!", "Competitive Remuneration") counted as "disclosed" — which let prose dodges off the hook. Fixed by requiring `parseSalary()` to return a numeric value. Applied to both card and detail consistently.
- **Bug fix: hourly rates are now parsed.** `parseSalary()` had a $100 floor that rejected legit hourly rates like "$40 per hour". Floor is now unit-aware: HOUR≥$10, DAY≥$100, YEAR≥$20,000.
- **New signal split:** "no salary band disclosed" now distinguishes:
  - Empty salary field (genuine omission)
  - Prose-only salary ("Attractive salary", "$$") — equally +15 ghost points, but the tooltip reason cites the actual teaser text so you know what was wrong.

Detail-page salary selector confirmed: `[data-automation="jobSalary"]` (same as card). The dead `job-detail-salary` selector stays in the fallback list as harmless dead code.

### v0.2.2 → v0.2.3 changes

**Scrapped the −15 "Expiring soon" counter-signal.** Darryl spotted that the "Expiring" badge is just SEEK's default state for any ad in days 23–30 of its 30-day cycle. A ghost ad shows "Expiring" right before the advertiser pays to roll it over — so the badge alone is ambiguous between "real hire ending" and "ghost about to be refreshed".

- Parser still captures `job.expiringSoon` (zero-cost field) so future rollover-detection can combine "was Expiring last week" + "now Posted today" = confirmed rollover.
- A comment in `lib/scorers.js` warns future-me not to re-add the signal without thinking through the ambiguity.

### v0.2.1 → v0.2.2 changes

Darryl tuned the Ghost ORANGE threshold tighter after seeing GREEN verdicts on ads that felt borderline:

- ORANGE entry pulled from Ghost ≥ 40 → **Ghost ≥ 35**
- Scam thresholds unchanged
- Net effect: any single mid-weight ghost signal (e.g. "30+ days old" worth +20) combined with another low-weight signal (e.g. "agency posting" worth +10) now flips a card to ORANGE instead of staying GREEN.

### v0.2.0 → v0.2.1 changes

Three new SEEK-side signals captured from diagnostic on a real search page:

- **Promoted listing detection** — SEEK paid placements have `?type=promoted` in their card URLs. Parser exposes `job.promoted`.
- **"Featured" / "Promoted" / "Sponsored" date text** — promoted listings hide the age behind a label instead of "29d ago". Parser exposes `job.dateHidden`.
- **`expiringSoonSERPFooter` badge** — SEEK's "Expiring" label on a card. Parser exposes `job.expiringSoon`. **NOTE: scoring weight removed in v0.2.3 — see changelog above.**

Scorer now supports **negative point reasons** for counter-signals. Final score clamped to 0–100.

Ghost score additions in v0.2.1 (as later corrected by v0.2.3):

| Signal | Points |
|---|---|
| Promoted listing AND date hidden | +15 |
| Promoted listing (paid placement, date visible) | +5 |
| Date obscured by "Featured" tag (not promoted) | +10 |
| ~~"Expiring" badge~~ | ~~−15~~ *removed in v0.2.3* |

### v0.1.1 → v0.2.0 changes

- **Repost detection** — `lib/history.js` keeps a content-hash store in `chrome.storage.local`. Hash is title + first 400 chars of description, normalised. Ghost score gets +15 for one prior sighting, +25 for two or more.
- **Silent background full-JD scoring** — to fix the GREEN-on-card / ORANGE-on-detail asymmetry caused by SEEK serving only short previews in search results. Flow:
  1. Card renders with PREVIEW-level score and a pulsing "…" indicator
  2. Content script messages the service worker: `{type:'fetchJobDetail', url, jobKey}`
  3. SW queues the fetch (rate-limited 1.2–2.5s with jitter) using the user's cookies (`credentials: 'include'`)
  4. SW sends HTML back via `chrome.tabs.sendMessage` (NOT `sendResponse` — sendResponse drops after long delays)
  5. Content script parses the HTML with `DOMParser`, re-scores, swaps the badge in with a ✓ mark
- **Detail-verdict cache** — verdicts from any visited (or background-fetched) detail page persist for 14 days, keyed by `/job/<id>`. Subsequent card views reuse the verdict instantly with a ● mark.
- **Badge source indicators**:
  - `…` (pulsing) = preview score, deep-check in progress
  - `✓` = scored from full job ad
  - `●` = cached from previous visit
- **Tooltips show source** at the bottom: "Score from full job ad ✓" / "Cached from previous visit" / "Preview score — deep-checking…"

## Known issues / open items

1. **v0.2.0 verification pending.** Darryl needs to reload the extension in `chrome://extensions` and refresh a SEEK search to confirm preview badges appear instantly and upgrade with ✓ marks over ~50 seconds.
2. **Icons are placeholders.** Manifest doesn't declare any. Chrome shows the default puzzle-piece icon. v0.3 item.
3. ~~Open threshold question — RESOLVED in v0.2.2.~~ Darryl picked a custom variant: Ghost ORANGE threshold pulled to 35 (was 40), Scam unchanged. Locked thresholds above reflect his choice. Don't tune again without his say-so.
4. **SEEK selector drift will recur.** When badges stop appearing, run the diagnostic in DevTools console (see Testing below) and update the selectors in `lib/parser.js`. Don't rewrite the architecture — the walker pattern is correct.
5. **SEEK ToU on background fetches.** v0.2 fetches each job's detail URL silently. Although it uses the user's authenticated session and rate-limits to ~1 req per 1.2–2.5s, this technically does more requests than the user manually clicking. Run past **The Lawyer** before any wider distribution.
6. **Service worker eviction.** MV3 service workers can be evicted after 30 seconds idle. The queue lives in module-scope vars; if SW dies mid-queue we lose any not-yet-processed items. Content script enqueues again on next page visit, so impact is small.

## How to test

1. Open Chrome / Edge
2. Go to `chrome://extensions` (or `edge://extensions`)
3. Toggle **Developer mode** on (top right)
4. Click **Load unpacked**
5. Pick folder: `\\wsl.localhost\Ubuntu\home\darryl\cybersurf\apps\seek-ghost-buster`
6. Pin the extension via the puzzle-piece icon in toolbar
7. Navigate to a real SEEK search, e.g.
   `https://au.seek.com/IT-support-jobs/in-All-Brisbane-QLD`
8. Refresh (Ctrl+R) after loading the extension
9. Badges should appear in the top-right of each job card
10. Click the extension icon → popup shows green/orange/red counts

### Diagnostic snippet (paste in DevTools console on a SEEK page)

```javascript
console.log("SGB loaded:", !!window.__SGB);
console.log("Found cards:", window.__SGB?.parser?.findCards()?.length);
console.log("All data-automation values:", [...new Set([...document.querySelectorAll('[data-automation]')].map(e => e.getAttribute('data-automation')))].sort().join(", "));
```

If `SGB loaded: false` → domain match issue (check `manifest.json` matches the URL's host).
If `SGB loaded: true` but `Found cards: 0` → selectors drifted; update `lib/parser.js`.

## Roadmap (priority order)

- **v0.3** — **Confirmed rollover detection.** Combine `expiringSoon` from a past sighting with `ageDays === 0` on a current sighting (same content hash). If a job was Expiring last week and is now Posted Today, that's a rollover = high-confidence ghost signal. +30 ghost points.
- **v0.3** — Settings UI: tune thresholds, edit agency list, clear history, tweak fetch rate
- **v0.3** — Proper branded icons (16/48/128)
- **v0.3** — Firefox manifest variant
- **v0.4** — Cross-check employer against their `careers.companyname.com.au` (would need broader host permission)
- **v0.4** — Visual queue progress in popup ("deep-checking 12 of 30…")

## Related context

- Memory file: `project_seek_ghost_buster.md` (auto-loaded each session)
- Feedback memory: `feedback_no_scope_creep.md` — do not add Fit Score / matching / profile
- Research: `RESEARCH_PROMOTED_ADS.md` (this folder) — backs the +5/+15 ghost weights for paid promotion and the −15 Expiring counter-signal. Cite when discussing why those weights exist.
- Repo: `dcprojects1111/cybersurf` (or sub-repo if extracted later)

---

## When to read this file

**Always**, at the start of any session involving the SEEK Ghost Buster. It exists so Darryl doesn't have to re-explain scope and architecture decisions every conversation.

If a future session is about to:
- Add a "Fit Score" → STOP, read this file's scope section
- Suggest a Python scraper → STOP, this is a browser extension
- Hard-code `article[data-automation="..."]` selectors → STOP, use the walker
- Change traffic-light thresholds → STOP, ask Darryl first
