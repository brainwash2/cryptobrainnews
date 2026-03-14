---
description: Fetch live crypto data from CoinGecko, DefiLlama, and Binance.
---

# Crypto Data Fetcher Skill

Use this skill whenever the user asks for token prices, market data, DeFi metrics, or on‑chain stats.

## Capabilities
- **Token Price & Market Data:** Fetch current price, market cap, volume, and price changes from CoinGecko.
- **DeFi Metrics (TVL, Fees, Revenue):** Retrieve protocol‑level data from DefiLlama.
- **Derivatives (Funding Rates, Open Interest):** Get live funding rates from Binance and OI from DefiLlama.
- **L2 Scaling Data:** Fetch L2 TVL and activity from DefiLlama chains endpoint.
- **Error Handling & Caching:** Always use the project's `cached` utility and return empty arrays on failure.

## Implementation Guidelines
- Use the existing fetchers in `src/lib/` whenever possible.
- For new endpoints, add a function in the appropriate library (e.g., `coingecko.ts`) and wrap it with `cached`.
- Respect rate limits: CoinGecko free tier = 30 calls/minute. Cache aggressively.
- Never hardcode API keys; read from `process.env`.
- Format numbers using the project's formatters (see `src/lib/formatters.ts` if exists, or use `Intl.NumberFormat`).
