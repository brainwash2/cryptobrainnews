# CryptoBrainNews Task Ledger

## Part 1 – Pipeline Reliability Refactor
### Run ID: part-1-reliability — $(date -u +"%Y-%m-%dT%H:%M:%SZ")

- [x] src/lib/news/types.ts — strict TypeScript types, runtime type guards, zero `any`
- [x] src/lib/news/dedup.ts — Redis-backed dedup with URL normalisation, title hash, bulk check
- [x] src/lib/news/pipeline-logger.ts — structured JSON-lines logger with severity tracking
- [x] scripts/daily-article.ts — graceful failure per stage (Grok fatal, DeepSeek/Gemini degraded), exponential backoff retry, dead-letter writer, Sanity idempotency pre-check

### Review
- Grok failure → dead-letter JSON written, article skipped, run continues
- DeepSeek/Gemini failure → degraded output used, article still published
- Sanity write failure → 3× retry with backoff, then dead-letter
- Telegram failure → warn logged, never blocks publish
- Dedup fires BEFORE any AI calls (cost control) and markSeen fires ONLY after Sanity confirm (correctness)
- All API shapes validated by runtime guards (isGrokSummary, etc.) — JSON.parse never returns `any`

## Part 2 – RSS Caching, Stampede Guard, Broadcast Dead-Letter
### Run ID: part-2-broadcast-cache — $(date -u +"%Y-%m-%dT%H:%M:%SZ")

- [x] src/lib/news/rss-cache.ts  — 1-hr TTL, Redis lock stampede guard, stale-while-revalidate, per-feed isolation, bulk getAllItems() with cross-feed dedup
- [x] src/lib/news/broadcast-queue.ts — channel-agnostic dead-letter queue, MAX_RETRIES=4, inflight lock prevents double-send, peekDeadLetters() for dashboard
- [x] src/lib/news/telegram.ts   — rate-limit (429) handling with Retry-After, HTML escaping, message chunking >4096 chars, auto dead-letter on failure
- [x] src/lib/news/newsletter.ts — Resend batch sends (90/batch), idempotency keys, unsubscribe headers, dead-letter on batch failure, retry drain

### Review
- RSS stampede: SET NX lock (30 s TTL) means only one worker re-fetches; others serve stale immediately
- Stale fallback: 24-hr stale key ensures a down feed never returns zero items mid-run
- Broadcast retries: queue is drained at end of every pipeline run AND can be wired to a separate cron
- Dead-letter inspection: peekDeadLetters() can be called from /api/admin/dead-letters for ops visibility
- Idempotency: Resend idempotency key = `{slug}-batch-{n}` prevents duplicate emails on retry
- Telegram 1 msg/s limit: INTER_MESSAGE_DELAY_MS=1050 enforced between chunks

## Part 3 – Sanity N+1 Audit, Edge Caching, OG Images
### Run ID: part-3-sanity-cache-og — $(date -u +"%Y-%m-%dT%H:%M:%SZ")

- [x] src/lib/news/sanity-client.ts     — readClient (CDN, no token) / writeClient (API, token) separated; query timeout wrapper; health check
- [x] src/lib/news/sanity-queries.ts    — all GROQ uses projections; N+1 eliminated on category (author resolved inline), related articles (backref in single query), author page (articles + count in parallel Promise.all); array::unique for distinct categories; no wildcard selects
- [x] src/lib/news/page-cache.ts        — SWR semantics over Redis; TTL map per namespace; stale fallback key (TTL × 10); invalidate() for webhook use; buildKey() for deterministic cache keys
- [x] src/app/api/news/category/[slug]/route.ts — Edge runtime; 3-layer cache (Vercel CDN → Redis → Sanity CDN); DELETE handler for webhook invalidation; pagination + input validation
- [x] src/app/api/news/search/route.ts  — Edge runtime; query sanitisation (max 120 chars, stripped); Redis rate limit (60 req/min per IP); 2-min cache TTL
- [x] src/app/api/og/route.tsx          — Edge OG image generation; article / category / default templates; brand design tokens (dark bg, cyan accent, sentiment colour); 24-hr CDN cache; article metadata cached in Redis

### Review
- N+1 elimination: author, related articles, category names all resolved in same GROQ round trip
- CDN split: readClient has no token → Sanity CDN active; writeClient has token → bypasses CDN
- OG images: Vercel CDN caches by URL (slug param = unique URL = unique cached image)
- Search rate limit: 60 req/min per IP prevents scraping and Sanity quota exhaustion
- Cache invalidation: category DELETE route + cache.invalidate() wired for Sanity webhook POST → DELETE flow
- Stale fallback: every PageCache entry has a 10× TTL stale key so a Redis miss or Sanity timeout never returns a 502 to the user if any prior data exists

## Part 3 – Sanity N+1 Audit, Edge Caching, OG Images
### Run ID: part-3-sanity-cache-og — $(date -u +"%Y-%m-%dT%H:%M:%SZ")

- [x] src/lib/news/sanity-client.ts     — readClient (CDN, no token) / writeClient (API, token) separated; query timeout wrapper; health check
- [x] src/lib/news/sanity-queries.ts    — all GROQ uses projections; N+1 eliminated on category (author resolved inline), related articles (backref in single query), author page (articles + count in parallel Promise.all); array::unique for distinct categories; no wildcard selects
- [x] src/lib/news/page-cache.ts        — SWR semantics over Redis; TTL map per namespace; stale fallback key (TTL × 10); invalidate() for webhook use; buildKey() for deterministic cache keys
- [x] src/app/api/news/category/[slug]/route.ts — Edge runtime; 3-layer cache (Vercel CDN → Redis → Sanity CDN); DELETE handler for webhook invalidation; pagination + input validation
- [x] src/app/api/news/search/route.ts  — Edge runtime; query sanitisation (max 120 chars, stripped); Redis rate limit (60 req/min per IP); 2-min cache TTL
- [x] src/app/api/og/route.tsx          — Edge OG image generation; article / category / default templates; brand design tokens (dark bg, cyan accent, sentiment colour); 24-hr CDN cache; article metadata cached in Redis

### Review
- N+1 elimination: author, related articles, category names all resolved in same GROQ round trip
- CDN split: readClient has no token → Sanity CDN active; writeClient has token → bypasses CDN
- OG images: Vercel CDN caches by URL (slug param = unique URL = unique cached image)
- Search rate limit: 60 req/min per IP prevents scraping and Sanity quota exhaustion
- Cache invalidation: category DELETE route + cache.invalidate() wired for Sanity webhook POST → DELETE flow
- Stale fallback: every PageCache entry has a 10× TTL stale key so a Redis miss or Sanity timeout never returns a 502 to the user if any prior data exists
