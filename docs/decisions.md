# Architectural Decisions

## 2026-02-15: Project Scaffolding

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

## 2026-02-18: PDF Library Choice for Character Export

**Context**: Adding character export functionality requires client-side PDF generation.

**Options Considered**:
- **jsPDF** (~50KB gzipped): Lightweight, simple API, widely used, good browser support
- **pdfmake** (~70KB gzipped): Declarative syntax, good for structured documents, larger bundle
- **@react-pdf/renderer**: React-based, larger bundle, overkill for this use case

**Decision**: Use jsPDF for PDF generation.

**Rationale**: jsPDF provides the best balance of bundle size and functionality for our needs. The character sheet is a structured text document without complex layout requirements, making jsPDF's imperative API sufficient. The ~50KB gzipped addition is an acceptable trade-off for the requested feature.

## 2026-02-18: Character Export/Import Architecture

**Context**: Adding character export (PDF + JSON) and import (JSON) functionality.

**Decision**:
- Serialization logic lives in `src/rules/serialization.ts` (pure functions, no DOM)
- JSON export (browser download trigger) in `src/rules/json-export.ts`
- PDF generation in `src/rules/pdf-export.ts`
- Export buttons placed in `BottomNavigation` on the Review step, next to the disabled Next button
- New `/start` route as landing page with "Create New Character" and "Import Character" options
- Exported JSON wraps character data with a version field for future migration support
- Import navigates directly to `/review` after successful file load

**Rationale**: Keeping serialization pure (no DOM dependencies) enables easy testing. Placing export buttons in BottomNavigation keeps the UI consistent with existing navigation patterns. The Start step provides a clean entry point for both new and returning users. Version field in exports enables backward-compatible schema migrations in the future.
