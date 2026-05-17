# SEEK Ghost Buster

A Chrome / Edge browser extension that filters ghost jobs and scams on SEEK with a traffic-light verdict per listing.

## What it does

Runs only when you're on `seek.com.au`. Reads the DOM your browser has already loaded — no scraping, no backend, no data leaves your machine.

- **On a SEEK search results page**: stamps a 🟢/🟠/🔴 badge on every job card and shows a one-line summary in the popup.
- **On a single job page**: injects a banner at the top showing the full verdict and which signals fired.
- **Popup** (click the extension icon): see last-scan stats, toggle "hide RED jobs", toggle "dim viewed jobs".

## Scope — locked

Two scoring dimensions. Nothing else.

| Dimension | What it answers |
|---|---|
| **Ghost likelihood** | Is this job really hiring, or is it always-on / pipeline / EOI / re-listed? |
| **Scam likelihood** | Is this listing fraudulent — upfront fees, sensitive doc requests, WhatsApp apply? |

Traffic light thresholds:

| Light | Rule |
|---|---|
| 🟢 GREEN | Ghost < 35 AND Scam < 25 |
| 🟠 ORANGE | Ghost 35–70 OR Scam 25–50 |
| 🔴 RED | Ghost > 70 OR Scam > 50 |

No skill matching. No CV upload. No profile. No fit scoring. Not in scope.

## Installation (sideload — dev mode)

1. Open Chrome (or Edge) → `chrome://extensions` (Edge: `edge://extensions`)
2. Toggle **Developer mode** on (top right)
3. Click **Load unpacked**
4. Pick the folder `~/cybersurf/apps/seek-ghost-buster/`
5. Pin the extension to your toolbar for the popup

That's it. No build step, no npm install, no Chrome Web Store account.

## File layout

```
apps/seek-ghost-buster/
├── manifest.json                 Manifest V3 declaration
├── README.md                     this file
├── content/
│   ├── content.js                runs on every seek.com.au page
│   └── content.css               badge + banner styling (Maldives Beach palette)
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── background/
│   └── service-worker.js         seeds default settings, message routing
├── lib/
│   ├── parser.js                 DOM extractors for cards + detail pages
│   ├── scorers.js                ghost + scam + verdict
│   └── lists/
│       ├── boilerplate.js        stock-phrase detector
│       ├── ghost-keywords.js     "EOI", "Talent Pool", "Future Opportunities" etc.
│       ├── scam-signals.js       upfront-fee / sensitive-doc / WhatsApp patterns
│       └── au-recruiters.js      AU recruitment agency names (Hays, Robert Half, etc.)
└── icons/                        16/48/128px PNGs (placeholders for v1)
```

## Ghost signal weights

| Signal | Points |
|---|---|
| Posted 60+ days ago | +35 |
| Posted 30+ days ago | +20 |
| Posted 14+ days ago | +10 |
| No salary disclosed | +15 |
| Heavy boilerplate (3+ stock phrases) | +10 |
| Some boilerplate (1–2 stock phrases) | +5 |
| Ghost keyword ("EOI", "Talent Pool", "Future Opportunities") | +40 |
| Posted by recruitment agency | +10 |
| Employer is confidential / undisclosed | +10 |
| Entry-level role demanding 5+ years experience | +15 |
| Very short JD (under 200 words) | +5 |
| Very long JD (over 1500 words) | +5 |
| Promoted listing (`?type=promoted` in URL) AND date hidden | +15 |
| Promoted listing (date still visible) | +5 |
| Date obscured by "Featured" / "Promoted" tag | +10 |

## Scam signal weights

| Signal | Points |
|---|---|
| Mentions upfront payment / training fee | +50 |
| Asks for TFN / driver's licence / bank details pre-interview | +50 |
| Suspicious apply channel (WhatsApp / Telegram / SMS) | +25 |
| "Too good to be true" pattern ("no experience needed, $X/wk") | +25 |
| Generic title with inflated salary | +30 |
| Apply via free email domain (gmail / yahoo / outlook) | +20 |
| Vague / undisclosed employer | +15 |
| Generic role title alone | +10 |

## Privacy

- Everything runs in your browser.
- No data is sent to any server.
- History (used for repost detection) is stored in `chrome.storage.local` only on your device.
- Clear history any time: chrome://extensions → Ghost Buster → Details → Extension options (TODO v0.2) — or open DevTools on the popup and run `chrome.storage.local.clear()`.

## Known limitations (v0.1)

- SEEK occasionally changes its DOM `data-automation` attributes. If badges stop appearing, the selectors in `lib/parser.js` need a refresh.
- "Posted today" / "Posted X hours ago" both parse as 0 days old — correct, but won't differentiate.
- Banner injection point on the job detail page may shift if SEEK redesigns the page layout.
- Icons are placeholders — replace `icons/icon128.png` (etc.) with proper CyberSurf branded ones later.

## Roadmap

- v0.2: Settings page (clear history, tune thresholds, edit agency list)
- v0.3: Cross-check employer against the company's own careers page (would need a host permission for the employer's domain)
- v0.4: Firefox manifest variant

## Status

**v0.1 — sideload only.** Built and ready to test. No Chrome Web Store submission yet.
