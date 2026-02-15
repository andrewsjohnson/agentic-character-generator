# D&D 5e Character Creator

A multi-step wizard for creating D&D 5th Edition characters, built with React, TypeScript, and Vite. Uses SRD (System Reference Document) data bundled as local JSON. No external API or CMS.

## Tech Stack

- React 18+ with TypeScript (strict mode)
- Vite for build tooling
- React Router for step navigation
- Tailwind CSS for styling
- Vitest + React Testing Library for tests

## Architecture Principles

All rules logic lives in `src/rules/`. Components never contain game logic directly — they call functions from `rules/` and render the results.

All game data types live in `src/types/`. Every type file is self-contained; types do not import from other type files unless there's a direct dependency (e.g., `class.ts` may import `AbilityName` from `ability.ts`).

State is managed through a single `useCharacter` hook in `src/hooks/useCharacter.ts` using React `useState`. No external state library. Derived values (modifiers, AC, HP, spell save DC) are **never stored in state** — they are always computed from base values at read time using functions from `rules/derived-stats.ts`.

Each wizard step is a self-contained directory under `src/steps/` with its component and test file. Steps receive `character` and an update function as props. Steps do not read or write global state directly.

Validation functions live in `src/rules/validation.ts` and always return `{ valid: boolean; errors: string[] }`.

## File Structure

```
src/
  types/         # TypeScript types only, no logic
  data/          # Static JSON files matching the types exactly
  rules/         # Pure functions for all game logic
  steps/         # One directory per wizard step (component + test)
  components/    # Shared UI components
  hooks/         # useCharacter, useStepValidation
  App.tsx
docs/
  rules/         # Human-written rules references for each game system
  decisions.md   # Running log of architectural decisions
  current-state.md
```

## Code Conventions

- No barrel files (`index.ts` re-exports). Import directly from the source file.
- No path aliases. Use relative imports.
- No higher-order components or render props. Use hooks and direct composition.
- No premature abstraction. Build the specific thing needed now, extract shared patterns only when a clear duplication exists across three or more instances.
- All rules functions are pure: no side effects, no dependency on React, no DOM access.
- Prefer `type` over `interface` for consistency.
- Name files after their primary export: `AbilityScoreStep.tsx` exports `AbilityScoreStep`.

## Testing

- Rules functions in `src/rules/` must have corresponding test files.
- Tests go next to the file they test: `ability-scores.ts` → `ability-scores.test.ts`.
- Step components get tests in their step directory: `RaceStep/RaceStep.test.tsx`.
- Use concrete SRD values in tests (e.g., Hill Dwarf gets +2 CON, +1 WIS) rather than abstract placeholders.

## D&D Rules References

Task-specific rules references are in `docs/rules/`. Consult the relevant file before implementing any game logic:

- `ability-scores.md` — modifier formula, point buy costs/budget, standard array, racial bonus application
- `races.md` — racial traits, ability bonuses, subraces
- `classes.md` — hit dice, primary abilities, saving throw proficiencies, class features at level 1
- `backgrounds.md` — skill proficiencies, equipment, feature
- `equipment-and-armor.md` — AC calculation, weapon properties
- `skills-and-proficiencies.md` — skill-to-ability mapping, proficiency bonus
- `spellcasting.md` — spell save DC, spell attack modifier, cantrips/slots at level 1
- `hit-points.md` — HP at level 1 formula

When a rules reference and the SRD disagree, follow the rules reference — it reflects deliberate implementation decisions for this app.

## JSON Data

All data files in `src/data/` are pre-shaped to match their corresponding types in `src/types/`. Import and use them directly. Do not transform or reshape data at runtime.

## What Not To Do

- Do not introduce any new dependencies without being explicitly asked to.
- Do not add server-side rendering, API routes, or data fetching layers.
- Do not store derived stats in character state.
- Do not put game logic in React components.
- Do not create generic/abstract component systems (e.g., a universal `<FormField>` that handles many variants). Build the specific UI each step needs.
- Do not use `any` or `as` type assertions. If the types don't work, fix the types.
