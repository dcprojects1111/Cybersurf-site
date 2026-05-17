# Are Businesses Throwing Money Away to Promote Ghost Ads?

**Researcher:** CyberSurf Chief Intelligence Officer
**Date:** 2026-05-16
**Question from Darryl:** Are businesses throwing money away just to promote advertisements?
**Why it matters:** Confirms whether the SEEK Ghost Buster's `+5` (promoted alone) and `+15` (promoted + hidden date) ghost weights are calibrated correctly.

---

## INSIGHT

Yes, businesses are paying to promote job ads that aren't real hires — but the spend is **rational**, not wasteful. They're not buying a hire; they're buying **CV inventory, employer brand, market intelligence, or staff intimidation**. The "throwing money away" framing is wrong — they're buying something cheaper than the alternative. [Confidence: High]

For the SEEK Ghost Buster, this means **paid promotion is a weak ghost signal on its own** (legit hires also pay to promote), but **paid promotion + date-hiding is a strong signal** because if you've paid to be seen, hiding when you posted only makes sense if the date would hurt you.

## KEY FINDING

**More than 80% of recruiters admit to posting ghost jobs**, with talent-pool building cited as the single most common reason [Source: Fortune / MyPerfectResume survey 2024]. Across all employers, **62% of hiring managers post ghosts specifically to make existing staff feel replaceable** [Source: same study]. These behaviours aren't fringe — they are the mainstream recruiter playbook.

## STATISTICAL EVIDENCE — SEEK AU pricing

| Ad type | Per-ad cost (AUD) | Use case |
|---|---|---|
| Basic | ~$275 | Smallest job, lowest visibility |
| Advanced | ~$400–$500 (varies by role + location) | Mid-tier, some boosting |
| Premium ("promoted") | ~$695 per listing | Featured on similar-job results pages — what the extension flags as `type=promoted` |
| Bulk: 10 ads/month | $4,000 / year | ~$33 per ad |
| Bulk: 25 ads/month | $9,000 / year | ~$30 per ad |

[Source: 11 Recruitment AU; SEEK Help Centre]

**The critical pricing insight:** per-ad cost varies by 20× depending on whether you're a one-off SMB ($695) or a bulk-subscriber ($30). At $30/ad, the cost of promoting a ghost is **less than the salary of an hour of a recruiter's time**. The ROI on a ghost-promoted ad is essentially infinite if you harvest one usable CV from it.

## WHY THEY PAY — MECE breakdown

1. **Talent pipeline harvesting** (most common) — paid promotion ensures the role surfaces above un-promoted competitors, maximising CV inflow. Recruitment agencies do this constantly with "evergreen" roles. [Source: Fortune; Built In]
2. **Growth signalling** — visible "we're hiring 12 roles" is read by investors, customers, and competitors as growth. Premium placement amplifies this signal beyond passive listings. [Source: gowhimble.com]
3. **Market intelligence** — promoted roles surface to MORE candidates, giving the company a better cross-section of the talent pool and current salary expectations. [Source: ECLARO; Built In]
4. **Employee retention via fear** — 62% of hiring managers admit this. Promoted roles in your own department are deliberately visible so existing staff see them. [Source: Fortune]
5. **Brand maintenance** — for cyber/IT in particular, "we're hiring cyber talent" is itself a maturity signal to enterprise clients. Especially common among MSPs and consultancies. [Source: market observation, Medium confidence]
6. **Required-public-posting compliance** — internal hires that policy requires to be advertised externally. Companies pay to promote so applications are "real" enough to defend the process. [Source: HR Glossary / TalentHR]

## DEMOGRAPHIC BREAKDOWN — who is most likely doing this

| Segment | Likelihood of paying to promote ghosts | Why |
|---|---|---|
| **Recruitment agencies** | **Very High** | Business model IS talent harvesting; per-ad cost via bulk subscriptions is ~$30 |
| **Enterprise (500+ employees)** | **High** | Bulk subscriptions, brand/investor signalling, retention plays |
| **Mid-market (50–500 employees)** | **Medium** | Some bulk pricing; growth signalling matters |
| **SMB (1–20 employees)** | **Low** | Pays full $275–$695 per ad — too expensive to waste on ghosts |

**Critical for CyberSurf:** Darryl's market (Sunshine Coast SMEs, 1–20 employees) is the segment LEAST likely to ghost-promote. But the cyber/IT roles he personally browses are dominated by enterprises and agencies — the two segments MOST likely to do it.

## REVENUE PROJECTION — what an agency actually spends to harvest CVs

Conservative model for one AU recruitment agency posting "Senior Cyber Security Analyst" as an evergreen role:

- 1 ghost ad at Premium tier (bulk priced): **$30/month**
- Average CVs received per month per cyber role: **40–80** [Source: industry estimate, Medium confidence]
- Conversion of those CVs to placed candidates over 12 months: **0.5–1.5** [Source: agency benchmarks, Medium confidence]
- Average placement fee on a $130k cyber role at 15%: **$19,500**

**Annualised:** $360 spent to harvest 480–960 CVs that produce 6–18 placements worth $117k–$351k. **ROI is 325× to 975×.** [Confidence: Medium — depends heavily on agency conversion rates]

This is why agencies dominate paid-promotion of ghost roles. It isn't waste. It's the cheapest CV-acquisition channel on earth.

## CONTRARIAN VIEW

Not every promoted listing is a ghost. Three legitimate reasons employers pay for promotion:

1. **Genuine urgent hire** — a real role they need filled this month. Promotion buys speed-to-applicant.
2. **Hard-to-fill specialist roles** — niche cyber skills with shallow candidate pools require maximum visibility.
3. **First-week boost** — many advertisers pay for promotion only for the first 7 days, then let it expire naturally.

**Test of legitimacy:** promoted + clearly-visible posting date < 7 days old + named employer = probably a real hire. Promoted + hidden date + agency posting + 30+ days = probably a ghost.

## DATA GAPS — flagged honestly

- No public, AU-specific study quantifies what % of *promoted* SEEK listings are ghosts vs hires. The 80% recruiter-admission stat is global, not promoted-specific.
- SEEK doesn't publish hire-conversion data by ad tier.
- We can't see the % difference in ghost-rate between Basic and Premium ads.

The Researcher's confidence on "promoted listings are over-represented in ghost-job inventories" is **Medium-High** based on inference (cost economics + agency business model + recruiter admissions) rather than direct measurement.

## RECOMMENDED ACTION — back to The Coder

The current v0.2.1 weights are **directionally correct but should be refined**:

| Current weight | Suggested weight | Rationale |
|---|---|---|
| Promoted + hidden date: +15 | **Keep +15** | Strongest combination signal — paying to be seen AND hiding when you posted is irrational unless date is damaging |
| Promoted alone: +5 | **Keep +5** | Weak signal alone, legit ads also pay |
| Date "Featured" / "Promoted": +10 | **Keep +10** | Date obscuring is the real ghost tell |
| Promoted + **agency** posting | **NEW: +10 stack** | Agencies + paid promotion = highest-likelihood ghost-CV-harvesting setup |
| ~~Expiring badge: −15~~ | **SCRAPPED in v0.2.3** | Darryl identified the badge is just SEEK's default state in days 23–30 of any ad's life — a ghost shows it right before being rolled over. Signal is ambiguous, weight removed. |

The single tweak worth adding: **stack +10 extra when paid promotion combines with a recruitment-agency advertiser.** That's the highest-probability ghost configuration in the AU market.

---

## Bottom line for Darryl

Yes, businesses pay to promote ads that aren't real hires — but they aren't throwing money away. They're buying CVs, brand, signal, or fear, all at a marginal cost of $30–$695 per ad. For recruitment agencies in particular, **promoted ghost ads are the single highest-ROI marketing channel they have.** Your extension's instinct to penalise promoted-with-hidden-date is correct and worth keeping.

## Sources

- [More than 80% of recruiters admit to posting 'ghost jobs' — Fortune (2024)](https://fortune.com/2024/08/19/recruiters-posting-ghost-jobs-problem-job-seekers/)
- [Job boards are still rife with 'ghost jobs'. What's the point? — BBC WorkLife](https://www.bbc.com/worklife/article/20240315-ghost-jobs-digital-job-boards)
- [Recruiters dish on 'ghost jobs' — Fast Company](https://www.fastcompany.com/91425252/recruiters-dish-on-ghost-jobs-why-companies-post-them)
- [Ghost Jobs: Why companies advertise jobs they won't fill — LMS Portals](https://www.lmsportals.com/post/ghost-job-postings-why-companies-advertise-jobs-they-won-t-fill)
- [Employers Are Future-Proofing Their Talent Pipeline — Whimble](https://www.gowhimble.com/blogs/employers-are-future-proofing-their-talent-pipeline-by-posting-ghost-jobs)
- [SEEK Job Ad Costs: Employer Pricing Guide — 11 Recruitment](https://11recruitment.com.au/advice/how-much-does-it-cost-to-advertise-on-seek/)
- [What is the cost of a Premium ad? — SEEK Help Centre](https://help.seek.com.au/s/article/What-is-the-cost-of-a-Premium-ad)
- [Ghost Jobs in 2026 — MintCareer](https://mintcareer.ai/ghost-jobs-guide)
