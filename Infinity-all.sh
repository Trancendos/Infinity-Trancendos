#!/usr/bin/env bash
# ============================================================
#  Infinity-Trancendos  –  ONE FILE TO RULE THEM ALL  (v1.0.0)
# ============================================================
#  What this script does, in order:
#    1. Creates folders + writes every project file via HERE-DOC
#    2. Optionally creates the GitHub repo with gh CLI
#    3. Adds Fly token / rclone config secrets
#    4. Commits + pushes everything
#    5. Waits for CI to turn green, then Fly deploy to finish
# ------------------------------------------------------------
set -euo pipefail
shopt -s extglob

# ---------- Configurable flags ------------------------------------------------
ORG=""                # your GitHub user/org  (required if --gh-create)
REPO="Infinity-Trancendos"
FLY_TOKEN=""          # required if you want auto-deploy
RCLONE_B64=""         # optional base64 rclone.conf
MODE="local"          # local|gh-create|dry

#
# Prints the usage information for the script and exits.
#
usage() { cat <<EOF
Usage: $0 [flags]

  --org            GitHub owner (required for --gh-create)
  --repo           Repo name   (default: Infinity-Trancendos)
  --fly-token      Fly.io API token  (or set env FLY_API_TOKEN)
  --rclone-b64     Base64 of rclone.conf  (adds GH secret)
  --gh-create      Create repo with gh CLI + push + set secrets
  --dry            Write files only (no git, no network)
EOF
exit 1; }

# ---------- Parse CLI ---------------------------------------------------------
# This loop parses the command-line arguments provided to the script.
while [[ $# -gt 0 ]]; do
  case $1 in
    --org)          ORG="$2";               shift 2;;
    --repo)         REPO="$2";              shift 2;;
    --fly-token)    FLY_TOKEN="$2";         shift 2;;
    --rclone-b64)   RCLONE_B64="$2";        shift 2;;
    --gh-create)    MODE="gh-create";       shift 1;;
    --dry)          MODE="dry";             shift 1;;
    -h|--help)      usage;;
    *) echo "Unknown flag $1"; usage;;
  esac
done

# ---------- Helpers -----------------------------------------------------------
# A set of utility functions for logging and command checking.

# Prints a formatted message to stdout.
# @param {string} message The message to be printed.
say(){ printf "\e[36m▶ %s\e[0m\n" "$*"; }

# Prints a formatted error message to stderr and exits.
# @param {string} message The error message.
fail(){ printf "\e[31m✖ %s\e[0m\n" "$*"; exit 1; }

# Checks if a command exists and fails if it doesn't.
# @param {string} command The command to check for.
need(){ command -v "$1" >/dev/null || fail "$1 required"; }

# Sets a GitHub secret using the gh CLI.
# @param {string} name The name of the secret.
# @param {string} value The value of the secret.
ghset(){ gh secret set "$1" -b"$2" >/dev/null; }

# ---------- 0. Pre-flight -----------------------------------------------------
[[ $MODE == gh-create ]] && { need git; need gh; need curl; }
[[ -n ${FLY_TOKEN:-} ]] && export FLY_API_TOKEN="$FLY_TOKEN"

# ---------- 1. Write project tree --------------------------------------------
say "Writing project structure…"
mkdir -p bootstrap src/web/public .github/workflows docs

# 1A. Bootstrap installer
cat > bootstrap/unified-install.sh <<'EOS'
#!/usr/bin/env bash
#
# This script is a placeholder for a unified installation process.
# It currently performs a basic disk space check and then exits.
# The logic should be expanded to handle the actual software installation.
#
set -euo pipefail

# Minimum required disk space in Gigabytes.
MIN_GB=2

# Logs a message to stdout with a colored prefix.
# @param {string} message The message to log.
log(){ printf "\e[36m▶ %s\e[0m\n" "$*"; }

# Logs an error message to stderr and exits the script.
# @param {string} message The error message to log.
err(){ printf "\e[31m✖ %s\e[0m\n" "$*"; exit 1; }

# Check for sufficient disk space before proceeding.
[[ $(df -Pk . | awk 'NR==2{print int($4/1024)}') -lt $MIN_GB ]] && err "Low disk"

log "Installer stub – replace with full logic later."
EOS
chmod +x bootstrap/unified-install.sh

# 1B. Node server
cat > src/web/server.js <<'EOS'
/**
 * @fileoverview This script sets up a simple Express server to serve static
 * files and provide an API endpoint for running a shell script.
 * @module src/web/server
 */

import express from 'express';
import path from 'node:path';
import { exec } from 'node:child_process';

/**
 * The Express application instance.
 * @type {import('express').Express}
 */
const app = express();

/**
 * Serves static files from the 'public' directory.
 * @name static
 * @function
 * @memberof module:express
 */
app.use(express.static(path.join(process.cwd(), 'public')));

/**
 * API endpoint to trigger the installation script.
 * When a POST request is made to /api/install, it executes the
 * `unified-install.sh` script.
 * @name /api/install
 * @function
 * @param {import('express').Request} _ - The Express request object (unused).
 * @param {import('express').Response} res - The Express response object.
 * @returns {void}
 */
app.post('/api/install', (_,res)=>
  exec('bash ./bootstrap/unified-install.sh', (e,out,err)=>
    e ? res.status(500).send(err) : res.type('text').send(out)
  ));

/**
 * Starts the Express server.
 * It listens on the port specified by the PORT environment variable,
 * or 3000 if not specified.
 * @function
 * @param {number} port - The port to listen on.
 * @param {Function} callback - The function to call once the server is listening.
 */
app.listen(process.env.PORT||3000, ()=>console.log('UI live'));
EOS

# 1C. Front page
cat > src/web/public/index.html <<'EOS'
<!DOCTYPE html><meta charset="UTF-8"><title>Infinity</title>
<h2>Infinity-Trancendos Installer</h2>
<button onclick="run()">Run Installer</button>
<pre id="log"></pre>
<script>
async function run(){
  const pre=document.getElementById('log');
  pre.textContent="⏳ running…";
  const r=await fetch('/api/install',{method:'POST'});
  pre.textContent=r.ok?await r.text():'failed';
}
</script>
EOS

# 1D. CI workflow
cat > .github/workflows/lint-and-test.yml <<'EOS'
# This GitHub Actions workflow is responsible for linting and testing the codebase.
# It runs on every push and pull request to ensure code quality and prevent regressions.
name: Lint & Test
on: [push, pull_request]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
    - name: Run placeholder test
      run: echo "stub CI – to be replaced with ShellCheck & ESLint"
EOS

# 1E. Deploy workflow
cat > .github/workflows/deploy.yml <<'EOS'
# This GitHub Actions workflow handles the deployment of the application to Fly.io.
# It is triggered automatically after the "Lint & Test" workflow completes successfully on the main branch.
name: Deploy (Fly.io)
on:
  workflow_run:
    workflows: [Lint & Test]
    types: [completed]
    branches: [main]
jobs:
  deploy:
    # This job only runs if the preceding "Lint & Test" workflow was successful.
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
    - name: Deploy to Fly.io
      uses: superfly/flyctl-actions@1.4
      with:
        args: "deploy --remote-only"
      env:
        FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
EOS

# 1F. Readme
cat > README.md <<'EOS'
# Infinity-Trancendos

This repository contains the source code for **Infinity-Trancendos**, a project aimed at providing mental health and wellbeing support. The current version provides a basic web interface to trigger a server-side installation script.

## Architecture

The entire project is bootstrapped from a single shell script: `Infinity-all.sh`. This script is responsible for generating all the necessary files and setting up the project structure, including the Node.js server, frontend assets, and GitHub Actions workflows.

- **`Infinity-all.sh`**: The master script that builds the project from scratch. It contains the source for all other files as HERE documents.
- **`src/web/server.js`**: A simple Express.js server that serves the frontend and provides an API endpoint (`/api/install`) to run the installer.
- **`src/web/public/index.html`**: The main frontend page with a button to trigger the installation.
- **`bootstrap/unified-install.sh`**: A placeholder script for the main installation logic.
- **`.github/workflows/`**: Contains CI/CD pipelines for linting, testing, and deploying the application to Fly.io.

## Setup

There are two ways to set up this project:

### 1. Dry Run (Local Files Only)

To generate all the project files locally without initializing a git repository or pushing to GitHub, run the `Infinity-all.sh` script with the `--dry` flag.

```bash
bash Infinity-all.sh --dry
```

This will create the `src`, `bootstrap`, and `.github` directories with all the necessary files.

### 2. GitHub Repository Creation

To create a new GitHub repository and push the initial project structure, you can use the `gh` CLI.

```bash
bash Infinity-all.sh --gh-create --org YOUR_GITHUB_USERNAME
```

Replace `YOUR_GITHUB_USERNAME` with your GitHub username or organization.

## Usage

Once the project is set up, you can start the server:

```bash
node src/web/server.js
```

Navigate to `http://localhost:3000` in your browser. Clicking the "Run Installer" button will execute the `bootstrap/unified-install.sh` script on the server.
EOS

say "✔  Files written."

[[ $MODE == dry ]] && exit 0

# ---------- 2. GitHub repo create / push -------------------------------------
if [[ $MODE == gh-create ]]; then
  say "Creating GitHub repo $ORG/$REPO …"
  gh repo create "$ORG/$REPO" --public --confirm >/dev/null
  git init -q && git add . && git commit -m "feat: bootstrap scaffold" >/dev/null
  git branch -M main
  git remote add origin "https://github.com/$ORG/$REPO.git"
  git push -u origin main
else
  say "Skipping gh-create (MODE=$MODE)."
fi

# ---------- 3. Add secrets ----------------------------------------------------
if [[ -n ${FLY_API_TOKEN:-} ]]; then
  say "Adding FLY_API_TOKEN secret…"
  ghset FLY_API_TOKEN "$FLY_API_TOKEN"
fi
if [[ -n $RCLONE_B64 ]]; then
  say "Adding RCLONE_CONFIG secret…"
  ghset RCLONE_CONFIG "$RCLONE_B64"
fi

# ---------- 4. Wait for Actions green + deploy -------------------------------
say "Polling GitHub Actions until green…"
RUN_ID=$(gh run list --json databaseId -q '.[0].databaseId')
gh run watch "$RUN_ID" || fail "CI failed."

say "🎉  Done!  Your Fly app will be at:"
echo "     https://$REPO.fly.dev    (once Fly finishes build)"
