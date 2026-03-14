 

```markdown
# CLAUDE.md – CryptoBrainNews Project Rules

## 1. Project Identity
- **Platform:** Institutional‑grade crypto intelligence terminal.
- **Live URL:** [https://cryptobrainnews.vercel.app](https://cryptobrainnews.vercel.app)
- **Core Mission:** Serve both humans (UI) and AI agents (APIs) with real‑time, accurate on‑chain and market data.
- **Critical Constraints:**
  - No mock data – every number must come from a live, verified API (CoinGecko, DefiLlama, Dune, L2Beat, Binance, etc.).
  - Aggressive caching to respect API rate limits (use `cached` utility with Upstash Redis).
  - Handle precision correctly (use `BigInt` for raw balances, `Intl.NumberFormat` for display).
  - Never crash the UI if an API fails – show graceful placeholders (e.g., "—", "N/A").

## 2. Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + custom design system (`design_system.md`)
- **Database:** Neon PostgreSQL (for agent logs, referrals, playbooks)
- **Caching:** Upstash Redis via `src/lib/cache.ts`
- **Data Fetching:** Edge‑compatible with `cached` wrapper; use `fetch` with `next: { revalidate }` only in Server Components.

## 3. Architectural Rules
- **Server Components by default** – data fetching happens in `async` pages/components; Client Components only for interactivity.
- **Separate data fetching from UI** – keep API wrappers in `src/lib/` (e.g., `coingecko.ts`, `defillama.ts`, `dune.ts`).
- **Reuse existing UI components** – `DataTable`, `BlockChartCard`, `GaugeCard`, `MetricCard`, `DataSidebar`.
- **Time‑frame toggles** – implement a reusable `TimeframeSelector` component that can be attached to charts.
- **No premium gating** – all data pages must be fully accessible; remove any `AlphaGate` components.

## 4. TypeScript & Data Integrity
- **No `any`.** Define strict interfaces for all API responses (e.g., `interface CoinGeckoPrice { bitcoin: { usd: number } }`).
- **Use Zod** for runtime validation of unpredictable external API responses (optional but recommended).
- **Extend `src/lib/types.ts`** with new interfaces as you build new sections.

## 5. Data Fetching & Caching (CRITICAL)
- **Always use the `cached` utility** – it wraps Redis and in‑memory fallback. Example:
  ```ts
  export async function getStablecoins() {
    return cached('defi:stablecoins', async () => {
      const res = await fetch('https://stablecoins.llama.fi/stablecoins?includePrices=true');
      // ... transform and return
    }, 3600); // TTL in seconds
  }
  ```
- **Set appropriate TTLs:**
  - Prices / funding rates: 5 minutes
  - TVL, volume, OI: 1 hour
  - Dune queries: 12‑24 hours
  - Static lists (companies, categories): 1 day
- **Error handling:** Every fetcher must return an empty array/object on failure, never throw.

## 6. UI & Design System
- **Colors:** `#050505` (bg), `#0a0a0a` (card), `#1a1a1a` (border), `#FABF2C` (gold accent), `#00d672` (success), `#ff4757` (error).
- **Typography:** `font-sans` for headings, `font-mono` for data. Use `tabular-nums`.
- **Tables:** alternating row colors (`even:bg-[#080808] odd:bg-[#050505]`) and sticky headers.
- **Charts:** use `BlockChartCard` for most visualizations; extend with `composed` type for dual‑axis.

## 7. Code Delivery Format
- **All changes must be provided as `cat` commands** that can be copy‑pasted and executed directly in the terminal.
- **Ledgers must be updated in append‑only mode** (`task.md`, `implementation-plan.md`).
- **Wait for explicit approval after each phase.**

## 8. Crypto‑Specific Conventions
- **Decimals:** Never truncate prices below $1.00 (e.g., SHIB should show `$0.00001234`, not `$0.00`).
- **Large numbers:** Use `Intl.NumberFormat` with appropriate suffixes (B, M, K) for market caps and volumes.
- **API keys:** Never hardcode; always read from `process.env`. Add new variables to `.env.example`.
- **WebSockets:** If implementing live tickers, manage connections in `useEffect` with proper cleanup.

## 9. Agentic Commands (for Claude)
- **Build verification:** Always run `npm run build` and report any errors before asking for approval.
- **Linting:** Run `npm run lint` and fix warnings.
- **Testing:** If you add unit tests, run `npm test`.

## 10. Phase Reference (from `upgrade-data.md`)
- **Phase 37:** Foundation & Cleanup (remove premium gates, update sidebar, create placeholders).
- **Phase 38:** Core Markets (Spot, Futures, Options, Indices, COTs, Prices).
- **Phase 39:** ETFs & Treasuries.
- **Phase 40:** On‑Chain Metrics.
- **Phase 41:** Scaling Solutions.
- **Phase 42:** DeFi (all subsections).
- **Phase 43:** NFTs & Alternative Metrics.
- **Phase 44:** Final Polish & Testing.

**Always begin each phase by reviewing the attached `upgrade-data.md` and `metrics.txt`.**
```

---

 