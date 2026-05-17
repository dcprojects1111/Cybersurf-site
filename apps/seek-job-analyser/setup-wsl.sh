#!/usr/bin/env bash
# CyberSurf — SEEK Job Analyser — WSL Ubuntu setup script
#
# Run this once from inside WSL Ubuntu:
#   cd ~/cybersurf/apps/seek-job-analyser
#   bash setup-wsl.sh
#
# It installs nvm (if missing), Node 20 LTS (if missing), then runs npm install.

set -euo pipefail

echo ""
echo "============================================"
echo "  CyberSurf SEEK Job Analyser — WSL setup"
echo "============================================"
echo ""

# 1. Make sure we're in WSL, not Windows
if ! grep -qi microsoft /proc/version 2>/dev/null; then
  echo "WARNING: this doesn't look like WSL. Continuing anyway."
fi

# 2. Install nvm if missing
if [ -z "${NVM_DIR:-}" ] || [ ! -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]; then
  echo "[1/4] nvm not found — installing..."
  curl -fsSL -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  # shellcheck disable=SC1091
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
else
  echo "[1/4] nvm already installed."
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  # shellcheck disable=SC1091
  . "$NVM_DIR/nvm.sh"
fi

# 3. Install + use Node 20 LTS
echo "[2/4] Installing Node 20 LTS..."
nvm install 20
nvm use 20
nvm alias default 20

NODE_VERSION="$(node --version)"
NPM_VERSION="$(npm --version)"
echo "       Node: $NODE_VERSION"
echo "       npm:  $NPM_VERSION"

# 4. Install project dependencies
if [ -f package.json ]; then
  echo "[3/4] Running npm install..."
  npm install
else
  echo "[3/4] No package.json in current dir — skipping npm install."
  echo "       (Run this script from inside apps/seek-job-analyser/)"
fi

# 5. Smoke test
echo "[4/4] Running smoke test (npm start)..."
echo ""
if [ -f package.json ]; then
  npm start || {
    echo ""
    echo "Smoke test failed. Check the error above."
    exit 1
  }
fi

echo ""
echo "============================================"
echo "  Setup complete."
echo "============================================"
echo ""
echo "Next time, just run:  npm start"
echo ""
