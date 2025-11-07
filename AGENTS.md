# Repository Guidelines

## Project Structure & Module Organization
- The monorepo is orchestrated by Turbo; `apps/web` hosts the Next.js 15 App Router app, with route segments under `app/`, reusable UI in `modules/`, MDX in `content/`, static assets in `public/`, and end-to-end specs in `tests/`.
- Shared business logic lives in `packages/ai|api|auth|database|i18n|logs|mail|payments|storage|utils`; publish types and helpers from these packages and re-import them inside the app to keep boundaries clean.
- Runtime toggles and secrets adapters sit in `config/`, build presets live in `tooling/`, and the `readme/` directory holds deep-dive guides; `.turbo/` and `.vscode/` should only store generated or editor metadata.

## Build, Test, and Development Commands
- `pnpm install` once at the root to link all workspaces; never switch to npm or yarn because that corrupts the lockfile.
- `pnpm dev` runs `dotenv -c -- turbo dev` to boot all required pipelines, while `pnpm --filter @repo/web dev` focuses on the web app for faster iteration.
- Use `pnpm build` to produce a production bundle and `pnpm start` to verify it; `pnpm clean` drops `.turbo` caches and any build artifacts when diagnosing stale state.
- Run `pnpm lint` then `pnpm format` to apply Biome’s lint rules and formatter settings before every commit.
- Data and quality gates: `pnpm --filter database push` (plus `... studio`) manage Drizzle migrations, `pnpm --filter @repo/web type-check` keeps TS accurate, and `pnpm --filter @repo/web e2e:ci` executes the headless Playwright suite.

## Coding Style & Naming Conventions
- `.editorconfig` enforces tab indentation (size 4), LF endings, and UTF-8; Biome inherits these settings, so avoid per-editor overrides.
- Write TypeScript everywhere, prefer small pure functions, avoid classes, and bias server components over `use client` unless browser APIs are required.
- Use kebab-case for directories, PascalCase for components, `use` prefixes for hooks, and suffix tests with `.spec.ts` or `.test.ts`; rely on the shared `cn` helper for Tailwind class composition.

## Testing Guidelines
- Store Playwright specs inside `apps/web/tests`, grouping fixtures under `tests/fixtures` to centralize mock data and helpers.
- For local QA run `pnpm --filter @repo/web dev` in one terminal and `pnpm --filter @repo/web e2e` in another; CI relies on the `e2e:ci` script which installs browsers before executing headless.
- Logic-heavy packages without bespoke runners should lean on `pnpm --filter @repo/web type-check` plus targeted Playwright coverage; document any manual verification steps in the pull request.

## Commit & Pull Request Guidelines
- Existing history follows Conventional Commits with scoped prefixes (for example `feat(auth): enable magic link fallback` or `fix(web): guard avatar upload`); keep subject lines imperative and under ~72 characters.
- Before committing, run linting, type-checks, and any affected e2e suites so reviewers can focus on behavior instead of tooling drift.
- Pull requests need a summary, motivation, linked issues, screenshots for UI changes, test evidence, and back-out steps when touching infra or config.

## Security & Configuration Tips
- Derive `.env.local` from `.env.local.example` and keep real secrets out of version control; root scripts load variables through `dotenv -c`.
- `docker-compose up -d` starts the local PostgreSQL instance on port 5433; follow with `pnpm --filter database push` and `... studio` to inspect schemas.
- Use `node create_admin.js` (with a temporary password) to seed administrators, then rotate credentials and preserve the `.turbo` directory layout when clearing caches.
