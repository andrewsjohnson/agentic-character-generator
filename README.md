# Agentic Character Generator

A D&D 5th Edition character creation wizard built with React, TypeScript, and Vite. Uses SRD (System Reference Document) data bundled as local JSON — no external API or CMS required.

**[Live Demo](https://andrewsjohnson.github.io/agentic-character-generator/)**

## Features

- Multi-step wizard guiding users through character creation
- Species, class, background, ability scores, equipment, and review steps
- Point buy and standard array ability score methods
- Automatic calculation of derived stats (modifiers, AC, HP, spell save DC)
- All game data sourced from the D&D 5e SRD

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- npm (included with Node.js)

### Setup

```bash
git clone https://github.com/andrewsjohnson/agentic-character-generator.git
cd agentic-character-generator
npm install
```

### Running the Dev Server

```bash
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Development

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest in watch mode |
| `npx vitest run` | Run all tests once (CI mode) |

### Validation

Before committing changes, run these checks (also enforced in CI):

```bash
npm run typecheck
npm run lint
npx vitest run
npm run build
```

## Project Structure

```
src/
  types/         # TypeScript types (no logic)
  data/          # Static SRD JSON files
  rules/         # Pure functions for game logic
  steps/         # One directory per wizard step (component + test)
  components/    # Shared UI components
  hooks/         # useCharacter, useStepValidation
  App.tsx        # Root component with routing
docs/
  rules/         # D&D rules references for implementation
  decisions.md   # Architectural decision log
```

Key conventions:
- All game logic lives in `src/rules/` — components never contain rules directly.
- Derived values (modifiers, AC, HP) are computed at read time, never stored in state.
- Each wizard step is self-contained under `src/steps/`.

See [CLAUDE.md](./CLAUDE.md) for the full architecture guide, coding conventions, and detailed file structure.

## Tech Stack

- **React 18** — UI framework
- **TypeScript** — strict mode enabled
- **Vite** — build tooling and dev server
- **Tailwind CSS** — utility-first styling
- **React Router** — step-based navigation
- **Vitest** + **React Testing Library** — unit and component testing

## Contributing

1. Check [CLAUDE.md](./CLAUDE.md) for architecture principles and coding conventions.
2. Review the relevant files in [`docs/rules/`](./docs/rules/) before implementing any game logic.
3. Ensure all [validation commands](#validation) pass before committing.
4. Tests go next to the file they test (e.g., `ability-scores.ts` → `ability-scores.test.ts`).

## License

This project does not yet have a license file. Contact the repository owner for usage terms.
