# CyberSurf Apps

This directory holds standalone sub-applications that support the CyberSurf business but are separate from the main production Flask web app (`../webapp/`).

Each sub-app is self-contained — its own dependencies, its own runtime, its own deploy story.

## Apps

| App | Runtime | Status | Purpose |
|---|---|---|---|
| `seek-ghost-buster/` | Chrome / Edge extension (MV3) | v0.1 — sideload ready | Filters ghost jobs and scams on SEEK with a traffic-light verdict per listing |
| `seek-job-analyser/` | — | **DEPRECATED** — delete | Old Node.js scaffold, replaced by the extension above |

## Running an app

Each app has its own `README.md` with run instructions. The standard pattern:

```bash
cd ~/cybersurf/apps/<app-name>
npm install        # or `pip install -r requirements.txt` for Python apps
npm run dev        # or `npm start`
```

## WSL Node.js setup

Node.js apps in this folder target **Node 20 LTS**. To install in WSL Ubuntu:

```bash
# Install nvm (Node Version Manager) — the recommended way
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

# Install and use Node 20 LTS
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node --version    # should print v20.x.x
npm --version
```

Each app pins its required Node version in a `.nvmrc` file — running `nvm use` inside the app folder will switch to the pinned version automatically.

## Why apps live here, not in webapp/

`webapp/` is the production Flask app that auto-deploys to Render on every push. Mixing Node code into that folder would:

1. Bloat the Render build (Render would try to detect Node)
2. Risk leaking dev tooling into a customer-facing service
3. Make it harder for a future hire to understand the structure

Apps under `apps/` are internal tools — they may eventually have their own deploy targets, but they should never share a build with the customer-facing webapp.

---
*Maintained by The Coder. Last updated: 2026-05-16.*
