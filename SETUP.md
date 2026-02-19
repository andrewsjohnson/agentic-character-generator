# Setup Guide

This document covers everything needed to set up the agentic development workflow for this repository. For an overview of how the workflow operates, see [WORKFLOW.md](./WORKFLOW.md).

## Table of Contents

- [Prerequisites](#prerequisites)
- [1. GitHub App Installation](#1-github-app-installation)
- [2. GitHub Secrets](#2-github-secrets)
- [3. GitHub Variables](#3-github-variables)
- [4. Percy Integration](#4-percy-integration)
- [5. Claude Code Integration](#5-claude-code-integration)
- [6. Verification](#6-verification)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Admin access to the GitHub repository
- An [Anthropic](https://console.anthropic.com/) account with API access
- A [Percy](https://percy.io/) account (for visual regression testing)
- The agentic-automation GitHub App installed (or your own GitHub App — see below)

## 1. GitHub App Installation

The agent workflows use a GitHub App to generate scoped tokens for interacting with the repository. This provides better security than long-lived personal access tokens.

### Using the agentic-automation App

If the `agentic-automation` GitHub App is available for your organization:

1. Navigate to the app's installation page on GitHub
2. Select the repository to install it on
3. Grant the required permissions (see below)
4. Note the **App ID** and generate a **Private Key** from the app settings

### Creating Your Own GitHub App

If you need to create your own app:

1. Go to **GitHub Settings > Developer settings > GitHub Apps > New GitHub App**
2. Configure the app with these repository permissions:
   - **Contents:** Read & Write (for pushing commits)
   - **Issues:** Read & Write (for creating/editing issues, labels, comments)
   - **Pull Requests:** Read & Write (for creating/editing PRs, labels, comments)
3. Generate a private key and download it
4. Install the app on your repository
5. Note the **App ID** from the app's general settings page

### Verifying Installation

After installation, verify the app appears under **Repository Settings > Integrations > GitHub Apps** with the correct permissions.

## 2. GitHub Secrets

All secrets are configured in **Repository Settings > Secrets and variables > Actions > Secrets**.

### Required Secrets (Agent Workflows)

These secrets are used by the `agent-*` prefixed workflows (the current active system):

| Secret | Description | Where to Get It |
|--------|-------------|-----------------|
| `APP_ID` | GitHub App ID (numeric) | GitHub App settings page > General > App ID |
| `APP_PRIVATE_KEY` | GitHub App private key (PEM format) | GitHub App settings page > Private keys > Generate |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude | [Anthropic Console](https://console.anthropic.com/) > API Keys |

### Required Secrets (Visual Testing)

| Secret | Description | Where to Get It |
|--------|-------------|-----------------|
| `PERCY_TOKEN` | Percy project token | Percy project settings > Project token |

### Adding a Secret

1. Go to **Repository Settings > Secrets and variables > Actions**
2. Click **New repository secret**
3. Enter the secret name exactly as shown above (names are case-sensitive)
4. Paste the secret value
5. Click **Add secret**

## 3. GitHub Variables

Variables are configured in **Repository Settings > Secrets and variables > Actions > Variables**.

| Variable | Description | Format |
|----------|-------------|--------|
| `PERCY_PROJECT` | Percy project identifier | `org-slug/project-slug` (e.g., `acme/character-gen`) |

This variable is used by the Percy visual review workflow to locate the correct Percy project. Find the value in your Percy project URL: `https://percy.io/{org-slug}/{project-slug}`.

## 4. Percy Integration

[Percy](https://percy.io/) provides visual regression testing by comparing screenshots across builds.

### Initial Setup

1. **Create a Percy account** at [percy.io](https://percy.io/) (sign in with GitHub for easy integration)
2. **Create a new project:**
   - Go to your Percy organization dashboard
   - Click **Create new project**
   - Name it to match your repository (e.g., `agentic-character-generator`)
   - Link it to your GitHub repository when prompted
3. **Get the project token:**
   - Go to **Project settings > Project token**
   - Copy the token
   - Add it as the `PERCY_TOKEN` repository secret (see [GitHub Secrets](#2-github-secrets))
4. **Set the project variable:**
   - Note the `org-slug/project-slug` from your Percy project URL
   - Add it as the `PERCY_PROJECT` repository variable (see [GitHub Variables](#3-github-variables))

### How Percy Works in This Repo

1. The `playwright.yml` workflow runs E2E tests wrapped in `npx percy exec`
2. Percy captures snapshots during test execution and uploads them to Percy's service
3. After Playwright completes, `percy-review.yml` triggers
4. A custom script (`.github/scripts/percy-review.mjs`) fetches the Percy build and uses Claude to analyze visual diffs
5. Results are posted as a PR comment

Without `PERCY_TOKEN`, Percy runs in no-op mode — tests still execute but no snapshots are captured or uploaded.

## 5. Claude Code Integration

The AI agents are powered by [Claude Code](https://docs.anthropic.com/en/docs/claude-code) through the [claude-code-action](https://github.com/anthropics/claude-code-action) GitHub Action.

### How It Works

Each agent workflow uses `anthropics/claude-code-action@v1` with:
- `anthropic_api_key` — your Anthropic API key (the `ANTHROPIC_API_KEY` secret)
- `github_token` — a scoped token from the GitHub App (generated per-run)
- `claude_args` — model selection, max turns, allowed tools, and agent settings

### Agent Settings

Agent-specific configurations are stored in `claude/agents/`:
- `planner.json` — settings for the Planning Agent
- `implementer.json` — settings for the Implementation Agent
- `reviewer.json` — settings for the Review Agent

### API Key Usage

The `ANTHROPIC_API_KEY` is used by:
- All `agent-*` workflows (planning, implementation, review)
- The Percy visual review script (for Claude vision analysis)
- The legacy `claude-*` workflows
- The `@claude` comment trigger workflow

A single API key works across all workflows. Monitor usage on the [Anthropic Console](https://console.anthropic.com/) dashboard.

### Model Selection

The agent workflows specify which Claude model to use via `claude_args`:
- The Implementation Agent uses `--model opus`
- The Review Agent uses `--model opus`
- The Planning Agent uses the action's default model (no explicit model specified)

## 6. Verification

After completing setup, verify everything works:

### Quick Checks

1. **GitHub App:** Confirm the app appears under Repository Settings > Integrations > GitHub Apps
2. **Secrets:** Verify all required secrets are listed (Repository Settings > Secrets and variables > Actions). You cannot view secret values, but you can confirm they exist.
3. **Variables:** Verify `PERCY_PROJECT` is set with the correct `org/project` format

### End-to-End Test

1. Create a test issue describing a small change
2. Comment `/agent-plan` on the issue
3. Verify the Planning Agent posts a plan comment
4. Comment `/agent-approve` to trigger PR creation
5. Verify the PR is created and implementation begins
6. Check that CI runs and Percy captures snapshots

## Troubleshooting

### Agent workflows fail with "Bad credentials"
- Verify `APP_ID` and `APP_PRIVATE_KEY` are set correctly
- Ensure the GitHub App is installed on the repository with the required permissions
- Check that the private key hasn't expired

### "Resource not accessible by integration" errors
- The GitHub App needs Read & Write permissions for Contents, Issues, and Pull Requests
- Go to the app settings and verify permissions, then re-install if needed

### Claude agent does nothing / empty output
- Check `ANTHROPIC_API_KEY` is valid and has available credits
- Verify the API key on the [Anthropic Console](https://console.anthropic.com/)

### Percy snapshots not appearing
- Verify `PERCY_TOKEN` is set as a repository secret
- Verify `PERCY_PROJECT` is set as a repository variable (not a secret)
- Check that the Percy project exists and is linked to the correct repository

### CI passes but agent workflows don't trigger
- Agent workflows are triggered by specific comment commands (`/agent-plan`, `/agent-implement`, etc.)
- Ensure the comment is on the correct context (issue vs. PR)
- Check that the `HALTED` or `AWAITING-FEEDBACK` labels are not blocking progress

### Legacy workflows not working
- Legacy `claude-*` workflows require `CLAUDE_PUSH_TOKEN` and/or `CLAUDE_PR_TOKEN`
- These are separate from the `APP_ID`/`APP_PRIVATE_KEY` used by `agent-*` workflows

---

*Keep this document in sync with workflow and infrastructure changes. When secrets, variables, or integrations change, update the relevant sections here.*
