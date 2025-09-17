# Repository Guidelines

## Project Structure & Module Organization
The app runs on Next.js with TypeScript. UI and logic live under `src`, with `pages` exposing routes, `components` for reusable views, and `lib`/`utils` for shared helpers. Stateful hooks sit in `src/hooks`, while schemas and types are grouped in `src/schemas` and `src/types`. Database scripts rely on the SQL seeds and migrations in `db/`. Playwright end-to-end specs are under `tests/` (top-level quick checks) and `tests/tests/` (full flows). Additional architecture notes and usage walkthroughs reside in `docs/`.

## Build, Test, and Development Commands
Use `npm run dev` for the local Next server. `npm run build` compiles production assets and surfaces type errors; follow with `npm run start` to smoke-test the build. `npm run lint` enforces ESLint/Next defaults, and `npm run type-check` must remain clean before pushes. Database helpers include `npm run db:migrate`, `npm run db:seed`, and the combined `npm run db:setup`. For QA, `npm test` runs the Playwright suite; add `--ui` or `--headed` when debugging, or `npm run test:session` to focus on the critical calendar flows.

## Coding Style & Naming Conventions
Stick to TypeScript with ES modules. Components and contexts use PascalCase filenames, hooks start with `use`, and shared utilities prefer lower-case dash-separated filenames (e.g., `date-format.ts`). Follow 2-space indentation and Tailwind utility-first styling. Run `npm run lint` before opening a PR; it applies the Next.js ESLint config backed by TypeScript types.

## Testing Guidelines
Author Playwright specs near related journeys (`tests/tests/…`). Name files `{feature}.spec.ts` and favor explicit selectors over brittle text matches. Keep the suite deterministic by seeding data via `npm run db:setup` before runs. When introducing complex UI logic, couple it with lightweight type-driven checks using `npm run type-check` watchers such as `npm run watch:full`.

## Commit & Pull Request Guidelines
Mirror the existing history: start commit subjects with a relevant emoji and an active voice summary (e.g., `🎯 Improve session extension metrics`). Group work into focused commits with green lint, build, and test statuses. Pull requests should link any tracking issue, summarize the user-facing impact, list validation commands, and attach screenshots or recordings for UI changes. Highlight schema alterations explicitly so reviewers can reset local data if needed.
