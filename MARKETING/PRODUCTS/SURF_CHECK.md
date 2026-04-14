# Product: Surf-Check Security Assessment — $249
*Research & Strategy | Last updated: April 2026*

---

## PRODUCT SUMMARY

| Field | Detail |
|---|---|
| Name | Surf-Check Security Assessment |
| Price | $249 one-time |
| What it is | Full business security health check — the entry product for the B2B funnel |
| Status | **In Planning** |
| Tier | **Business (B2B) — never displayed on consumer homepage** |
| Funnel position | Entry to B2B. Sold via direct outreach to Sunshine Coast SMEs. Leads to Cyber Security Guard retainer. |
| Build required | Engagement letter (non-negotiable before first client) · Tally.so intake form · Cal.com briefing call · Website business landing page |

---

## PRODUCT ARCHITECTURE NOTE

The Surf-Check is the **business equivalent** of the Breach Check — it's the diagnostic that reveals the problem and creates the conversation for the ongoing solution (Cyber Security Guard).

```
Consumer:  Breach Check ($30) → Lock Change → 2FA → Dark Web Monitoring
Business:  Surf-Check ($249)  → Cyber Security Guard ($850/mo retainer)
```

These two funnels never mix on the website. The homepage is consumer-only.

---

## WHAT THE SURF-CHECK COVERS

A full business security health check across 5 vectors (the "Coast Guard" framework):

1. **Financial Perimeter (BEC):** Securing payment pipelines against invoice fraud and business email compromise
2. **Identity Hardening (MFA):** Assessing multi-factor authentication coverage across all business accounts
3. **Data Resilience (Backups):** Verifying off-site backup strategy, recovery speed, and ransomware readiness
4. **Automated Vulnerability Gaps:** External network scan — open ports, exposed services, unpatched CVEs
5. **Human Firewall:** Assessing staff credential hygiene; checking business email addresses in breach databases

**Deliverable:** Written risk summary report with specific recommended actions, risk ratings per category, and a clear pathway to remediation.

### Technical Tool Stack (Operations Lead owns methodology)
- Nmap — network port scanning
- Shodan — external attack surface (open ports, exposed services, router/device fingerprinting)
- Nessus Essentials / OpenVAS — vulnerability scanning
- HIBP + Dehashed — business email credential check
- Manual review of MFA coverage on key platforms

**Non-destructive assessment** — all scans are read-only. No penetration testing at this tier without explicit scope and separate engagement letter.

---

## TARGET AUDIENCE

| Segment | Why They Buy | Entry Point |
|---|---|---|
| Professional services (accountant, lawyer, financial planner) | OAIC NDB compliance liability — one breach notification = reputational damage + potential penalty | LinkedIn InMail + cold email |
| Healthcare (medical, dental, allied health) | Health records data = highest breach liability in AU; consistently #1 OAIC NDB sector | Direct email to practice managers + local medical association network |
| Construction / trade SMEs (5–50 staff) | BEC invoice fraud is the #1 attack vector for this sector; often no IT oversight | Referral from accountant; Chamber of Commerce |
| Retail / hospitality with POS systems | POS malware and staff credential reuse; seasonal workforce = credential hygiene gaps | Facebook local business groups; Chamber |

**Qualifying question:** *"Do you have someone actively monitoring your external exposure, or is that sitting with your IT provider?"* — If they say "my IT guy handles it," the response is: *"IT keeps the lights on. Security risk management is different. That's what the Surf-Check covers."*

---

## SALES CONVERSATION — COLD CALL SCRIPT

**The Hook:**
> *"Hi [Name], I'm Darryl Wessling at CyberSurf Security. We've been tracking a surge in targeted attacks on Sunshine Coast [sector] firms. Most local businesses are currently operating with significant gaps in their perimeter that leave them exposed to $40k+ in immediate recovery costs. I'm calling because we've identified your sector as high-risk."*

**The Value Proposition:**
> *"We provide a Surf-Check Security Assessment — a full 5-point audit of your business security. This isn't a basic IT check. We audit across financial perimeter, identity hardening, data resilience, automated vulnerability gaps, and staff credential hygiene. You get a written report with specific actions and risk ratings. One-time assessment — $249."*

**Objections:**

*"We have an IT guy."*
> *"IT keeps the lights on; CyberSurf keeps the doors locked. We work alongside your IT to provide the specialised security layer they often don't have the tools to manage."*

*"We'll look at it next quarter."*
> *"Cybercriminals don't wait for your budget cycle. The average local breach cost is now $56,600. Our assessment is a fraction of that and stops the bleed before it starts."*

**The Close:**
> *"I have an assessment slot open [day]. I'll provide a full risk briefing for you. Does 10:30 work, or is 2:00pm better?"*

---

## UPSELL PATHWAY TO CYBER SECURITY GUARD

**The trigger:** Assessment findings that require ongoing management — exposed credentials, open network ports, missing MFA, staff phishing vulnerability.

**The pivot:**
> *"The assessment has given us a clear picture of where your exposure sits. Some of these are quick wins you can action yourself — I'll walk you through those in the report. But a few of these are the kind of thing that need eyes on them continuously, not just once. That's what the Cyber Security Guard retainer is designed for. It's $850/month — your external security team, without the $130k salary."*

Target Surf-Check → Guard conversion rate: 20–30% of assessment clients.

---

## PRICING RATIONALE — $249

- **Penetration pricing for the B2B market:** Professional security assessments typically cost $2,000–$10,000+ at enterprise level. $249 is the "obvious yes" price for a business owner who has just been told their exposure.
- **Justified by deliverable:** A written report with specific actions and risk ratings. Not a verbal briefing — a document they can act on.
- **Sets up the $850/mo retainer:** A client who has just paid $249 and seen their exposure in writing is in the highest possible motivation state to commit to ongoing protection.
- **Review at 10 assessments:** If conversion to Guard retainer exceeds 25%, test $349 to widen the perceived gap to the retainer value.

---

## LEGAL — ENGAGEMENT LETTER REQUIRED

**Non-negotiable before first Surf-Check client:**
- Engagement letter defining scope of work
- Non-destructive assessment clause (no penetration testing without separate scope)
- Liability cap
- Confidentiality clause
- Data handling consent for any client systems or credentials reviewed

See `LEGAL/LEGAL_REGISTER.md` for template status.

---

## BUILD CHECKLIST

- [ ] Engagement letter template (LEGAL — prerequisite)
- [ ] Surf-Check assessment SOP (5-vector methodology — Operations Lead owns)
- [ ] Tally.so intake form (business name, sector, staff count, primary concerns)
- [ ] Cal.com briefing call booking (30-min discovery + 90-min assessment)
- [ ] Stripe product — $249
- [ ] Business landing page (separate from consumer homepage)
- [ ] Report template (written risk summary with RAG ratings)
- [ ] Professional Indemnity Insurance — confirmed before first client (see LEGAL_REGISTER)
