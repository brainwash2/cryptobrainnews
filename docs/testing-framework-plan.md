# Testing Framework Plan (Future)

After the data terminal and news pipeline refactors are fully done, we will research, design, and implement a comprehensive testing framework covering both sections.

## Scope
- Data section: component rendering tests (Recharts, tables, sidebars), API mock/data‑fetcher tests, snapshot tests for every page, CI integration.
- News pipeline: RSS parsing, Groq/DeepSeek/Gemini/Stripe/Sanity integration tests, dead‑letter queue tests, cron‑job smoke tests.

## Research to be done
- Evaluate testing libraries (Jest, React Testing Library, Playwright, Vitest) for Next.js 16 + Turbopack.
- Design a test‑runner strategy that works with Vercel serverless and local dev.
- Prioritise a phased rollout: smoke tests → integration tests → unit tests → visual regression tests.

**Do NOT implement this now. It is a future task to be researched and planned once all data and pipeline work is signed off.**
