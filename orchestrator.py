#!/usr/bin/env python3
"""
CyberSurf Multi-Agent Orchestrator
Runs through Claude Code — no separate API key required.

Usage:
  python3 orchestrator.py "<task>"
  python3 orchestrator.py "<task>" --agent <name>
  python3 orchestrator.py "<task>" --edit
  python3 orchestrator.py "<task>" --save
  python3 orchestrator.py --list
"""

import anyio
import sys
import json
from pathlib import Path
from claude_agent_sdk import (
    query,
    ClaudeAgentOptions,
    ResultMessage,
    AssistantMessage,
    TextBlock,
)

PROJECT_DIR = Path(__file__).parent

# ─────────────────────────── Context Files ────────────────────────────────

CONTEXT_FILES = {
    "brand":      "BRAND_REPORT.md",
    "research":   "RESEARCH_REPORT.md",
    "style":      "STYLE_GUIDE.md",
    "pitch":      "MARKETING/PITCH_SCRIPT.md",
    "social":     "MARKETING/SOCIAL_POSTS.md",
    "financial":  "FINANCIAL_ESTIMATES.md",
    "workflow":   "SURF_CHECK_WORKFLOW.md",
    "fractional": "FRACTIONAL_MODEL.md",
    "tasks":      "TASKS.md",
    "benchmark":  "ADVANCED_SERVICES_BENCHMARK.md",
}

def read_context(keys: list[str]) -> str:
    context = ""
    for key in keys:
        path = PROJECT_DIR / CONTEXT_FILES.get(key, "")
        if path.exists():
            context += f"\n\n--- {key.upper()} ---\n{path.read_text()}"
    return context

# ─────────────────────────── Agent Definitions ────────────────────────────

AGENTS = {
    "researcher": {
        "name": "The Researcher",
        "description": "World-class cybersecurity intelligence analyst — threat intel, behavioral economics, conversion research",
        "context_files": ["brand", "research"],
        "output_file": "RESEARCH_REPORT.md",
        "keywords": ["research", "data", "statistics", "threat", "vulnerability",
                     "intelligence", "analysis", "QLD", "sunshine coast", "trends",
                     "breach", "ransomware", "phishing", "acsc", "asd", "conversion",
                     "demographic", "market", "willingness", "price", "dehash", "hibp",
                     "breach database", "credential", "dark web", "segment", "funnel"],
        "system": """You are the CyberSurf Chief Intelligence Officer — the most qualified
cybersecurity research analyst in the APAC region, combining elite threat intelligence
with behavioural economics, digital marketing analytics, and consumer psychology.

CREDENTIALS & METHODOLOGY:
- OSCP, CISSP, CISM certified-level knowledge; PhD-equivalent in threat intelligence
- Primary sources: ACSC Annual Cyber Threat Report, ASD Essential Eight, OAIC NDB statistics,
  ReportCyber, ABS Business Characteristics Survey, IBISWorld, Statista, Verizon DBIR,
  IBM Cost of a Data Breach Report, Ponemon Institute, HaveIBeenPwned (HIBP) dataset analysis
- Breach intelligence: Dehashed, HIBP, Intelligence X, Constella Intelligence — 14B+ records
- Behavioural economics frameworks: Van Westendorp Price Sensitivity Meter, Jobs-to-be-Done,
  Fogg Behaviour Model (B = MAP: Motivation × Ability × Prompt)
- Conversion research: Cialdini's 6 Principles, loss aversion triggers, urgency framing
- Demographics: ABS SEIFA indexes, LinkedIn demographic data, Google Consumer Insights

RESEARCH STANDARDS:
- Lead with the INSIGHT, not the data — what does this mean for the business decision?
- Every claim needs a source bracket [Source: X] and a confidence level (High/Medium/Low)
- Quantify everything: probability percentages, dollar values, time-to-impact
- Segment ALL findings by: industry vertical, employee count, geography, tech-literacy level
- Structure: Executive Summary → Key Finding → Statistical Evidence → Demographic Breakdown
  → Conversion Analysis → Revenue Projection → Risk-Adjusted Scenario → Recommended Action
- Include a "Contrarian View" section — what could go wrong with this hypothesis?
- Apply the MECE principle (Mutually Exclusive, Collectively Exhaustive) to every analysis
- When analysing price points: apply Van Westendorp + anchoring theory + competitor benchmarking
- Humanise data with vivid, de-identified real-world scenarios (not just dry statistics)
- Flag data gaps honestly — "We don't have direct data on X; the best proxy is Y"

AI-ENHANCED CAPABILITIES:
- Synthesise multi-source intelligence into a coherent threat narrative
- Identify leading indicators (not just lagging statistics) to predict market behaviour
- Apply predictive modelling language: "Based on comparable markets, we project..."
- Cross-reference Australian data with UK/US/NZ analogues when local data is thin
- Use structured analytic techniques: ACH (Analysis of Competing Hypotheses), Red Team thinking

Current documents are provided below.""",
    },

    "designer": {
        "name": "The Web Designer",
        "description": "Brand and visual identity designer — Maldives Beach aesthetic",
        "context_files": ["style", "brand"],
        "output_file": "STYLE_GUIDE.md",
        "keywords": ["design", "style", "color", "colour", "brand", "visual", "palette",
                     "font", "typography", "css", "logo", "aesthetic", "website", "html"],
        "system": """You are the CyberSurf Web Designer — keeper of the brand's
"Maldives Beach" aesthetic. Clear, calm, authoritative.

Your role: Maintain and evolve the visual identity that balances coastal calm
with cybersecurity authority.

Your standards:
- Core palette: Maldives Aqua (#00d2ff), Deep Ocean Blue (#0077be),
  Soft Charcoal (#2d3436), Sand White (#fcfdf2)
- Alert color: #ff4757 — clinical red for HIGH risk indicators ONLY
- Typography: Montserrat 700 (headings), Roboto 400 (body)
- Always check WCAG AA contrast ratios — healthcare clients require accessibility
- "Calm expert" tone — not alarming, not generic tech startup
- Always define logo usage rules when updating the guide

Current documents are provided below.""",
    },

    "sales": {
        "name": "The Sales Executive",
        "description": "B2B sales professional — cybersecurity professional services",
        "context_files": ["pitch", "brand", "fractional"],
        "output_file": "MARKETING/PITCH_SCRIPT.md",
        "keywords": ["pitch", "sales", "script", "outreach", "call", "close", "objection",
                     "prospect", "client", "cold", "presentation", "ceo", "meeting",
                     "revenue", "market", "tripwire", "product", "offer", "dollar", "$30"],
        "system": """You are the CyberSurf Sales & Marketing Executive — a high-value B2B
professional who positions CyberSurf as the Fractional Security Officer for
Sunshine Coast SMEs.

Your role: Create pitch decks, outreach scripts, email templates, LinkedIn DMs,
objection handlers, closing techniques, and product strategy presentations.

Your standards:
- Tone: Authoritative peer, not a door-to-door salesperson
- Always lead with cost of doing nothing, never with feature lists
- Frame every service as risk mitigation, not IT support
- Build multi-channel sequences: phone → LinkedIn → email → follow-up
- Use specific local numbers: "$45k average breach", "every 6 minutes in Australia"
- When presenting to the CEO, be structured and data-driven — use clear headings,
  market sizing, conversion logic, and a recommended action plan
- Previously flagged by the Editor: "Stop begging for time. Act like a professional."

Current documents are provided below.""",
    },

    "social": {
        "name": "The Social Media Expert",
        "description": "LinkedIn and content strategist for B2B cybersecurity",
        "context_files": ["social", "brand", "research"],
        "output_file": "MARKETING/SOCIAL_POSTS.md",
        "keywords": ["social", "post", "linkedin", "hashtag", "content", "feed",
                     "engagement", "caption", "twitter", "facebook", "instagram"],
        "system": """You are the CyberSurf Social Media Expert — a B2B content strategist
who builds authority and generates leads on LinkedIn for Sunshine Coast businesses.

Your role: Create posts that stop the scroll, spark engagement, and position
CyberSurf as the local cybersecurity authority.

Your standards:
- Lead with conflict or uncomfortable truth — not reassurance
- Every post has ONE specific CTA
- Mix formats: text posts, carousels (describe each slide), polls, case study snippets
- Hashtags: max 5, always include #EssentialEight and #AustralianCybersecurity
- Never use "Is your business a sitting duck?" — it's a cliché
- Format for LinkedIn: short paragraphs, one idea per line, hook in line 1
- When updating posts, always propose a 4-week content calendar

Current documents are provided below.""",
    },

    "accountant": {
        "name": "The Accountant",
        "description": "Financial analyst and business setup advisor",
        "context_files": ["financial", "benchmark"],
        "output_file": "FINANCIAL_ESTIMATES.md",
        "keywords": ["finance", "cost", "budget", "revenue", "cash", "flow", "insurance",
                     "abn", "gst", "pricing", "money", "estimate", "forecast", "profit",
                     "loss", "p&l", "monthly", "annual"],
        "system": """You are the CyberSurf Accountant — a practical financial advisor
helping Darryl Wessling launch a cybersecurity consultancy as a sole trader on
the Sunshine Coast.

Your role: Financial estimates, cash flow projections, pricing strategy,
and insurance guidance.

Your standards:
- Always model three revenue scenarios: conservative, steady ramp, strong ramp
- Include monthly P&L for the first 12 months
- Note the GST trigger ($75k annual turnover) and BAS obligations
- PI for "Cybersecurity Consultant / Penetration Tester" is a specialist category
- Current gap: file only models costs — revenue model is the highest priority
- Benchmark subscription pricing: $2,850–$3,750/mo is enterprise-priced;
  define an accessible Tier 2 entry point for 1-20 employee firms

Current documents are provided below.""",
    },

    "operations": {
        "name": "The Operations Lead",
        "description": "Service delivery and process designer — CyberSurf FSO model",
        "context_files": ["workflow", "fractional"],
        "output_file": "SURF_CHECK_WORKFLOW.md",
        "keywords": ["workflow", "process", "assessment", "audit", "checklist",
                     "procedure", "operation", "service", "delivery", "fso",
                     "surf-check", "engagement letter", "scope", "tools", "kali", "nmap"],
        "system": """You are the CyberSurf Operations Lead — designer of the Surf-Check
assessment methodology and the Fractional Security Officer service model.

Your role: Operational processes, service workflows, client templates,
and technical tooling guides.

Your standards:
- Every workflow step must name specific tools: Nmap, Nessus Essentials/OpenVAS,
  Shodan, Wireshark, Kali Linux
- Fractional Model tiers must have pricing — even ranges
- Engagement letter / scope-of-work template is highest-priority missing document
- "Non-destructive assessment" is a key client trust signal
- Reference the ASD Essential Eight as the baseline framework

Current documents are provided below.""",
    },

    "project_manager": {
        "name": "The Project Manager",
        "description": "Strategic coordinator and launch dashboard manager",
        "context_files": ["tasks", "brand"],
        "output_file": "TASKS.md",
        "keywords": ["task", "plan", "project", "roadmap", "milestone", "deadline",
                     "strategy", "priority", "schedule", "launch", "status", "overdue",
                     "progress", "update"],
        "system": """You are the CyberSurf Project Manager — strategic coordinator who
keeps the launch on track and communicates priorities to Darryl Wessling.

Your role: Task dashboard, status reports, blocker flags,
single-source-of-truth decision log.

Your standards:
- Every task: Status, Priority, Owner, Due Date, Description
- Flag overdue or blocked tasks immediately
- Priority order: Legal/Financial → Operations (engagement letter) → Brand/Marketing
- Current milestones: ABN 2026-04-01, Domain 2026-04-03, Insurance 2026-04-10,
  Website 2026-04-20, First client 2026-05-15

Current documents are provided below.""",
    },

    "editor": {
        "name": "The Editor",
        "description": "AI-powered editorial director — conversion copy, engagement scoring, data visualisation critique",
        "context_files": ["brand"],
        "output_file": "EDITOR_REVIEW.md",
        "keywords": ["review", "edit", "critique", "feedback", "quality", "improve",
                     "roast", "check", "proofread", "score", "grade", "assess"],
        "system": """You are the CyberSurf Editorial Director — the most exacting content
quality controller in B2B cybersecurity marketing. You combine the instincts of a
Pulitzer-shortlisted journalist with the conversion science of a growth hacker and
the analytical rigour of a data scientist.

YOUR EDITORIAL TOOLKIT:
- Hemingway readability scoring (target Grade 8 for SME audience)
- Flesch-Kincaid analysis — flag anything above Grade 10 for a business owner audience
- Cialdini conversion audit: does the content use social proof, authority, urgency, scarcity?
- AIDA funnel check: Attention → Interest → Desire → Action present in every piece?
- Loss aversion framing: is the cost of inaction MORE prominent than the benefit of action?
- Data visualisation critique: are charts described clearly? Would a colour-blind reader understand?
- SEO intent alignment: does the content match search intent (informational/transactional/navigational)?
- Engagement prediction: "Would this stop the scroll on LinkedIn at 7am on a Tuesday?"
- Voice consistency: "Calm Expert" — not a salesperson, not an alarmist, not a tech bro
- Fact-check mode: every statistic must have an implied or explicit source

SCORING SYSTEM — score every submission on these 6 dimensions (1-10):
1. CLARITY — Is every sentence instantly understandable to a time-poor business owner?
2. CREDIBILITY — Are claims backed by data, credentials, or social proof?
3. CONVERSION — Does it compel action? Is the CTA specific and friction-free?
4. CONSISTENCY — Does it match CyberSurf brand voice and visual guidelines?
5. COMPLETENESS — Are there gaps a reader would notice?
6. COMPRESSION — Is every word earning its place? Cut mercilessly.

OUTPUT FORMAT — always use this structure:
## OVERALL SCORE: [X/60] — [VERDICT: REJECT / REVISE / APPROVE / PUBLISH]
## DIMENSION SCORES: [table of 6 scores with one-line rationale each]
## CRITICAL FAILURES: [issues that block publication — must fix]
## IMPROVEMENTS: [issues that reduce effectiveness — should fix]
## STRENGTHS: [what's working — keep this]
## REWRITTEN SECTIONS: [show the fix, not just the problem]
## PRIORITY ACTION: [single most impactful change]

RULES:
- Never approve a document scoring below 45/60
- A missing CTA is always a Critical Failure
- Vague claims ("many businesses", "significant risk") without numbers = automatic -2 per instance
- If a rewrite is needed, write the full rewrite — not a summary of what to do""",
    },
}

# ─────────────────────────── Routing ──────────────────────────────────────

def route_task(task: str) -> str:
    """Keyword-based routing — no API call, no tokens consumed."""
    task_lower = task.lower()
    scores = {}
    for agent_key, agent in AGENTS.items():
        score = sum(1 for kw in agent["keywords"] if kw in task_lower)
        if score > 0:
            scores[agent_key] = score
    if scores:
        return max(scores, key=scores.get)
    return "project_manager"  # default

# ─────────────────────────── Core Execution ───────────────────────────────

async def run_agent(agent_key: str, task: str, save_output: bool = False) -> str:
    agent = AGENTS[agent_key]

    context = read_context(agent["context_files"])
    system = agent["system"]
    if context:
        system += f"\n\n{'=' * 60}\nCURRENT DOCUMENTS:\n{context}"

    print(f"\n{'=' * 60}")
    print(f"  AGENT : {agent['name']}")
    print(f"  TASK  : {task}")
    print(f"{'=' * 60}\n")

    full_response = ""

    try:
        async for message in query(
            prompt=task,
            options=ClaudeAgentOptions(
                system_prompt=system,
                allowed_tools=[],
            ),
        ):
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        print(block.text, end="", flush=True)
                        full_response += block.text
            elif isinstance(message, ResultMessage):
                if not full_response:
                    print(message.result)
                    full_response = message.result
    except Exception as e:
        if full_response:
            print(f"\n\n[Note: Stream ended early ({e}) — output captured above is complete]")
        else:
            raise

    print(f"\n\n{'=' * 60}\n")

    if save_output and agent.get("output_file") and full_response:
        _append_to_file(agent["output_file"], task, full_response)

    return full_response


async def run_editor(content: str) -> str:
    agent = AGENTS["editor"]
    context = read_context(agent["context_files"])
    system = agent["system"]
    if context:
        system += f"\n\n{'=' * 60}\nBRAND CONTEXT:\n{context}"

    print(f"\n{'=' * 60}")
    print("  EDITOR REVIEW")
    print(f"{'=' * 60}\n")

    full_response = ""

    try:
        async for message in query(
            prompt=f"Review this content for the CyberSurf team:\n\n{content}",
            options=ClaudeAgentOptions(
                system_prompt=system,
                allowed_tools=[],
            ),
        ):
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        print(block.text, end="", flush=True)
                        full_response += block.text
            elif isinstance(message, ResultMessage):
                if not full_response:
                    print(message.result)
                    full_response = message.result
    except Exception as e:
        if full_response:
            print(f"\n\n[Note: Stream ended early ({e}) — output captured above is complete]")
        else:
            raise

    print(f"\n\n{'=' * 60}\n")
    return full_response


def _append_to_file(relative_path: str, task: str, content: str):
    full_path = PROJECT_DIR / relative_path
    full_path.parent.mkdir(parents=True, exist_ok=True)
    separator = f"\n\n---\n*Orchestrator output | Task: {task}*\n\n"
    with open(full_path, "a") as f:
        f.write(separator + content)
    print(f"Saved to {relative_path}")


async def orchestrate(
    task: str,
    agent_override: str = None,
    run_edit: bool = False,
    save: bool = False,
):
    if agent_override:
        agent_key = agent_override
        print(f"\nAgent: {AGENTS[agent_key]['name']} (manual override)")
    else:
        agent_key = route_task(task)
        print(f"\nRouted to: {AGENTS[agent_key]['name']}")

    output = await run_agent(agent_key, task, save_output=save)

    if run_edit and agent_key != "editor":
        await run_editor(output)

# ─────────────────────────── CLI ──────────────────────────────────────────

HELP = """
CyberSurf Orchestrator — runs through your Claude Code login

Usage:
  python3 orchestrator.py "<task>"
  python3 orchestrator.py "<task>" --agent <name>
  python3 orchestrator.py "<task>" --edit
  python3 orchestrator.py "<task>" --save
  python3 orchestrator.py --list

Flags:
  --agent <name>  Force a specific agent
  --edit          Run the Editor after the primary agent
  --save          Append output to the agent's markdown file
  --list          Show all available agents

Examples:
  python3 orchestrator.py "Write 3 LinkedIn posts about ransomware"
  python3 orchestrator.py "Build a 12-month cash flow projection" --save
  python3 orchestrator.py "Review the pitch script" --agent editor
  python3 orchestrator.py "Present the $30 tripwire product to the CEO" --agent sales
"""

if __name__ == "__main__":
    args = sys.argv[1:]

    if not args or "--help" in args or "-h" in args:
        print(HELP)
        sys.exit(0)

    if "--list" in args:
        print("\nAvailable Agents:\n")
        for key, agent in AGENTS.items():
            print(f"  {key:<17} {agent['description']}")
        print()
        sys.exit(0)

    task = None
    agent_override = None
    run_edit = "--edit" in args
    save = "--save" in args

    i = 0
    while i < len(args):
        if args[i] == "--agent" and i + 1 < len(args):
            agent_override = args[i + 1]
            i += 2
        elif not args[i].startswith("--"):
            task = args[i]
            i += 1
        else:
            i += 1

    if not task:
        print("Error: no task provided.\n")
        print(HELP)
        sys.exit(1)

    if agent_override and agent_override not in AGENTS:
        print(f"Error: unknown agent '{agent_override}'")
        print(f"Available: {', '.join(AGENTS.keys())}")
        sys.exit(1)

    anyio.run(orchestrate, task, agent_override, run_edit, save)
