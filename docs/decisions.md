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
