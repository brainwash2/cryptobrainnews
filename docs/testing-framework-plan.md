# Testing Framework Plan (Future)

After the data terminal and news pipeline refactors are fully done, we will research, design, and implement a comprehensive testing framework covering both sections.

## Scope
- Data section: component rendering tests (Recharts, tables, sidebars), API mock/data‑fetcher tests, snapshot tests for every page, CI integration.
- News pipeline: RSS parsing, Groq/DeepSeek/Gemini/Stripe/Sanity integration tests, dead‑letter queue tests, cron‑job smoke tests.

## Tool Evaluation (to be finalised)
- Evaluate **Vitest** for unit/integration (native ESM, compatible with Next.js 16 + Turbopack).
- **React Testing Library** for component tests.
- **Playwright** for E2E and visual regression.
- **Percy** or **Chromatic** for visual snapshot diffs.
- **Lighthouse CI** for performance budgets in CI.

## Proposed Test Layers

| Layer | What to Test | Suggested Tools |
|-------|-------------|-----------------|
| **Unit** | Data fetchers (`dune.ts`, `defi-data.ts`), type guards, formatters | Vitest |
| **Integration** | API routes (`/api/news/search`, `/api/newsletter/subscribe`, Stripe webhook), RSS parsing, dedup logic | Vitest + MSW |
| **Component** | Chart wrappers (mounted guard, empty state, error state), table sorting, timeframe selector | React Testing Library |
| **Visual Regression** | Screenshot comparisons of key pages (spot, futures, on‑chain, news article) | Playwright + Percy/Chromatic |
| **E2E Smoke** | Pipeline end‑to‑end (RSS → Sanity), cron route authentication, unsubscribe flow | Playwright |
| **Performance** | Core Web Vitals on top 20 pages, Lighthouse CI in CI pipeline | Lighthouse CI |

## Phased Rollout
1. **Smoke tests** – health endpoints, cron route auth, basic page loads.
2. **Integration tests** – API routes, data fetchers with mocked external APIs.
3. **Unit tests** – utility functions, type guards, formatters.
4. **Visual regression tests** – screenshot comparisons of top 20 pages.
5. **Performance CI** – Lighthouse budgets enforced on every PR.

## Constraints
- Must work with Vercel serverless environment.
- Must not require paid third‑party services (all tools listed are free / open‑source).
- Must run in CI (GitHub Actions) without breaking the deployment pipeline.

**Do NOT implement this now. This is a future task to be researched and planned once all data and pipeline work is signed off.**
