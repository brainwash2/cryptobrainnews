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

## Part 4 – Sitemap, Schema Markup, E-E-A-T, GEO Optimisation
### Run ID: part-4-seo-geo — $(date -u +"%Y-%m-%dT%H:%M:%SZ")

- [x] src/app/sitemap.ts               — Dynamic Next.js sitemap; priority heuristic by article age; changefreq hourly/<7d, daily/<30d, weekly/>30d; categories + tags + authors included; ISR 1-hr revalidate
- [x] src/lib/news/seo/schema.ts       — NewsArticle, BreadcrumbList, FAQPage, Dataset, Person/ProfilePage, WebSite+SearchAction JSON-LD builders; citation backlink to source (E-E-A-T); no wildcard selects
- [x] src/lib/news/seo/metadata.ts     — Next.js 16 Metadata API helpers for article, category, search, author, homepage; og:type=article with article:published_time; search pages set robots noindex; canonical on every page type
- [x] src/lib/news/seo/geo-enhancer.ts — GEO post-processor: FAQ extraction, key-stats table, TL;DR prepend, chart embed metadata; runs after Gemini polish in daily-article.ts; fully graceful (Promise.allSettled, empty defaults on failure)
- [x] src/components/news/AuthorBio.tsx — E-E-A-T author block; credentials pills; article count; inline Person+ProfilePage JSON-LD; compact/full variants for article vs author page
- [x] src/components/news/GEOBlocks.tsx — TLDRBlock, KeyStatsTable, FAQAccordion (inline FAQPage JSON-LD), ChartEmbedWidget with SVG sparkline; all ARIA-labelled

### Review
- Sitemap priority: age-based heuristic ensures fresh articles get crawled first without manual curation
- Schema coverage: NewsArticle + BreadcrumbList on every article; FAQPage injected when faqs > 0; Dataset on data-driven articles; Person+ProfilePage on all author pages
- E-E-A-T: credentials are visible text AND structured data (hasCredential on Person schema); article count corroborates expertise; twitterUrl sameAs corroborates real identity
- GEO: TL;DR prepended to body (AI crawlers lift first block); FAQ accordion visible + JSON-LD (Google FAQ rich results + AI citation); key stats in table (structured + parseable); Dataset schema for data articles
- Search pages: robots noindex prevents duplicate content penalty from ?q= variants
- Metadata helpers: og:type=article with article:published_time on every article (required for Google News eligibility)

## Part 5 – Twitter Thread Automation, Scheduler, Stripe Pro, Affiliate Links
### Run ID: part-5-social-monetisation — $(date -u +"%Y-%m-%dT%H:%M:%SZ")

- [x] src/lib/social/twitter-thread.ts     — Thread builder (pure fn, previewable) + publisher; OAuth 1.0a via SubtleCrypto (Edge-compatible); HMAC-SHA256 signature; Redis idempotency key per slug; rate-limit 429 handling with x-rate-limit-reset; 1100ms inter-tweet delay
- [x] src/lib/social/scheduler.ts          — Redis ZSET sorted by Unix ms; nextOptimalPostTime() targets 13:00 + 20:00 UTC (peak crypto engagement); processDueJobs() with distributed SET NX lock; exponential backoff retries (2m, 4m, 8m); permanent dead-letter after 3 retries; pendingCounts() for dashboard
- [x] src/lib/monetisation/stripe.ts       — Checkout (monthly + yearly, 7-day trial), Customer Portal, webhook handler; SubscriptionStore in Redis (24hr TTL); tierFromPriceId(); mapStripeStatus(); findByCustomerId() for webhook reverse-lookup; isProOrAbove() guard for gated content
- [x] src/lib/monetisation/affiliate.ts    — Category-aware + ticker-aware partner selection; max 2 footer cards, max 1 inline CTA; FTC disclosure injected when links present; rel="nofollow noopener sponsored"; data-affiliate + data-partner attrs for analytics; Ledger/Bybit/Binance partners
- [x] src/app/api/social/twitter/route.ts  — POST schedule (optimal window) or ?now=true (immediate); GET preview (no post); CRON_SECRET auth
- [x] src/app/api/webhooks/stripe/route.ts — Raw body buffering via arrayBuffer() (required for Stripe sig verification); 400 on bad sig (stops Stripe retry), 500 on processing error (triggers Stripe retry)
- [x] src/app/api/monetisation/checkout/route.ts — Plan validation; createCheckoutSession(); returns {url}
- [x] src/app/api/monetisation/portal/route.ts   — createPortalSession(); 404 if no customer found
- [x] src/app/api/cron/social/route.ts     — Vercel Cron every minute; Bearer auth; Twitter handler wired to scheduler

### Review
- Thread idempotency: Redis hset per slug prevents double-posting on pipeline re-runs
- Scheduler lock: SET NX PROCESS_LOCK_TTL_MS=55s prevents double-processing across Vercel regions
- Stripe webhook: raw body buffered BEFORE any parsing — signature verification is correct
- Affiliate max 2 footer + 1 inline: above this Google treats affiliate-heavy pages as thin content
- Optimal post windows: 13:00 + 20:00 UTC match peak X/Twitter engagement for crypto content per social research in master prompt
- nextOptimalPostTime() always returns a future slot (min 5min buffer) — no immediate accidental publishes
