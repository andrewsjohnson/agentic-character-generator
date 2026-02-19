# Agentic Development Workflow

This document describes how autonomous AI agents work together through GitHub Actions to plan, implement, review, and merge code changes in this repository. The system uses Claude Code (via [claude-code-action](https://github.com/anthropics/claude-code-action)) as the AI backbone, with GitHub issues, pull requests, labels, and comments as the coordination layer.

## Table of Contents

- [Overview](#overview)
- [Lifecycle at a Glance](#lifecycle-at-a-glance)
- [Phase 1: Planning](#phase-1-planning)
- [Phase 2: PR Creation](#phase-2-pr-creation)
- [Phase 3: Implementation](#phase-3-implementation)
- [Phase 4: Code Review](#phase-4-code-review)
- [Phase 5: CI/CD](#phase-5-cicd)
- [Phase 6: Visual Regression Testing](#phase-6-visual-regression-testing)
- [Phase 7: Post-Merge Automation](#phase-7-post-merge-automation)
- [Safety Mechanisms](#safety-mechanisms)
- [Human Intervention Matrix](#human-intervention-matrix)
- [Common Scenarios](#common-scenarios)
- [Workflow File Reference](#workflow-file-reference)

## Overview

The agentic development cycle minimizes human intervention while keeping humans in control of key decisions. An issue goes through planning, approval, implementation, review, and merge — with AI agents handling the bulk of the work and humans providing oversight at well-defined checkpoints.

```
Issue Created
    |
    v
/agent-plan  ──>  Planning Agent creates plan
    |
    v
Human reviews plan
    |
    ├── /plan-revise  ──>  Agent revises plan
    |
    └── /agent-approve  ──>  PR created automatically
                                    |
                                    v
                            Implementation Agent codes the changes
                                    |
                                    v
                            Review Agent evaluates the PR
                                    |
                                    ├── APPROVE  ──>  Ready for merge
                                    |
                                    └── CHANGES_REQUESTED  ──>  Implementation Agent fixes
                                                                    |
                                                                    v
                                                                Review Agent re-evaluates
                                                                (up to 3 rounds, then HALTED)
```

## Lifecycle at a Glance

| Phase | Trigger | Agent | Human Required? |
|-------|---------|-------|-----------------|
| Planning | `/agent-plan` comment on issue | Planner | Yes — approve or revise the plan |
| Plan Revision | `/plan-revise` comment on issue | Planner | Yes — provide revision feedback |
| PR Creation | `/agent-approve` comment on issue | None (shell script) | No |
| Implementation | `/agent-implement` comment on PR | Implementer | Only if agent posts "Questions for human" |
| Code Review | `/agent-review` comment on PR | Reviewer | Only if HALTED after 3 review rounds |
| CI | Automatic on PR/push | None (scripts) | Only if CI repeatedly fails and PR is HALTED |
| Visual Testing | Automatic after Playwright E2E | Percy Review script | Only if significant visual changes detected |
| Post-Merge | Automatic on PR merge | None (shell script) | No — follow-up issues created for later triage |

## Phase 1: Planning

**Workflow:** `agent-issue-plan.yml`
**Trigger:** `/agent-plan` comment on an issue (not a PR)

When a human comments `/agent-plan` on an issue, the Planning Agent:

1. Reads the repository code to understand the codebase
2. Produces a structured implementation plan as an issue comment, starting with `## Plan v1`
3. The plan includes: summary, scope, implementation steps, files to change, tests, risks, and a checklist

The plan comment ends with instructions:
- `/agent-approve` — to approve and begin implementation
- `/plan-revise` — to request changes to the plan

**If the agent has questions**, it posts a `## Questions for human` comment and the `AWAITING-FEEDBACK` label is applied to the issue.

### Plan Revision

**Workflow:** `agent-issue-revise-plan.yml`
**Trigger:** `/plan-revise` comment on an issue

When a human comments `/plan-revise <feedback>`, the Planning Agent:

1. Finds the most recent plan comment (`## Plan vN`)
2. Reads the revision feedback
3. Posts a new plan comment (`## Plan vN+1`) with a `### Changes Made` section

The version number increments with each revision. Multiple rounds of revision are supported.

## Phase 2: PR Creation

**Workflow:** `agent-issue-approved-create-pr.yml`
**Trigger:** `/agent-approve` comment on an issue

When a human approves the plan:

1. A branch is created: `agent/issue-{number}-{slugified-title}`
2. An initial empty commit is made (so the branch has content for the PR)
3. A PR is created with the latest plan in the PR body, linked to the issue via `Closes #N`
4. The workflow automatically posts `/agent-implement` on the PR to kick off implementation
5. A comment is posted on the original issue linking to the new PR

If a PR already exists for the branch, it is reused (idempotent).

## Phase 3: Implementation

**Workflow:** `agent-pr-implement.yml`
**Trigger:** `/agent-implement` comment on a PR

The Implementation Agent is the workhorse of the system. It:

1. **Reads the PR body** as the authoritative plan (single source of truth)
2. **Checks for existing work** via `git log` to resume from where a previous run left off
3. **Derives 3-6 checkpoints** from the plan and posts them as a checklist comment
4. **Implements checkpoint-by-checkpoint**, committing and pushing after each one
5. **Runs verification** (typecheck, lint, tests, build) per CLAUDE.md instructions
6. **On success**, automatically triggers `/agent-review`

### Commit Discipline

The agent commits and pushes:
- After completing each checkpoint
- When 8+ files have been modified since the last commit
- After running any verification step
- When approaching the maximum turn limit (WIP commits are acceptable)

### Human Questions

If the Implementation Agent needs a human decision:
- It posts a `## Questions for human` comment with numbered questions and options
- The `AWAITING-FEEDBACK` label is applied
- The agent commits any safe progress and stops

When the human responds (any comment starting with `/agent`), the `agent-pr-feedback.yml` workflow removes the `AWAITING-FEEDBACK` label and re-triggers `/agent-implement`.

### Implementation Retry Ladder

If the implementation step fails (workflow failure, not agent questions):

| Current State | Action |
|--------------|--------|
| No retry labels | Add `RETRY-ONE`, re-trigger `/agent-implement` |
| `RETRY-ONE` | Add `RETRY-TWO`, re-trigger `/agent-implement` |
| `RETRY-TWO` | Remove retry labels, add `HALTED` — human intervention required |

The retry ladder is skipped if `AWAITING-FEEDBACK` is present (the agent is waiting for human input, not failing).

### Feedback Handler

**Workflow:** `agent-pr-feedback.yml`
**Trigger:** Any `/agent*` comment on a PR from a non-bot user

This workflow handles human responses to agent questions:
1. Checks if the `AWAITING-FEEDBACK` label is present
2. If yes, removes the label and posts `/agent-implement` to resume work
3. Skips if `HALTED` is set

This ensures only human comments (not bot-to-bot handoffs) trigger the feedback handler.

## Phase 4: Code Review

**Workflow:** `agent-pr-review.yml`
**Trigger:** `/agent-review` comment on a PR (typically posted automatically after successful implementation)

The Review Agent evaluates the PR against the plan:

1. **Intent & Scope** — Confirms implementation matches the plan, flags scope creep
2. **Correctness & Risk** — Checks for regressions, async issues, input validation, error handling
3. **Architecture & Conventions** — Enforces CLAUDE.md rules
4. **Test Quality** — Verifies tests cover happy path and at least one failure case
5. **Maintainability** — Reviews naming, complexity, dead code

### Review Output

The review is posted as a PR comment containing:
- `## Review` header
- Executive summary (3-6 sentences)
- Findings table (file, line, severity, category, issue, fix)
- Required fixes (if any)
- Follow-up candidates (minor items that shouldn't block merge)
- A verdict: `Verdict: APPROVE` or `Verdict: CHANGES_REQUESTED`

### Review Circuit Breaker

If changes are requested, the workflow enters a review-implement loop:

| Round | Labels Applied | Action |
|-------|---------------|--------|
| 1 | `REVIEW-ROUND-1` | Re-trigger `/agent-implement` |
| 2 | `REVIEW-ROUND-2` | Re-trigger `/agent-implement` |
| 3 | `REVIEW-ROUND-3` | Remove round labels, add `HALTED` |

After 3 rounds without approval, the PR is halted and a comment explains that human intervention is needed. To resume: remove `HALTED` and comment `/agent-implement`.

## Phase 5: CI/CD

### CI Pipeline

**Workflow:** `ci.yml`
**Trigger:** All pull requests and pushes to `main`

Runs the standard checks via `scripts/ci.sh`:
1. `npm ci` (or `npm install`)
2. `npm run typecheck`
3. `npm run lint`
4. `npx vitest run`
5. `npm run build`

Uses concurrency groups (`ci-${{ github.ref }}`) with `cancel-in-progress: true` to avoid redundant runs.

### CI Failure Handler

**Workflow:** `ci-failure-to-implement.yml`
**Trigger:** Fires when the CI workflow completes

**On CI success:** Removes the `CI-FAILED` label if present.

**On CI failure:**
1. Finds the associated PR
2. Checks guardrails (skips if fork, `IN-PROGRESS`, `AWAITING-FEEDBACK`, or `HALTED`)
3. Applies the `CI-FAILED` label
4. Posts `/agent-implement` to bounce the PR back to the Implementation Agent for fixes

### Deployment

**Workflow:** `deploy.yml`
**Trigger:** Push to `main` or manual `workflow_dispatch`

Builds the production bundle and deploys to GitHub Pages.

## Phase 6: Visual Regression Testing

### Playwright E2E Tests

**Workflow:** `playwright.yml`
**Trigger:** All pull requests and pushes to `main` or `claude/**` branches

1. Installs dependencies and Playwright browsers
2. Runs E2E tests via `npx percy exec -- npx playwright test`
3. Percy captures snapshots during test execution (no-op without `PERCY_TOKEN`)
4. Uploads the Playwright report as an artifact (retained for 14 days)

### Percy Visual Review

**Workflow:** `percy-review.yml`
**Trigger:** Fires when the Playwright E2E workflow completes successfully

Uses a custom Node.js script (`.github/scripts/percy-review.mjs`) that:
1. Fetches the Percy build for the commit SHA
2. Uses the Anthropic API to analyze visual diffs
3. Posts a PR comment with the review findings

**Human action:** Review the Percy dashboard if significant visual changes are flagged.

## Phase 7: Post-Merge Automation

**Workflow:** `agent-pr-followup-issues.yml`
**Trigger:** PR is merged (closed with `merged == true`)

After a PR is merged:

1. Finds the last review comment containing `### Follow-up candidates (post-merge)`
2. Extracts checklist items (`- [ ] Title — Description`)
3. Creates individual GitHub issues for each follow-up, labeled `follow-up`
4. Posts a summary comment on the merged PR listing the created issues

This ensures minor improvements identified during review are not forgotten.

## Safety Mechanisms

### Labels as Control Signals

| Label | Effect |
|-------|--------|
| `HALTED` | Stops all automation. No agent workflows will proceed. Human must remove to resume. |
| `AWAITING-FEEDBACK` | Pauses automation until a human responds. Feedback handler resumes on `/agent*` comment. |
| `CI-FAILED` | Signals CI failure. Implementation agent is re-triggered to fix. Cleared on CI success. |
| `IN-PROGRESS` | Signals active agent work. CI failure handler skips re-triggering when present. |
| `RETRY-ONE` | First implementation failure retry. |
| `RETRY-TWO` | Second implementation failure retry. Third failure triggers `HALTED`. |
| `REVIEW-ROUND-1/2/3` | Tracks review-implement cycles. Three rounds max before `HALTED`. |
| `follow-up` | Applied to issues auto-created from review follow-up candidates. |

### Fork Protection

All agent workflows check that the PR originates from the same repository (not a fork) before running. This prevents unauthorized automation on external contributions.

### Concurrency Controls

| Workflow | Concurrency Group | Cancel In-Progress |
|----------|-------------------|-------------------|
| CI | `ci-${{ github.ref }}` | Yes |
| Implementation | `implement-${{ github.event.issue.number }}` | No |
| Review | `review-${{ github.event.issue.number }}` | No |
| PR Creation | `agent-create-pr-issue-${{ github.event.issue.number }}` | Yes |
| Playwright | `playwright-${{ github.ref }}` | Yes |
| Deploy | `pages` | Yes |

Implementation and review use `cancel-in-progress: false` to avoid interrupting long-running agent work.

### Stale Feedback Reminder

**Workflow:** `agent-stale-feedback-reminder.yml`
**Schedule:** Daily at 09:00 UTC

Checks for PRs and issues with the `AWAITING-FEEDBACK` label that haven't been updated in 3+ days and posts a reminder comment.

## Human Intervention Matrix

| Scenario | Human Action Required | Command to Resume |
|----------|----------------------|-------------------|
| Plan posted on issue | Approve or revise | `/agent-approve` or `/plan-revise <feedback>` |
| Agent asks questions (issue) | Answer questions | Comment on the issue (agent detects response) |
| Agent asks questions (PR) | Answer questions | Comment starting with `/agent` |
| Review requests changes (rounds 1-2) | None (automatic) | Automatic via `/agent-implement` |
| PR halted after 3 review rounds | Review findings, intervene | Remove `HALTED` label, comment `/agent-implement` |
| PR halted after 3 implementation failures | Debug the issue | Remove `HALTED` label, comment `/agent-implement` |
| CI failure | None (automatic fix attempt) | Automatic via `/agent-implement` |
| Percy visual changes flagged | Review Percy dashboard | Approve/reject on Percy dashboard |
| Follow-up issues created post-merge | Triage and prioritize | Standard issue management |

## Common Scenarios

### Happy Path: Issue to Merge

1. Human creates an issue describing the desired change
2. Human comments `/agent-plan` on the issue
3. Planning Agent posts `## Plan v1` with implementation details
4. Human reviews and comments `/agent-approve`
5. PR is automatically created with the plan in the body
6. Implementation Agent codes the changes, committing at each checkpoint
7. On completion, `/agent-review` is triggered automatically
8. Review Agent approves with `Verdict: APPROVE`
9. Human merges the PR
10. Follow-up issues are auto-created from review candidates (if any)

### Plan Revision

1. Planning Agent posts `## Plan v1`
2. Human comments `/plan-revise Please also add tests for edge case X`
3. Planning Agent posts `## Plan v2` with the requested changes
4. Human comments `/agent-approve` on the revised plan

### Implementation Questions

1. Implementation Agent encounters an ambiguous requirement
2. Agent posts `## Questions for human` with options
3. `AWAITING-FEEDBACK` label is applied, automation pauses
4. Human responds with their choice
5. Feedback handler removes label, re-triggers `/agent-implement`
6. Agent resumes from its last commit

### Review Feedback Loop

1. Review Agent posts `Verdict: CHANGES_REQUESTED` with findings
2. `REVIEW-ROUND-1` label applied, `/agent-implement` triggered
3. Implementation Agent addresses the findings
4. Review Agent re-evaluates
5. If approved: done. If not: cycle continues (up to 3 rounds)

### CI Failure Recovery

1. CI fails on a PR
2. `ci-failure-to-implement.yml` applies `CI-FAILED` label
3. `/agent-implement` is posted to fix the failures
4. Implementation Agent reads CI output and fixes the code
5. CI re-runs on the new push
6. On success, `CI-FAILED` label is removed

## Workflow File Reference

| File | Purpose |
|------|---------|
| `agent-issue-plan.yml` | Creates implementation plan from `/agent-plan` on issues |
| `agent-issue-revise-plan.yml` | Revises plan from `/plan-revise` on issues |
| `agent-issue-approved-create-pr.yml` | Creates PR and branch from `/agent-approve` on issues |
| `agent-pr-implement.yml` | Implements plan from `/agent-implement` on PRs |
| `agent-pr-review.yml` | Reviews PR from `/agent-review` on PRs |
| `agent-pr-feedback.yml` | Handles human responses to agent questions on PRs |
| `agent-pr-followup-issues.yml` | Creates follow-up issues when PRs are merged |
| `agent-stale-feedback-reminder.yml` | Daily reminder for stale `AWAITING-FEEDBACK` items |
| `ci.yml` | Standard CI pipeline (typecheck, lint, test, build) |
| `ci-failure-to-implement.yml` | Re-triggers implementation on CI failure |
| `playwright.yml` | E2E tests with Percy visual snapshot upload |
| `percy-review.yml` | AI-powered visual regression review |
| `deploy.yml` | Deploys to GitHub Pages on push to main |
| `claude-pr-comment-trigger.yml` | Ad-hoc `@claude` mentions on PRs and issues |
| `claude-plan-from-issue.yml` | Legacy planning workflow (uses `/plan` trigger) |
| `claude-create-pr-from-plan.yml` | Legacy PR creation (uses `/approve-claude` trigger) |
| `claude-implement-in-pr.yml` | Legacy implementation (uses `/implement-claude` trigger) |
| `claude-pr-review.yml` | Legacy review (uses `/review` trigger) |

> **Note:** The `claude-*` prefixed workflows are the original versions. The `agent-*` prefixed workflows are the current active system with improved safety mechanisms (GitHub App tokens, retry ladders, circuit breakers, fork protection). Both coexist in the repository.

---

*Keep this document in sync with workflow file changes. When adding or modifying workflows, update the relevant sections here.*
