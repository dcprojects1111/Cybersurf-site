# Home Security Scan — Delivery SOP
*Operations | Last updated: April 2026*

---

## PRODUCT VARIANTS

| Product | Price | Format |
|---|---|---|
| Home Security Scan — Remote | $79 (3 devices, +$40 up to 6) | External scan only — no on-site visit |
| Home Security Scan — In-Person | $149 (3 devices, +$40 up to 6) | On-site Sunshine Coast + external scan |

---

## BEFORE YOU START — CONSENT

Get written consent before scanning anything. An email from the client confirming the following is sufficient at this stage:

> *"I authorise CyberSurf Security to perform an external network scan on my internet connection at IP address [x.x.x.x] on [date]. I confirm this IP address belongs to my home/business network."*

Do not scan without this. One line in writing is all you need — but you need it.

---

## STEP 1 — GET THEIR PUBLIC IP

Ask the client to:
1. Go to `whatismyip.com`
2. Copy the IP address shown
3. Send it to you via email

Do not try to find it yourself. They hand it to you as part of the process.

---

## STEP 2 — SHODAN (Passive — run first, no traffic sent to client)

Go to `shodan.io` and search their IP address.

**What to look for:**

- Any open ports listed
- Device type / banner (e.g. "NETGEAR router", "Hikvision camera")
- Software version numbers — especially if outdated
- CVEs listed against detected software (Shodan flags these automatically)
- Geographic confirmation — does the location match Sunshine Coast?

**Why Shodan first:** It shows you what the internet already knows about their network before you've touched anything. If Shodan is showing a router admin page, a camera feed, or an RDP login — that's already a critical finding and you haven't sent a single packet.

**Screenshot everything** from Shodan — this is evidence for the report.

---

## STEP 3 — NMAP SCAN (Active — sends packets to client IP)

Run from your own machine or a VPS. Standard command for this service:

```bash
nmap -sV -sC --open -T3 <client_ip>
```

**Flags explained:**
- `-sV` — detect service versions (what software is running on each open port)
- `-sC` — run default scripts (grabs banners, checks for common misconfigs)
- `--open` — only show open ports (cleaner output)
- `-T3` — normal timing (not aggressive, won't trigger alarms or cause disruption)

**Save the output:**
```bash
nmap -sV -sC --open -T3 <client_ip> -oN client_scan_results.txt
```

---

## PORT REFERENCE TABLE

Use this to interpret what you find. The key principle: **most home networks should show zero open ports on their public IP.** Any open port is a finding. The question is whether it's expected, intentional, and safe.

> **Important:** You only see a port on someone's public IP if they have **port forwarding** set up on their router. Gaming consoles and PCs make outbound connections — they don't open inbound ports unless someone deliberately forwarded them. If you find gaming ports open, it means someone set up port forwarding, usually to improve NAT type or host a game server.

### Critical / Always Flag

| Port | Service | What It Means | Risk |
|---|---|---|---|
| 23 | Telnet | Unencrypted remote access — almost never legitimate | **CRITICAL** |
| 3389 | RDP | Windows Remote Desktop exposed to internet | **CRITICAL** |
| 5900 | VNC | Remote desktop, often unencrypted | **CRITICAL** |
| 21 | FTP | Unencrypted file transfer | **HIGH** |
| 445 | SMB | Windows file sharing — should never be public | **CRITICAL** |
| 1433 | MSSQL | Database server exposed | **CRITICAL** |
| 3306 | MySQL | Database server exposed | **CRITICAL** |

### Flag and Investigate

| Port | Service | What It Means | Risk |
|---|---|---|---|
| 22 | SSH | Remote access — is this intentional? Who set it up? | **HIGH** |
| 8080 / 8443 | Alt HTTP/HTTPS | Often router admin panel — should not be public | **HIGH** |
| 554 | RTSP | Security camera stream — is it password protected? | **HIGH** |
| 53 | DNS | DNS resolver — should not be public on a home network | **MEDIUM** |
| 25 / 587 | SMTP | Email server — rarely legitimate on a home connection | **MEDIUM** |
| 80 | HTTP | Web server — what is it serving? | **MEDIUM** |
| 443 | HTTPS | Web server (encrypted) — what is it serving? | **LOW–MEDIUM** |

### Gaming — Usually Low Risk if Intentional

These ports only appear if the client has set up port forwarding on their router. Ask them if they know about it. If they didn't set it up, that's the issue — not the port itself.

| Port(s) | Service | Notes |
|---|---|---|
| 3074 TCP/UDP | Xbox Live / PlayStation | Standard console port forwarding — low risk if intentional |
| 3478–3480 TCP/UDP | PlayStation Network | PSN connectivity — common for PS4/PS5 NAT Type improvement |
| 88 UDP | Xbox Live (Kerberos auth) | Part of Xbox port forwarding set |
| 3544 UDP | Xbox Live (Teredo) | IPv6 tunnelling for Xbox — low risk |
| 27015–27030 UDP | Steam | Game traffic — only visible if port forwarded |
| 27036 TCP/UDP | Steam Remote Play | Remote Play feature — flag if client doesn't use this |
| 4380 UDP | Steam | Steam client communication |
| 25565 TCP/UDP | Minecraft Java Edition | **Only open if they're hosting a Minecraft server** — ask |
| 19132–19133 UDP | Minecraft Bedrock | Bedrock server (PC/console cross-play hosting) |
| 5222 TCP/UDP | Fortnite / Epic Games | Epic Online Services — low risk if intentional |
| 5795–5847 UDP | Fortnite | Game traffic — unusual to see externally |

**What to say to the client about gaming ports:**
> *"We found ports associated with [Xbox/PlayStation/Minecraft] open on your connection. This means your router is set up to forward gaming traffic — usually done to improve online performance. This is low risk as long as it was set up deliberately and is pointing to your console or PC, not an unknown device. We'll note it in the report."*

If they don't know who set up port forwarding — that's a finding worth flagging, as it means someone had access to their router settings.

### NAS / Smart Home / IoT

| Port | Service | Notes |
|---|---|---|
| 5000 / 5001 | Synology NAS | Admin panel exposed — flag |
| 8123 | Home Assistant | Smart home hub — should not be public |
| 1883 | MQTT | IoT messaging — unencrypted, flag |
| 9000 | Various | Generic — identify what's running |
| 32400 | Plex Media Server | Common — low risk but note if unexpected |
| 8888 | Various | Generic web server — identify |

---

## STEP 4 — ROUTER CHECK

Ask the client to tell you their router make and model (it's usually on a sticker on the router). Check:

1. **Shodan CVE list** — does Shodan show vulnerabilities for that model?
2. **Router's own admin panel** — is it accessible from outside? (Check if port 80/443/8080 is open on their public IP)
3. **Known vulnerabilities** — search `[Router Model] CVE 2023 2024 2025` — many home routers have unpatched firmware vulnerabilities

**Key questions to ask the client:**
- When did you last update your router firmware?
- Do you know the admin password? Is it still the default?
- Did you change the default WiFi password when you set it up?

---

## STEP 5 — DEVICE SCAN (Remote version)

Ask the client to download and run **Malwarebytes Free** on each device and email you the results/screenshot. This covers:
- Malware detected
- PUPs (potentially unwanted programs)
- Browser extensions flagged

You don't need remote access to their device. They run it, send you the result.

For the **In-Person** version — you bring a USB with Malwarebytes portable, run it on-site while they watch.

---

## STEP 6 — WRITE THE REPORT

Structure:

```
1. EXECUTIVE SUMMARY
   - Overall risk rating: LOW / MEDIUM / HIGH / CRITICAL
   - Top 3 findings in plain English
   - One-line "what you need to do this week"

2. EXTERNAL NETWORK FINDINGS
   - Public IP: [x.x.x.x]
   - Shodan findings: [list]
   - Nmap findings: [port table with risk rating per port]

3. ROUTER FINDINGS
   - Make/model: [x]
   - Firmware: [current / outdated / unknown]
   - Admin panel exposure: [yes/no]
   - Known CVEs: [list or none found]

4. DEVICE FINDINGS
   - Device 1: [OS, Malwarebytes result]
   - Device 2: [OS, Malwarebytes result]
   - Device 3: [OS, Malwarebytes result]

5. RECOMMENDED ACTIONS (in priority order)
   - CRITICAL — fix immediately
   - HIGH — fix this week
   - MEDIUM — fix this month
   - LOW — note for next review

6. NEXT STEPS
   - If business client: flag Surf-Check assessment conversation
   - If consumer: offer Dark Web Monitoring + Lock Change if not already subscribed
```

Deliver via pCloud secure link (same as breach reports). Do not email the report directly — it may contain sensitive findings.

---

## RISK RATING GUIDE

| Rating | Definition | Examples |
|---|---|---|
| CRITICAL | Active risk — attacker could get in today | RDP/Telnet open, router default password, malware found |
| HIGH | Significant exposure — needs urgent attention | SSH open without MFA, outdated router firmware with known CVE |
| MEDIUM | Real risk, lower immediate urgency | Gaming ports from unknown origin, weak WiFi password |
| LOW | Best practice gap — no immediate threat | Slightly outdated device OS, unused open port from discontinued service |

---

## TIME ESTIMATE

| Phase | Remote | In-Person |
|---|---|---|
| Pre-scan (consent, IP, Shodan) | 15 min | 15 min |
| Nmap scan | 10–20 min | 10–20 min |
| Router check | 10 min | 20 min (on-site) |
| Device scan | 0 (client runs it) | 30–45 min (3 devices) |
| Report writing | 45–60 min | 45–60 min |
| **Total** | **~90 min** | **~2.5–3 hours** |

---

## LEGAL REMINDER

- Written consent from client before scanning — every time, no exceptions
- Only scan the IP the client provides and confirms as theirs
- Non-destructive only — no exploit attempts, no brute force
- Engagement letter required before first paid scan (see LEGAL/LEGAL_REGISTER.md)
- Professional Indemnity Insurance must be in force (see LEGAL/LEGAL_REGISTER.md)
