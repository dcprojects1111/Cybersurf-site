# CyberSurf — Report Storage Policy
*Operations Lead · Lawyer-reviewed*
*Last updated: 2026-04-17*

---

## Purpose

This document records CyberSurf's decision on where to store breach check reports, why pCloud was selected, and the operational procedures for secure storage, delivery, and auto-deletion.

---

## Storage Platform Decision: pCloud

**Platform chosen:** pCloud (private folder — never shared)
**Decision date:** 2026-04-17

### Why pCloud Was Chosen

| Reason | Detail |
|--------|--------|
| **Already in use** | CyberSurf already holds a pCloud account. No new vendor, no new cost, no new login. |
| **Built-in file expiry** | pCloud has a native "Set expiration date" feature on individual files. Reports can be set to auto-delete 7 days after upload — no manual action, no cron job, no third-party tool required. |
| **Encrypted at rest** | Files stored on pCloud are encrypted at rest. Suitable for temporary storage of sensitive documents. |
| **Private folder control** | pCloud allows fully private folders that are never publicly accessible unless a share link is explicitly created. |
| **Cost** | Already paid for. Zero additional cost at current volume. |

### Why Alternatives Were Rejected

| Platform | Reason Rejected |
|----------|----------------|
| Proton Drive | No auto-delete feature — requires manual deletion. Higher operational risk. |
| AWS S3 | Overkill at current volume. Added complexity and cost for no benefit at this stage. |
| Google Drive | No auto-delete. Google scans file contents. Wrong signal for a cybersecurity business. |
| Dropbox | No auto-delete. No meaningful advantage over pCloud. |

---

## Retention Rules

| Item | Retention Period | Storage Location | Deletion Method |
|------|-----------------|-----------------|----------------|
| Breach report (backup copy) | 7 days from link sent | Private pCloud folder | pCloud file expiry (auto) |
| Breach metadata (email, breach names, risk score, date) | 30 days | Secure database/records | Manual or scheduled deletion |
| Passwords / credentials | Zero — never stored | N/A | Never written to disk |
| Order record (name, contact, date, payment) | 5 years (tax obligation) | Secure records | Scheduled deletion at 5 years |

---

## Operational Procedure

### When a report is generated:

1. Upload report to `pCloud/CyberSurf-Reports/` — **private folder, never shared**
2. Name the file by **order ID only** — e.g. `ORD-2026-001.pdf`
   - Never include customer name or email in the filename
3. Right-click the file in pCloud → **"Set expiration date"** → set to **7 days from today**
4. Generate the single-use delivery link and send to customer
5. pCloud auto-deletes the file after 7 days regardless of whether the customer accessed it

### Folder structure:

```
pCloud/
└── CyberSurf-Reports/          ← private, never shared
    └── ORD-2026-001.pdf        ← order ID only in filename
    └── ORD-2026-002.pdf
```

### If a customer reports a broken link (within 7 days):

- Locate the file in `CyberSurf-Reports/` by order ID
- Generate a new single-use delivery link
- Send to customer and note in order record

### If a customer contacts you after 7 days:

- The report has been auto-deleted — this is correct and intended
- Re-run the breach check and re-deliver
- Charge or waive at your discretion — the ToS states delivery is complete when the link is sent

---

## Legal Basis

- **APP 11.2** (*Privacy Act 1988* Cth) — personal information must be destroyed or de-identified when no longer needed for the purpose it was collected. A 7-day backup window is proportionate to the service delivery purpose.
- **ToS Section 5** — delivery is complete when the link is sent, not when it is opened. The 7-day backup is a customer service measure, not a legal obligation.
- **ToS Section 6.4** — states CyberSurf does not retain a copy of the report after delivery. A one-line update is required to cover the 7-day backup window (see below).

### Required ToS update (Section 6.4):

Add the following sentence:

> *"We may retain a backup copy of your report for up to 7 days from the date the link was sent, solely to re-deliver in the event of a technical failure. After 7 days, all copies are permanently deleted."*

---

## Review Trigger

Review this policy if:
- Monthly report volume exceeds 100/month (consider automated S3 lifecycle rules)
- pCloud removes or paywalls the file expiry feature
- A data breach or privacy complaint requires a policy audit
