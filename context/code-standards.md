# Code Standards

## General

- Keep modules small and single-purpose.
- Fix root causes — do not layer workarounds.
- Do not mix unrelated concerns in one component or route.
- Respect the system boundaries defined in `architecture-context.md`.

## TypeScript

- Strict mode is required (`tsconfig.json` has `strict: true`).
- No `any`; use explicit interfaces or narrowly scoped types.
- Validate unknown external input at system boundaries before trusting it.
- Use `interface` for object contracts; `type` for unions and mapped types.
- Runtime type guards (`isRSSItem`, `isGrokSummary`, etc.) live in `src/lib/news/types.ts`.

## Next.js / React

- Default to React Server Components; add `"use client"` only for browser hooks or real-time state.
- Route handlers are thin: auth guard → validate input → call lib function → return response.
- Long-running AI work lives in `scripts/`; cron route handlers just call `runPipeline()`.
- `import 'server-only'` at the top of every `src/lib/` file that accesses secrets or Redis.

## Styling

- Use the hex palette defined in `context/ui-context.md`; no raw Tailwind zinc/slate/gray classes.
- `animate-pulse` for skeleton loading states.
- `animate-ping` for live indicators.
- `transition-colors` for hover state color transitions.
- Keep Tailwind arbitrary values consistent: `bg-[#0a0a0a]`, `border-[#1a1a1a]`, etc.

## API Routes

- Cron routes: `validateVercelCronAuth(req)` must be the first call inside the GET handler.
- Stripe webhook route: verify signature with `stripe.webhooks.constructEvent` before any logic.
- Newsletter unsubscribe: query DB for the email before any mutation; record timestamp on update.
- Return consistent JSON shapes; use `NextResponse.json(…, { status })`.

## Redis Usage

- Use `Redis.fromEnv()` — never hardcode connection strings.
- All pipeline/broadcast Redis keys follow the naming conventions in `architecture-context.md`.
- Dedup keys use 7-day TTL (`7 * 24 * 60 * 60` seconds).
- Stripe idempotency keys use 7-day TTL.
- Dead-letter items go to `broadcast:dead:<channel>` (LPUSH); retry items to `broadcast:retry:<channel>`.

## Error Handling

- AI pipeline stages: each stage is individually try/caught. On Grok failure: dead-letter and
  return early. On DeepSeek/Gemini failure: log as `degraded`, continue with available output.
- Never swallow errors silently; log with `PipelineLogger` and include cause.
- Dead-letter path: `BroadcastQueue.enqueueFailure()` → Redis, never filesystem.

## File Organisation

- `src/lib/` — shared infrastructure and business logic.
- `src/lib/news/` — pipeline modules (dedup, broadcast-queue, telegram, newsletter, types).
- `src/lib/ops/` — operational utilities (cron-guard, env-audit, alerts).
- `src/lib/monetisation/` — Stripe and subscription modules.
- `scripts/` — pipeline entry point (`daily-article.ts`).
- `src/app/data/` — data dashboard pages.
- `src/components/` — UI only; no business logic.
- Name files after the responsibility they contain, not the technology.

## Forbidden Patterns

- No `@supabase/*` imports anywhere.
- No filesystem writes from deployed functions (`/tmp` is not reliable on Vercel).
- No `process.exit()` in lib modules.
- No unauthenticated mutations in route handlers.
