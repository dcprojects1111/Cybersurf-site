# SEEK Job Analyser

A filter for SEEK job listings. Strips out ghost jobs and scams so you only see real, active hires.

## What it does

The analyser scores every job on **two dimensions only**:

1. **Ghost likelihood (0–100)** — is this a "fake" job? Posted to look like the company is hiring, but no real intent to fill it.
2. **Scam likelihood (0–100)** — is this listing fraudulent? Recruitment scams, identity-harvesting, fake recruiters, MLM/pyramid-style "opportunities".

That's the whole tool. No skill-matching, no profile, no fit scoring.

## Two modes

| Mode | Input | Output |
|---|---|---|
| **A — Search filter** | A SEEK search results URL | The full results list, re-sorted: real jobs at top, likely ghosts/scams at bottom (or filtered out entirely with `--strict`) |
| **B — Single job check** | One SEEK job URL | Detailed breakdown of why a single ad scored the way it did |

Typical workflow:

```
1. You search SEEK in browser     → copy URL of results page
2. npm start -- filter <URL>       → see real jobs only (Mode A)
3. npm start -- check <JOB_URL>    → deep-dive any single job (Mode B)
```

## How Ghost likelihood is scored

Each signal contributes points. More points = more likely ghost.

| Signal | Points |
|---|---|
| Posting age 30+ days | +20 |
| Posting age 60+ days | +35 |
| No salary band disclosed | +15 |
| Boilerplate-heavy copy ("fast-paced", "wear many hats", "team player", etc.) | +10 |
| Job ad under ~200 words OR over ~1500 words | +5 |
| Identical ad seen and reposted in our history | +25 |
| Agency-posted (not direct employer) | +10 |
| Impossible requirements (entry-level + 7yr exp) | +15 |
| No company name / generic "confidential employer" | +10 |

Threshold: **>60 = likely ghost**, **>80 = almost certainly ghost**.

## How Scam likelihood is scored

| Signal | Points |
|---|---|
| Asks for upfront payment / training fees | +50 (auto-flag) |
| Requests personal documents before interview (TFN, ID, bank details) | +50 (auto-flag) |
| Salary wildly above market ($200k for entry-level admin) | +30 |
| Apply via WhatsApp / Telegram / personal email only | +25 |
| Job description full of typos / poor grammar | +15 |
| Generic role title ("data entry specialist", "online assistant") | +10 |
| Company name doesn't match domain in apply link | +20 |
| "Work from home, no experience needed, $X per week" pattern | +25 |
| Vague employer with no online footprint | +15 |

Threshold: **>50 = likely scam**, **>80 = almost certainly scam — do not apply**.

## Output — traffic light system

Every job gets a single colour verdict based on its Ghost and Scam scores combined:

| Light | Meaning | When it shows |
|---|---|---|
| 🟢 **GREEN** | Go — real, active hire | Ghost < 40 AND Scam < 25 |
| 🟠 **ORANGE** | Warning — proceed carefully | Ghost 40–70 OR Scam 25–50 |
| 🔴 **RED** | Don't apply | Ghost > 70 OR Scam > 50 |

Example output:

```
🟢 GREEN    Senior SOC Analyst — Suncorp Brisbane          Ghost 12  Scam 0
🟢 GREEN    IT Security Officer — SC Council               Ghost 24  Scam 5
🟠 ORANGE   Cyber Risk Consultant — KPMG Brisbane          Ghost 52  Scam 8
            ↳ 34 days old, generic JD — verify on company careers page
🔴 RED      Cyber Manager — [Agency] Sydney                Ghost 78  Scam 8
            ↳ 47 days old, no salary, reposted twice — likely ghost
🔴 RED      Cybersecurity Assistant — Work from home       Ghost 35  Scam 88
            ↳ Apply via WhatsApp, $2000/wk no experience — likely scam
```

Default sort: green at top, orange in middle, red at bottom. `--strict` flag hides red entirely.

## Why this matters

Ghost jobs are ~25% of cyber listings in 2026. Scams are ~5% and rising. Filtering them out before you scan = saved hours and zero wasted applications on fake roles.

## Status

**Not built yet.** Scope locked. Build starts on greenlight.

## Build order

1. Single-job parser (Mode B core — pulls fields from one SEEK URL)
2. Local history store (JSON or SQLite) so we can detect reposts
3. Ghost score calculator
4. Scam score calculator
5. Mode A wrapper (loops parser over a search results page)
6. Terminal output renderer

## Prerequisites

- Node.js 20 LTS (pinned via `.nvmrc`)
- WSL Ubuntu (or any Linux/macOS)
- npm 10+ (ships with Node 20)

```bash
nvm use
npm install
npm start
```

## Legal flag

Before this app does anything beyond local experimentation, route through **The Lawyer**:
- SEEK Terms of Use on automated access
- Rate-limit aggressively, set a User-Agent, respect robots.txt
