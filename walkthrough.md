# Project Walkthrough

## Initial State Analysis (2026-03-02)
The codebase is a Next.js 16 (App Router) application serving as a financial data terminal and news aggregator. 
- **Tech Stack**: Next.js, Tailwind CSS, Supabase, AI SDK (Groq), Recharts.
- **Data Sources**: Dune Analytics SDK, DefiLlama REST APIs, CoinGecko REST APIs, RSS Feeds.
- **Identified Tech Debt**: 
  1. Heavy reliance on the `any` type in data fetchers.
  2. Client-side date rendering causing hydration mismatches.
  3. Placeholder pages lacking implementation detail.
