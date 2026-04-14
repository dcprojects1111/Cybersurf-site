# Product: Dark Web Monitoring — $15/mo
*Research & Strategy | Last updated: April 2026*

---

## PRODUCT SUMMARY

| Field | Detail |
|---|---|
| Name | Dark Web Monitoring (Tripwire — Home Guardian) |
| Price | $15/month or $30/2-month pack |
| What it does | Monthly scan of client email addresses against criminal breach databases; 24-hour alert if new credentials found |
| Covers | Up to 2 email addresses |
| Status | **Live** |
| Booking/payment | Stripe subscription → webapp |
| Funnel position | Ongoing retention — converts after Breach Check or Lock Change |

---

## PRODUCT DELIVERABLES

**Monthly (automated):**
- Dark web credential scan against 14+ billion records
- 24-hour breach alert notification if new exposure found
- Guidance on next steps if triggered

**What this product is NOT:**
- It is not IT support or managed services
- It is a risk reduction retainer — the product that creates the ongoing client relationship
- The subscription income that makes CyberSurf viable at scale: 100 clients = $1,500 MRR

---

## PRICING RATIONALE

**$15/month:**
- Below the cognitive "do I need this?" threshold — comparable to a streaming subscription
- $30 2-month pack adds an anchor and reduces churn risk (committed 60-day period)
- Renewal system: Day 55/60 renewal emails built and live
- Break-even for ops at 28 Dark Web Monitoring clients

**Why monthly beats annual at this stage:**
- Lower barrier to first purchase
- Renewal emails are the relationship touchpoint for upsells
- Customers who cancel after finding nothing can be re-engaged at the next breach event

---

## CONVERSION — POST-BREACH CHECK

**Best entry point:** Immediately after a positive Breach Check result.

> *"The credentials we found today came from a breach that may have happened 12 months ago. You didn't know. With monitoring in place, the next time we find your data — you'll know within 24 hours, not a year later."*

**Target conversion rate from Breach Check buyers:** 25–35% within 30 days.

**The fear driver is ongoing:** A $30 one-time check tells you where you stood yesterday. Monitoring tells you where you stand every month. The Breach Check creates the problem awareness; the monitoring subscription is the logical ongoing resolution.

---

## UPSELL PATHWAY

```
$30 Breach Check (report delivered)
    ↓  immediate: Lock Change upsell ($79)
    ↓  same day: Dark Web Monitoring pitch in report
    ↓  Day 3 email: re-introduce monitoring if not purchased
    ↓  Day 7 email: bundle offer
Dark Web Monitoring ($15/mo) activated
    ↓  Month 2: breach alert triggers OR
    ↓  Renewal email at Day 55 triggers → Surf-Check conversation (if SME)
```

---

## POST-BREACH EMAIL SEQUENCE (3-email nurture)

For customers who receive the Breach Check but don't buy monitoring immediately:

### Email 1 — Day 1 (delivered with report)
Subject: `Your CyberSurf Breach Report — and what to do next`

Include in report email body:
> *"Stay informed — not just for today's breach, but every breach going forward. Your report is a snapshot of what exists today. The dark web doesn't stop producing new breach data after we send this report. The $30 Tripwire subscription puts ongoing monitoring in place — you'll receive a notification within 24 hours any time your credentials appear in a new breach database. That's the difference between knowing about a problem the day it's discovered and finding out a year later."*
> [See the $15/mo Dark Web Monitoring →]

### Email 2 — Day 3
Subject: `One thing most people miss after a breach check`

> *"The report we sent on [date] showed [result]. What most people don't realise: breach databases are updated continuously. New breach data surfaces every week — sometimes from events that happened months or years earlier. What we found on [date] is accurate as of that day. What happens next month, or the month after, we won't know unless we're watching.*
>
> *That's what the $15/month Dark Web Monitoring does — it keeps watching so you don't have to.*
>
> *[Start monitoring for $15/month →]*
>
> *Cancel anytime. No lock-in.*"

### Email 3 — Day 7
Subject: `Last note from me on this`

> *"This is the last email I'll send about next steps from your breach report. If the timing hasn't been right, that's completely fine.*
>
> *One thing worth knowing: the people whose credentials are most at risk of being used are usually those who checked, found something, changed one password, and then moved on — because they feel like they've dealt with it. The credential is changed. But the monitoring is off. The next breach isn't on the radar.*
>
> *If that sounds like your situation, the $15/month monitoring is the one thing that catches what comes next. No obligation. [Start here →]*
>
> *Darryl Wessling | CyberSurf Security | Sunshine Coast"*

**Why "Last note from me" works:** It's honest. It creates a natural close without pressure. It also names the specific psychological pattern (checked → felt safe → became vulnerable again) that your exact buyer recognises in themselves.

---

## REVENUE MODEL

| Clients | MRR | Annual ARR |
|---|---|---|
| 28 | $420 | $5,040 |
| 50 | $750 | $9,000 |
| 100 | $1,500 | $18,000 |
| 200 | $3,000 | $36,000 |

**100 monitoring clients = $1,500/month MRR before a single business retainer is signed.** This is the foundation that makes CyberSurf financially stable.

At Phase 1 gate (Day 60): target 50 active monitoring subscribers.

---

## KEY OBJECTION

**"I can use HIBP for free."**
> *"HIBP tells you about breaches that happened and were publicly indexed. It won't alert you when a new breach drops that includes your email. It won't tell you what password was exposed. And it won't tell you within 24 hours — you'd have to remember to go check it yourself. The $15 is for the watch, not just the check."*

---

## STEALER LOG GAP — DISCLOSURE REQUIRED

Current dark web monitoring (Dehashed + HIBP) does not cover infostealer malware logs (Redline, Vidar, Raccoon, etc.) which contain session cookies and saved browser passwords. These appear in enterprise services (SpyCloud, Flare, Hudson Rock) at $500+/month.

**Report disclaimer must include:**
> *"This monitoring searches 14+ billion records across indexed breach databases. It does not cover infostealer malware logs or private criminal forum data, which may contain additional exposed credentials."*

This gap also represents a future **Monitoring+ upsell** if Hudson Rock free tier or SpyCloud partner pricing becomes accessible.
