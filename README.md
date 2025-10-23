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
