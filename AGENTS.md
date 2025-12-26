# Repository Guidelines

## Project Structure & Module Organization
- `src/app` holds the Next.js App Router entrypoints (`layout.tsx`, `page.tsx`) and API routes under `api/*/route.ts`.
- `src/components` contains feature components; shared primitives live in `src/components/ui`.
- `src/lib` provides shared infrastructure: `db/` (Dexie IndexedDB), `providers/` (model adapters), and `utils.ts` (`cn` helper).
- `src/stores` defines Jotai atoms for client state.
- `src/types` contains shared domain types and ID helpers.
- `public/` stores static assets.

## Build, Test, and Development Commands
- `npm run dev` starts the local Next.js dev server.
- `npm run build` creates the production build.
- `npm run start` runs the production build locally.
- `npm run lint` runs ESLint (Next core-web-vitals + TypeScript rules).

## Coding Style & Naming Conventions
- TypeScript is strict (`tsconfig.json`); keep types explicit and reusable via `src/types`.
- Use the `@/*` path alias for imports (for example, `@/components/sidebar`).
- Prefer Tailwind utility classes from `src/app/globals.css`; use `cn` from `src/lib/utils.ts` to merge class names.
- Follow existing formatting in `src/` (2-space indentation) and rely on `npm run lint` as the baseline check.

## Testing Guidelines
- No automated test runner is configured yet (no `test` script and no `*.test.*` files).
- If you add tests, place them in a clearly named location (for example, `src/**/__tests__`) and add a `test` script to `package.json`.

## Commit & Pull Request Guidelines
- Git history currently contains only `Initial commit from Create Next App`, so no formal commit convention is established.
- Use short, imperative commit summaries (for example, `Add chat sidebar`).
- PRs should include a concise summary, testing notes, and screenshots for UI changes; link related issues when applicable.

## Configuration & Secrets
- Copy `.env.example` to `.env.local` and set API keys: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `XAI_API_KEY`.
- Do not commit `.env.local` or secrets.
