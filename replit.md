# CryptoBrainNews — Replit Project Notes

## Project Overview

Institutional-grade crypto intelligence terminal. Features a full AI news pipeline
(RSS → Grok → DeepSeek → Gemini → Sanity → Telegram / newsletter) and 80+ live data
dashboards covering markets, on-chain, DeFi, ETFs, stablecoins, and more.
Stripe-gated subscription model with free/pro tiers.

## Stack

- **Framework**: Next.js 14 (App Router, RSC, server actions)
- **Language**: TypeScript (strict, `moduleResolution: bundler`)
- **Styling**: Tailwind CSS — dark terminal aesthetic (`#000`/`#0a0a0a` backgrounds, `#FABF2C` gold accents)
- **CMS**: Sanity v3
- **Database**: Neon PostgreSQL (newsletter subscribers)
- **Cache / Queue**: Upstash Redis (`@upstash/redis`)
- **Auth**: Clerk
- **Payments**: Stripe (webhook idempotency via Redis SET NX)
- **Email**: Resend
- **AI pipeline**: Groq (Grok), DeepSeek, Gemini

## Key Directories

```
src/
  app/
    data/          # 80+ data dashboard pages; layout.tsx renders FreshnessBadge for all
    api/           # cron routes, health, stripe webhooks, etc.
    news/          # article detail pages
  lib/
    news/          # pipeline: dedup, telegram, newsletter, broadcast-queue, rss-cache
    market-data.ts # CoinGecko + Bybit fetchers (OI, funding rates, spot)
    defi-data.ts   # DefiLlama fetchers (TVL, stablecoins, RWA, lending)
    onchain-data.ts
    etf-data.ts
  components/
    common/FreshnessBadge.tsx  # single shared badge — data layout injects it globally
scripts/
  daily-article.ts  # CLI entrypoint for the full AI news pipeline
context/            # agent memory files (progress-tracker.md, architecture-context.md, etc.)
```

## Architecture Invariants

- **Dead-letter queue** → Redis only (`broadcast:dead:<channel>`), never `/tmp`
- **Dedup**: 3-layer SHA-256 (URL + title + content), 7-day TTL
- **Cron auth**: `validateVercelCronAuth` (Authorization: Bearer) — first line of every cron GET
- **Stripe idempotency**: Redis SET NX, 7-day TTL
- **Pipeline health**: `pipeline:last-success` key written on every clean run, read by `/api/health`
- **Telegram rate limit**: Redis `tg:ratelimit:<chatId>` SET NX PX 1050 — cross-instance safe

## Completed Work

- **Security/pipeline audit** — all 8 items verified; `description` added to all dedup call sites
- **Batch 1** — skeleton loading cards, FreshnessBadge on homepage + all data pages via layout
- **Batch 2** — deduplicated FreshnessBadge (5 pages), Telegram Redis rate limiter,
  `pipeline:last-success` write, stablecoin chain breakdown + OI KPI cards

## Dev Notes

- `npx tsc --noEmit` → 0 errors (verified after every batch)
- Dev server exits after "✓ Starting..." in Replit sandbox — pre-existing environment issue
- `src/types/declarations.d.ts` silences TS7016 for `lucide-react` and `@heroicons/react`
