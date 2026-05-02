# Architecture Context

## Stack

| Layer             | Technology                        | Role                                               |
| ----------------- | --------------------------------- | -------------------------------------------------- |
| Framework         | Next.js 14 + TypeScript strict    | Full-stack App Router; server components first     |
| UI                | Tailwind CSS + custom design tokens | Component composition and styling                |
| CMS               | Sanity (hosted)                   | Article storage and retrieval                      |
| Cache / Queues    | Upstash Redis                     | Dedup keys, broadcast queues, subscription cache   |
| Newsletter DB     | Neon (PostgreSQL via `pg`)        | Subscriber list, unsubscribe timestamps            |
| Email             | Resend                            | Newsletter delivery and audience management        |
| Payments          | Stripe                            | Subscription checkout, portal, webhook             |
| Messaging         | Telegram Bot API                  | Article broadcast to channel                       |
| AI – Summarise    | xAI Grok                          | First-stage headline + summary extraction          |
| AI – Enrich       | DeepSeek                          | Body expansion, tags, category, sentiment          |
| AI – Polish       | Google Gemini                     | SEO title, meta description, final Markdown body   |
| Deployment        | Vercel                            | Serverless functions, cron jobs, edge network      |

## System Boundaries

- `src/app/api/` — Thin route handlers: auth guard → parse → call lib → respond. No business logic.
- `src/app/api/cron/` — Cron-protected endpoints: `validateVercelCronAuth` must be the first call.
- `src/lib/` — All business logic, external API clients, and shared utilities.
- `src/lib/news/` — Pipeline-specific modules: dedup, broadcast queue, telegram, newsletter, types.
- `src/lib/ops/` — Ops utilities: cron guard, env audit, alerts.
- `src/lib/monetisation/` — Stripe and subscription logic.
- `scripts/` — Long-running pipeline scripts invoked from the daily-article cron route.
- `src/app/data/` — Data dashboard pages, all server components unless interactivity required.
- `src/components/` — UI components only; no business logic.

## Storage Model

- **Upstash Redis**: dedup keys (`dedup:url:*`, `dedup:title:*`, `dedup:content:*`, 7-day TTL),
  broadcast retry/dead queues (`broadcast:retry:*`, `broadcast:dead:*`),
  subscription cache (`sub:<userId>`), Stripe idempotency keys (`stripe:event:<id>`),
  pipeline last-run key (`pipeline:last-success`), social scheduler queues.
- **Sanity**: published articles (type `post`), retrieved via GROQ queries.
- **Neon PostgreSQL**: newsletter subscriber table (email, status, subscribed_at, updated_at).
- **Vercel KV / env**: no persistent file storage; dead-letter goes to Redis, never `/tmp`.

## Pipeline Flow

```
RSS fetch → 3-layer dedup check → Grok summarise → DeepSeek enrich (optional)
         → Gemini polish (optional) → Sanity write → markSeen (dedup)
         → Telegram broadcast → Newsletter send
```

Each optional AI stage catches its own errors and degrades gracefully; the pipeline continues
with available output. Fatal errors dead-letter the job to Redis and return `{ published: false }`.

## Auth Model

- Cron routes: `Authorization: Bearer <CRON_SECRET>` validated by `validateVercelCronAuth`.
- Stripe webhooks: `stripe.webhooks.constructEvent` with `STRIPE_WEBHOOK_SECRET`.
- Newsletter unsubscribe: no auth — email param verified against Neon DB before any mutation.
- Public API routes: no auth (data dashboards use server-side data fetching with API keys).

## Invariants

1. Cron route handlers call `validateVercelCronAuth(req)` as their **very first statement**.
2. Dead-letter writes go to Redis (`broadcast:dead:<channel>`), never to the filesystem.
3. `import 'server-only'` is present in every `src/lib/` module that touches secrets or Redis.
4. No `any` in TypeScript; all external API shapes validated at runtime via type guards.
5. AI pipeline stages are individually try/caught; the pipeline never crashes on a single stage.
6. Stripe webhook handler is idempotent — duplicate events are skipped via Redis SET NX.
7. Newsletter unsubscribes record a timestamp (`updated_at = NOW()`) and remove the contact
   from the Resend audience, satisfying GDPR right-to-erasure requirements.
8. No `@supabase/*` imports anywhere in the codebase.
