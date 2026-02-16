#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Node version:"
node --version
npm --version

echo "📦 Installing dependencies (clean CI install)"
# Use npm ci if lockfile exists (preferred for CI)
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

echo "🔎 Typechecking"
npm run typecheck

echo "🧹 Linting"
npm run lint

echo "🧪 Running tests"
# Ensure non-interactive, fail on first failure
npx vitest run --reporter=default

echo "🏗️ Building production bundle"
npm run build

echo "✅ CI passed"
