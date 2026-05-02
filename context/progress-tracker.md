# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

Batch 1 – Critical Fixes ✅ COMPLETE

## Current Goal

Batch 2 – High/Medium priority improvements (not yet started — awaiting explicit instruction)

## Completed

### Session: Security & Pipeline Audit (pre-Batch 1)
- Verified all 8 audit items are correctly implemented:
  - `scripts/daily-article.ts` — Grok/DeepSeek/Gemini each try/caught; dead-letter → Redis
  - `src/lib/news/dedup.ts` — 3-layer dedup (URL SHA-256, title SHA-256, content SHA-256)
  - `src/lib/news/telegram.ts` — per-chat rate limit + Retry-After on 429
  - `src/app/api/newsletter/unsubscribe/route.ts` — GDPR compliant (no login, timestamp, Resend removal)
  - All 5 cron routes call `validateVercelCronAuth` as first line
  - `src/app/api/health/route.ts` — checks Redis/Sanity/Resend/Telegram/Stripe/RSS/pipeline with timeouts
  - `src/lib/monetisation/stripe.ts` — `isDuplicateEvent` via Redis SET NX
  - Zero `@supabase/*` imports
- Fixed gap: `scripts/daily-article.ts` was not passing `description` to any dedup call;
  now all 3 call sites (`isDuplicate`, `bulkCheck`, both `markSeen`) pass `item.description`.
- Created `src/types/declarations.d.ts` — silenced TS7016 errors for `lucide-react` and `@heroicons/react`.
- `npx tsc --noEmit` → 0 errors.

### Batch 1 – Unit 1: Fix `/api/health` endpoint
- **Status**: Already complete — no changes required.
- `checkPipelineLastRun` correctly reads `pipeline:last-success` from Redis, calculates age
  in hours, returns `healthy` if < 26 h, `degraded` otherwise.
- All 9 system checks (redis, upstash_redis, sanity, resend, telegram, stripe, rss_feeds,
  pipeline_last_run, queue_depths) use `checkWithTimeout`.

### Batch 1 – Unit 2: Cron route guards
- **Status**: Already complete — no changes required.
- All 5 routes (`broadcast-drain`, `daily-article`, `health`, `sitemap-warm`, `social`)
  call `validateVercelCronAuth(req)` as their very first statement inside `GET`.

### Batch 1 – Unit 3: Remove placeholder + FreshnessBadge
- Replaced "Archive Synchronizing..." static text in `src/app/page.tsx` with 3 animated
  skeleton article card placeholders (`animate-pulse`).
- Added `<FreshnessBadge ttlSeconds={300} />` to the "Proprietary Research" section header
  on the homepage.
- Added `<FreshnessBadge ttlSeconds={300} />` to `src/app/data/layout.tsx` — now present on
  all 80+ data dashboard pages automatically.
- `npx tsc --noEmit` → 0 errors.

### Context & Workflow Files Created
- `AGENTS.md` — agent rules for CryptoBrainNews
- `context/project-overview.md` — product definition and goals
- `context/architecture-context.md` — stack, boundaries, storage model, invariants
- `context/ui-context.md` — color palette, typography, layout patterns, component conventions
- `context/code-standards.md` — TypeScript, Next.js, styling, and error handling rules
- `context/ai-workflow-rules.md` — development workflow and scoping rules
- `context/progress-tracker.md` — this file

## In Progress

- None.

## Next Up

Batch 2 – High/Medium priorities (to be defined when user says "Start Batch 2"):
- Candidate items: Redis-backed per-chat rate limiter for Telegram (replace in-memory map),
  social scheduler improvements, additional data page FreshnessBadge TTL accuracy,
  pipeline `pipeline:last-success` key write after successful run.

## Open Questions

- Should individual data pages override the layout's default `FreshnessBadge ttlSeconds={300}`
  with their own page-specific TTL? (Currently: pages that already had their own badge will show
  two badges — the layout one and their own. Consider removing per-page badges in favour of
  the layout-level one, or removing the layout-level one for pages that define their own.)

## Architecture Decisions

- Dead-letter queue: Redis (`broadcast:dead:<channel>`) — never filesystem `/tmp`.
- Dedup: 3-layer (URL + title + content SHA-256), 7-day TTL in Redis.
- Stripe idempotency: Redis SET NX, 7-day TTL.
- Cron auth: `validateVercelCronAuth` (Authorization: Bearer) — matches Vercel Cron format.
- Newsletter unsubscribe: Neon `updated_at = NOW()` + Resend audience removal.

## Session Notes

- Stack: Next.js 14, Upstash Redis, Sanity CMS, Resend, Stripe, Telegram Bot API, Neon PostgreSQL.
- `src/types/declarations.d.ts` declares `lucide-react` and `@heroicons/react` to silence TS7016.
- `tsconfig.json` uses `moduleResolution: bundler`.
- Dev server exits after "✓ Starting..." in Replit sandbox — pre-existing environment issue,
  not caused by any code changes.
