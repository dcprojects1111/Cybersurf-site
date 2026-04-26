# CyberSurf — Project Tasks & Updates

---

## Brand & Copy Rules

### Never name breach database tools in customer-facing copy
- Do NOT mention: Dehashed, HaveIBeenPwned, HIBP, or any other tool by name
- Customers will Google them and do it themselves for free
- Use instead: "criminal breach databases", "multiple breach databases", "Verified Breach Records"
- This applies to: website, reports, emails, social posts, sales materials



---

## Session Log — 15 April 2026

### Products Live & Taking Payments

| Product | Price | Stripe | Render | Status |
|---|---|---|---|---|
| Basic Breach Check | $30 | ✅ | ✅ | Live |
| Lock Change Session | $79 | ✅ | ✅ | Live |
| 2FA Activation | $49 | ✅ | ✅ | Live |
| Home Security Scan — 3 devices | $229 | ✅ | ✅ | Live — price IDs corrected 15 Apr |
| Home Security Scan — 6 devices | $269 | ✅ | ✅ | Live — price IDs corrected 15 Apr |
| Complete Home Security Check | $299 | ✅ | ✅ | Live — price IDs corrected 15 Apr |
| Home Security Fix Session | $149 | ❌ | ❌ | Stripe product not created yet — free offer active for first 7 customers |

### Today's Work
- Renamed Home Security Scan Bundle → **Complete Home Security Check**
- Built **Home Security Fix Session** — free launch offer for first 7 homes
  - Landing page: `home-fix.html`
  - Scoped to malware removal and vulnerabilities only (not passwords/2FA)
  - Same-day condition added to landing page, booking form, and Terms (Section 5C)
  - Live spots counter on booking form (reads from DB)
  - `FREE_FIX_SLOTS` env var on Render — change to extend offer beyond 7
- Added Fix Session upsell line to Home Security Scan confirmation email
- Social posts created: LinkedIn, Facebook, Instagram — saved to `MARKETING/SOCIAL_POSTS.md`

### Still To Do
- [ ] Create Stripe product: Home Security Fix Session — $149 → `FIX_SESSION_PRICE_ID` on Render
- [ ] Create Cal.com event: Home Security Fix Session — slug `home-security-fix`, 90 min, in-person
- [ ] Create Cal.com event: Home Security Scan — slug `home-security-scan`, 2.5–3 hrs, in-person
- [ ] Build Google Form consent form for in-person scans
- [ ] Publish social posts (LinkedIn, Facebook, Instagram)
- [ ] Wire up Kali Linux MCP server — install Kali as second WSL2 distro (`wsl --install -d kali-linux`), install tools (nmap, nikto, dnsutils, whois), install `mcp` Python package, then add MCP config entry to `~/.claude/settings.json` pointing at `mcp_server.py` via `wsl -d kali-linux`

---

## Session Log — 9 April 2026

### Updates to PIPELINE_DASHBOARD.html

**1. Home Security Scan Bundle (#8) Added**
- Status: To Do — Month 3
- Combines: Product #2 (Home Security Bundle) + Product #7 (Home Security Scan — In-Person)
- Price: $249 one-off (saves $58 vs $307 bought separately)
- Components: Basic Breach Check ($30) + Password Manager Setup ($79) + 2FA Activation ($49) + In-Person Scan 3 devices ($149)
- Dependency: Do not launch until #2 and #7 are both defined and tested
- Key message: "Everything done in one visit — no multiple bookings"

**2. Editor Review Applied**
- Removed redundant "30-min in-person security briefing included" line from Bundle #8
- Replaced with: "Everything done in one visit — no multiple bookings" (the real buying reason)
- Editor score: 51/60 — APPROVED

**3. 90-Day Roadmap Rebuilt as Accelerated Sprint Plan**
- Old plan: 3 months of weekly blocks
- New plan: 4 sprint weeks — all 8 products live by end of April 2026
- Day 1–2: Dark Web Monitoring live
- Day 3–4: 2FA Activation Service live
- Day 5–7: Password Manager Setup live
- Day 8–10: Home Security Bundle (#2) live
- Day 11–14: Small Business Package live
- Day 15–17: Home Security Scan — Remote (#6) live
- Day 18–21: Home Security Scan — In-Person (#7) live
- Day 22–25: Home Security Scan Bundle (#8) live
- Day 26–30: Review, consolidate, begin Month 2 retainer push
- Month 1 Target: All 8 products live · 5+ monitoring subscribers · ~$500–800 revenue
- Month 2–3 Target: 20 monitoring subscribers + 2 retainers · ~$2,500–3,500/mo run rate
