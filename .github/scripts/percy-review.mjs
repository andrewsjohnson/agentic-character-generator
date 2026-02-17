#!/usr/bin/env node
/**
 * percy-review.mjs
 *
 * Fetches the Percy build for the current commit, downloads any visual diffs,
 * and asks Claude (vision) whether each change looks intentional or like a
 * regression.  If everything looks good the build is auto-approved via the
 * Percy API and a summary comment is posted to the PR.  If anything looks
 * suspicious the build is left in "unreviewed" state for a human to inspect.
 *
 * Required env vars:
 *   PERCY_TOKEN        — Percy project token (secret)
 *   ANTHROPIC_API_KEY  — Anthropic API key (secret)
 *   PERCY_PROJECT      — Percy project in "org-slug/project-slug" format
 *                        (GitHub Actions variable, e.g. "acme/character-gen")
 *   GH_SHA             — The commit SHA whose Percy build we want to review
 *   GH_TOKEN           — GitHub token for posting the PR comment
 *   GH_REPO            — "owner/repo" string
 *   PR_NUMBER          — PR number; if empty the comment step is skipped
 */

import { Buffer } from 'node:buffer';

const PERCY_API       = 'https://percy.io/api/v1';
const ANTHROPIC_API   = 'https://api.anthropic.com/v1/messages';
const COMMENT_MARKER  = '<!-- percy-claude-review -->';

// ─── Percy helpers ────────────────────────────────────────────────────────────

async function percyGet(path) {
  const res = await fetch(`${PERCY_API}${path}`, {
    headers: {
      Authorization: `Token ${process.env.PERCY_TOKEN}`,
      Accept: 'application/vnd.api+json',
    },
  });
  if (!res.ok) {
    throw new Error(`Percy GET ${path} → ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function percyPost(path) {
  const res = await fetch(`${PERCY_API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${process.env.PERCY_TOKEN}`,
      Accept: 'application/vnd.api+json',
    },
  });
  if (!res.ok) {
    throw new Error(`Percy POST ${path} → ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

/** Find the Percy build for a specific git SHA, retrying for up to ~60 s. */
async function findBuild(sha) {
  // PERCY_PROJECT is "org-slug/project-slug" — the slash is a path separator
  // so we must NOT encode the whole string. Encode each slug individually.
  const project = process.env.PERCY_PROJECT.split('/').map(encodeURIComponent).join('/');
  for (let attempt = 0; attempt < 6; attempt++) {
    if (attempt > 0) await sleep(10_000);
    const { data } = await percyGet(
      `/projects/${project}/builds?filter[sha]=${sha}`
    );
    if (data?.length) {
      console.log(`Found Percy build ${data[0].id} on attempt ${attempt + 1}`);
      return data[0];
    }
    console.log(`Build not found yet (attempt ${attempt + 1}/6), retrying…`);
  }
  return null;
}

/** Poll until the Percy build reaches a terminal state. */
async function waitForBuild(buildId) {
  for (let i = 0; i < 24; i++) {        // up to 2 minutes
    const { data } = await percyGet(`/builds/${buildId}`);
    const state = data.attributes.state;
    console.log(`Build ${buildId} state: ${state}`);
    if (state === 'finished' || state === 'failed') return data;
    await sleep(5_000);
  }
  throw new Error(`Build ${buildId} did not finish within 2 minutes`);
}

/**
 * Return snapshots that have visual differences.
 * Matches them up with their comparisons from the JSON:API `included` array
 * and extracts the diff, base, and head image URLs.
 */
async function getChangedSnapshots(buildId) {
  const { data, included = [] } = await percyGet(
    `/builds/${buildId}/snapshots`
  );

  // Index included resources by "type:id" for fast lookup.
  const byKey = {};
  for (const item of included) {
    byKey[`${item.type}:${item.id}`] = item;
  }

  const changed = [];
  for (const snapshot of data) {
    if (snapshot.attributes['review-state'] !== 'unreviewed') continue;

    // Find the first associated comparison that has a nonzero diff.
    const compRefs = snapshot.relationships?.comparisons?.data ?? [];
    const comparison = compRefs
      .map(ref => byKey[`comparisons:${ref.id}`])
      .find(c => c && (c.attributes['diff-ratio'] ?? 0) > 0);

    if (!comparison) continue;

    const a = comparison.attributes;
    changed.push({
      id: snapshot.id,
      name: snapshot.attributes.name,
      diffRatio: a['diff-ratio'],
      diffImageUrl: a['diff-image-url'],
      baseImageUrl: a['base-screenshot-url'],
      headImageUrl: a['head-screenshot-url'],
    });
  }
  return changed;
}

// ─── Claude vision helper ─────────────────────────────────────────────────────

async function toBase64(url) {
  if (!url) return null;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer()).toString('base64');
}

/**
 * Send baseline, current, and diff screenshots to Claude and get a structured
 * approve/reject decision.
 */
async function reviewWithClaude(snapshot) {
  const [baseB64, headB64, diffB64] = await Promise.all([
    toBase64(snapshot.baseImageUrl),
    toBase64(snapshot.headImageUrl),
    toBase64(snapshot.diffImageUrl),
  ]);

  const img = (label, b64) =>
    b64
      ? [
          { type: 'text', text: `${label}:` },
          { type: 'image', source: { type: 'base64', media_type: 'image/png', data: b64 } },
        ]
      : [{ type: 'text', text: `${label}: (image unavailable)` }];

  const content = [
    {
      type: 'text',
      text: `You are an automated visual regression reviewer for a D&D character creator web app.

Snapshot: "${snapshot.name}" — ${(snapshot.diffRatio * 100).toFixed(2)}% of pixels changed.

Review the three screenshots below: the baseline (before), the current (after), and the pixel diff (red = removed, green = added).

**Approve** if the change looks intentional and correct — e.g. a styling improvement, layout polish, content update, or trivial rendering noise (sub-pixel antialiasing).
**Reject** if the change looks like a regression — broken layout, missing or overlapping content, wrong colours, or anything that appears unintentional.

Respond with ONLY a JSON object, no other text:
{"decision":"approve"|"reject","reason":"one concise sentence"}`,
    },
    ...img('Baseline (before)', baseB64),
    ...img('Current (after)', headB64),
    ...img('Diff (red = removed, green = added)', diffB64),
  ];

  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 256,
      messages: [{ role: 'user', content }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API error ${res.status}: ${await res.text()}`);
  }

  const { content: out } = await res.json();
  const text = out[0].text.trim();
  const match = text.match(/\{[\s\S]*?\}/);
  if (!match) throw new Error(`Could not parse Claude response: ${text}`);
  return JSON.parse(match[0]);
}

// ─── GitHub comment helpers ───────────────────────────────────────────────────

async function ghFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.GH_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status} ${url}: ${await res.text()}`);
  }
  return res.json();
}

/** Find an existing Percy review comment on the PR (identified by a hidden marker). */
async function findExistingComment(owner, repo, prNumber) {
  const comments = await ghFetch(
    `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments?per_page=100`
  );
  return comments.find(c => c.body.includes(COMMENT_MARKER));
}

/** Create or update the Percy review comment so the PR stays tidy. */
async function upsertComment(prNumber, body) {
  const [owner, repo] = process.env.GH_REPO.split('/');
  const fullBody = `${COMMENT_MARKER}\n${body}`;
  const existing = await findExistingComment(owner, repo, prNumber);

  const url = existing
    ? `https://api.github.com/repos/${owner}/${repo}/issues/comments/${existing.id}`
    : `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`;

  await ghFetch(url, {
    method: existing ? 'PATCH' : 'POST',
    body: JSON.stringify({ body: fullBody }),
  });
}

function formatComment(buildUrl, reviews, allApproved) {
  const icon   = allApproved ? '✅' : '⚠️';
  const status = allApproved
    ? 'All visual diffs auto-approved by Claude'
    : 'Some snapshots need human review';

  const rows = reviews.map(({ name, diffRatio, review }) => {
    const decIcon = review.decision === 'approve' ? '✅' : '⚠️';
    return `| \`${name}\` | ${(diffRatio * 100).toFixed(2)}% | ${decIcon} ${review.decision} | ${review.reason} |`;
  });

  return `## ${icon} Percy Visual Review

${status}

| Snapshot | Diff | Decision | Reason |
|---|---|---|---|
${rows.join('\n')}

[View full Percy build →](${buildUrl})`;
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const sha      = process.env.GH_SHA;
  const prNumber = process.env.PR_NUMBER;

  if (!sha) throw new Error('GH_SHA is required');

  console.log(`Looking for Percy build for SHA ${sha}…`);
  const build = await findBuild(sha);

  if (!build) {
    console.log('No Percy build found — skipping review (PERCY_TOKEN may not be configured).');
    return;
  }

  const finishedBuild = await waitForBuild(build.id);
  const buildUrl =
    finishedBuild.attributes['web-url'] ??
    `https://percy.io/${process.env.PERCY_PROJECT}/builds/${build.id}`;

  if (finishedBuild.attributes.state === 'failed') {
    console.log('Percy build failed — skipping review.');
    return;
  }

  const changed = await getChangedSnapshots(build.id);

  if (changed.length === 0) {
    console.log('No visual diffs detected — auto-approving Percy build.');
    await percyPost(`/builds/${build.id}/approve`);
    if (prNumber) {
      await upsertComment(
        prNumber,
        `## ✅ Percy Visual Review\n\nNo visual diffs detected — build auto-approved.\n\n[View Percy build →](${buildUrl})`
      );
    }
    return;
  }

  console.log(`Reviewing ${changed.length} changed snapshot(s) with Claude…`);
  const reviews = [];

  for (const snapshot of changed) {
    console.log(
      `  Reviewing "${snapshot.name}" (${(snapshot.diffRatio * 100).toFixed(2)}% diff)…`
    );
    const review = await reviewWithClaude(snapshot);
    console.log(`  → ${review.decision}: ${review.reason}`);
    reviews.push({ ...snapshot, review });
  }

  const allApproved = reviews.every(r => r.review.decision === 'approve');

  if (allApproved) {
    console.log('Claude approved all diffs — approving Percy build.');
    await percyPost(`/builds/${build.id}/approve`);
  } else {
    console.log('Some diffs flagged for human review — leaving Percy build unresolved.');
  }

  if (prNumber) {
    await upsertComment(prNumber, formatComment(buildUrl, reviews, allApproved));
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
