# CryptoBrainNews — Project Overview

## Overview

CryptoBrainNews is an institutional-grade crypto intelligence terminal. It aggregates news from
RSS feeds, enriches each article through a multi-stage AI pipeline (Grok → DeepSeek → Gemini),
publishes to Sanity CMS, and distributes via Telegram broadcast and email newsletter. It also
surfaces live market data, DeFi analytics, on-chain metrics, ETF flows, and alternative data
from a wide range of third-party APIs.

## Goals

1. Automatically ingest, deduplicate, and AI-enrich crypto news daily.
2. Present institutional-quality data dashboards across markets, DeFi, on-chain, ETFs, and more.
3. Distribute curated intelligence to subscribers via Telegram and email newsletter.
4. Monetise via Stripe subscription (Free / Pro tiers).
5. Maintain a robust, observable ops pipeline with health checks, dead-letter queuing, and alerts.

## Core User Flow

1. Daily cron triggers the news pipeline.
2. RSS feeds are fetched and deduplicated (3-layer: URL, title, content-snippet).
3. Each fresh article passes through Grok summarisation → DeepSeek enrichment → Gemini polish.
4. Finished article is written to Sanity CMS and broadcast to Telegram + newsletter subscribers.
5. Visitors browse the homepage, data dashboards, and individual news articles.
6. Pro subscribers access premium features after Stripe checkout.

## Features

### News Pipeline
- RSS ingestion from configurable feed list.
- 3-layer Redis dedup (SHA-256 of normalised URL, title, content snippet).
- Grok summarisation, DeepSeek enrichment, Gemini polish — each stage degrades gracefully on failure.
- Dead-letter queue (Redis) for failed Telegram/newsletter broadcasts with retry drain cron.

### Data Dashboards
- Markets: spot prices, futures, liquidations, options, volumes, CME COT, indices.
- DeFi: TVL, DEX volume, lending, stablecoins, revenue, RWA, yields, token unlocks.
- On-chain: Bitcoin, Ethereum, Solana, Avalanche, Aptos, gas, flows.
- ETFs: Bitcoin, Ethereum, Solana, XRP — daily flows and AUM.
- Alternative data: social, funding, politics, web traffic, app usage.
- NFTs, scaling (L2/ZK/optimistic), governance, exchanges, treasuries.

### Broadcast & Newsletter
- Telegram: per-chat rate limiting, Retry-After on 429, Redis dead-letter queue.
- Email: Resend + Neon PostgreSQL subscriber list; GDPR-compliant unsubscribe (no login required).

### Monetisation
- Stripe subscription (Pro monthly / Pro yearly) with 7-day free trial.
- Idempotent webhook handling via Redis SET NX.
- Subscription state cached in Redis.

### Ops & Observability
- `/api/health` endpoint checking Redis, Sanity, Resend, Telegram, Stripe, RSS, pipeline last-run.
- OpsAlerter sends Telegram alerts on pipeline failure or health degradation.
- All 5 cron routes protected by `validateVercelCronAuth`.
- `env-audit.ts` checks required env vars at startup.

## Scope

### In Scope
- News pipeline (RSS → AI → Sanity → broadcast)
- All data dashboard pages
- Telegram broadcast + email newsletter
- Stripe subscription + Stripe webhook
- Health/ops monitoring
- SEO (metadata, schema markup, geo-enhancer)

### Out of Scope
- Real-time collaborative editing
- User-uploaded content
- Mobile native apps
- Versioned article history

## Success Criteria
1. Daily pipeline runs without fatal errors and publishes at least 5 articles.
2. All data dashboards render without JS errors or blank states.
3. Health endpoint reports `healthy` when all services are configured and reachable.
4. Stripe checkout and webhook flow end-to-end without duplicate processing.
5. Unsubscribe link removes subscriber from Resend audience without requiring login.
