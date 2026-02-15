# Architectural Decisions

## 2024-02-15: Project Scaffolding

**Context**: Setting up the initial project structure for the D&D 5e Character Creator.

**Decision**:
- Use Vite as the build tool for fast development and modern tooling
- Use Vitest for testing (aligns with Vite ecosystem)
- Use Tailwind CSS for styling (utility-first approach)
- Use React Router for step navigation in the wizard
- Strict TypeScript configuration for type safety
- All game logic in pure functions under `src/rules/`
- No external state management library (using React useState via useCharacter hook)

**Rationale**: These choices prioritize simplicity, type safety, and alignment with the architecture principles defined in CLAUDE.md. The pure functions approach for game logic ensures testability and maintainability.

## 2026-02-15: Test Script and CI Workflow

**Context**: Need to configure test runner and CI workflow for the project.

**Decision**:
- Use `vitest` (not `vitest run`) in package.json test script for development convenience
- Tests can be run with `npx vitest run` for CI or one-off runs
- CI workflow file created but requires manual addition to `.github/workflows/` due to GitHub App permissions
- TypeScript configuration simplified: removed `tsconfig.node.json` project reference, included `vite.config.ts` directly in main tsconfig

**Rationale**: Vitest's watch mode is useful during development. CI environments should explicitly use `vitest run`. The simplified TypeScript configuration avoids project reference complexity while maintaining strict type checking.
