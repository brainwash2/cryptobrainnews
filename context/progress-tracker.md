# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

Batch 2 – High/Medium Improvements ✅ COMPLETE

## Current Goal

Batch 3 – Next round of improvements (awaiting instruction)

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

### Batch 2 – Unit 1: Remove duplicate FreshnessBadge from 5 data pages
- Removed per-page `<FreshnessBadge>` + wrapper `<div>` from:
  - `src/app/data/defi/tvl/page.tsx` (was ttlSeconds={3600})
  - `src/app/data/etfs/bitcoin/page.tsx` (was ttlSeconds={300})
  - `src/app/data/markets/futures/page.tsx` (was ttlSeconds={300})
  - `src/app/data/markets/spot/page.tsx` (was ttlSeconds={300})
  - `src/app/data/onchain/bitcoin/page.tsx` (was ttlSeconds={1800}, custom label)
- Removed now-unused `FreshnessBadge` import from each file.
- All 80+ data pages now show exactly one badge — from `src/app/data/layout.tsx`.

### Batch 2 – Unit 2: Telegram Redis-backed rate limiter
- Replaced `const lastSendTime = new Map<string, number>()` (module-level in-memory map) with
  Redis `SET NX PX` atomic slot acquisition in `src/lib/news/telegram.ts`.
- Key pattern: `tg:ratelimit:<chatId>`, TTL = 1050 ms (INTER_MESSAGE_DELAY_MS).
- If slot is taken: reads `PTTL`, waits, then refreshes the key before calling `sendRaw`.
- Now safe across multiple concurrent Vercel serverless instances.

### Batch 2 – Unit 3: `pipeline:last-success` Redis write
- Added `Redis` import to `scripts/daily-article.ts`.
- After `run.stage = 'complete'`: writes `pipeline:last-success → run.completedAt`
  with `ex: 90000` (25 h TTL) using `Redis.fromEnv()`.
- Write failure is caught and logged via `logger.warn` — never fatal to the pipeline.
- `/api/health` `checkPipelineLastRun` now always has a key to read after a clean run.

### Batch 2 – Unit 4: Stablecoin/OI metric improvements
- `src/lib/defi-data.ts`: Added `getStablecoinsByChain()` fetching
  `https://stablecoins.llama.fi/chains` — returns top 8 chains by USD stablecoin supply,
  cached 1 hour. Exported new `StablecoinChainRow` interface.
- `src/app/data/stablecoins/usd/page.tsx`:
  - Replaced green `<span>` badge with `<FreshnessBadge ttlSeconds={3600} />`.
  - Added "Supply by Blockchain" grid section (top 8 chains, each showing $B supply + % of total).
  - Fetches chain data in parallel with stablecoin overview via `Promise.all`.
- `src/app/data/markets/futures/page.tsx`:
  - Added `fmtOI()` formatter.
  - Added current BTC, ETH, and combined OI KPI cards derived from the most recent point
    in the already-fetched `oiHistory` (Bybit BTCUSDT / ETHUSDT, 30-day window).

## In Progress

- None.

## Next Up

Batch 3 – (awaiting instruction)

## Open Questions

- None.

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
