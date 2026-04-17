# CyberSurf — Post-Purchase Email Sequence
*Built by Researcher · Marketing Executive · Sales Executive · Editor-approved 52/60*
*Last updated: 2026-04-17*

---

## Overview

**Purpose:** Convert Basic Breach Check ($30) buyers into Dark Web Monitoring subscribers, 2FA Session bookings, and Complete Protection Bundle clients.

**Platform:** MailerLite (free tier — up to 1,000 subscribers)
**Trigger:** Stripe payment confirmed → Zapier → MailerLite subscriber added → sequence fires
**Suppression rule:** If buyer purchases any upsell, stop sequence and suppress remaining CTAs for that product.

**Commercial logic:**
| Email | Primary CTA | Revenue if converted |
|-------|-------------|---------------------|
| Email 1 — Day 1 | Dark Web Monitoring $15/mo | $180/yr recurring |
| Email 2 — Day 3 | 2FA Activation Session $79 | $79 one-off |
| Email 3 — Day 7 | Complete Protection Bundle $149 | $149 + $15/mo |

**Conservative conversion targets (50 breach checks/month):** ~$1,500/month in downstream revenue from buyers who already said yes once.

---

## EMAIL 1 — Day 1: Report Delivery + Dark Web Monitoring Upsell

**Subject A:** `Your CyberSurf breach report is ready`
**Subject B:** `Your report: [X] breaches found`
**Preview text:** `Download it now — the link expires in 48 hours.`

---

Your breach report is ready.

Hi [First Name],

Your CyberSurf Basic Breach Check is complete. Download your report using the link below — it expires in 48 hours and won't be stored after that.

**[DOWNLOAD YOUR REPORT →]**

---

**What your report means**

If we found breaches, your email and potentially your passwords have been in criminal hands. The breach happened in the past — but the credentials are still being traded right now.

That's why the question isn't just *"was I breached?"* — it's *"am I being breached right now?"*

---

**Dark Web Monitoring — $15/month**

We scan breach intelligence databases including HaveIBeenPwned and Dehashed — over 14 billion exposed records — every month and alert you the moment your details appear in a new breach. Most people find out about a breach 18 months after it happens. We tell you within days.

**[START MONITORING FOR $15/MO →]**

No lock-in. Cancel anytime.

— Darryl Wessling, CyberSurf Security

---

## EMAIL 2 — Day 3: Password Manager + 2FA Setup Guide

**Subject A:** `The one thing that actually stops a breach from becoming a disaster`
**Subject B:** `Changed your passwords yet? (Here's the easy way)`
**Preview text:** `Takes 20 minutes. Works on your phone.`

---

Hi [First Name],

Most people who get a breach report change one or two passwords and stop. Here's the 20-minute setup that actually holds.

**Step 1 — Get a password manager (free)**

Bitwarden is free, works on every device, and is used by security professionals worldwide. It generates a unique password for every account and remembers them all — you only need to remember one master password.

**[Download Bitwarden — Free →]** *(bitwarden.com)*

**Step 2 — Turn on two-factor authentication**

Even if someone has your password, 2FA stops them getting in. Download Authy (free) and turn on 2FA for your email, bank, and any account that showed up in your breach report first.

**[Download Authy — Free →]** *(authy.com)*

Start with those two steps. That's it.

If you'd like us to walk you through the setup in person, our 2FA Activation Session is $79 and takes about an hour at your home or office on the Sunshine Coast.

**[Book a 2FA Setup Session →]**

— Darryl

---

## EMAIL 3 — Day 7: Complete Protection Bundle

**Subject A:** `Still haven't set up your password manager? We'll do it with you.`
**Subject B:** `One hour. Fully protected. Here's the deal.`
**Preview text:** `Everything set up. Nothing left to worry about.`

---

Hi [First Name],

A week ago you found out your credentials were exposed. Here's what most people still haven't done by Day 7:

✗ Changed their passwords properly
✗ Set up a password manager
✗ Turned on two-factor authentication

That's not laziness — it's that nobody showed them how.

**The Complete Protection Bundle — $149**

One 90-minute session at your home or office. We set everything up for you:

✓ Bitwarden installed and configured on all your devices
✓ 2FA activated on your email, banking, and top accounts
✓ Your existing passwords migrated and the weak ones replaced
✓ Dark Web Monitoring activated ($15/mo — first month included)

You walk away with nothing left on the to-do list.

**[Book the Complete Protection Bundle — $149 →]**

Available on the Sunshine Coast. Book a time that suits you.

— Darryl

*P.S. — If $149 isn't the right fit right now, the 2FA Activation Session alone is $79. Either way, getting set up is the right call.*

---

## Build Checklist

- [ ] Create MailerLite free account at mailerlite.com
- [ ] Set up automation sequence with 3 emails at Day 1 / Day 3 / Day 7
- [ ] Connect Stripe via Zapier (free tier — 100 tasks/month covers low volume)
- [ ] Add suppression tags — stop sequence when purchase tag is applied
- [ ] A/B test subject lines once you hit 100+ sends
- [ ] Test end-to-end with a $1 test Stripe payment before going live

---

## Platform Notes

**MailerLite free tier:** 1,000 subscribers · 12,000 emails/month · full automation included
**Zapier free tier:** 100 tasks/month — sufficient at launch volume
**Upgrade trigger:** When monthly breach check volume exceeds ~30/month, review Zapier task count

*Editor score: 52/60 — Approved for build*
