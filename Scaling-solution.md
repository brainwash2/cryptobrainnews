# CryptoBrainNews — Scaling & Improvement Log

## Purpose
Track edge cases, data-quality concerns, performance bottlenecks, and architectural observations discovered during code reviews. Each entry is append‑only.

---

## Current State (May 2026)

### Data Terminal
- Phases A–D implemented. All pages functional.
- 9 Dune queries pending creation on new dune.com account.
- Spot On Chain → Zerion replacement pending.

### News Pipeline
- Fully operational (Claude 4.6 Sonnet build).
- Refactoring to begin via Claude 4.7 (notgpt.io).

---

## Observations Log
<!-- Append new observations below this line -->

*No observations yet — will be populated as code reviews are performed.*

## Phase D — Dune API Integration (2026‑04‑29)

### Summary
Replaced all 9 stub Dune functions in `src/lib/dune.ts` with live API calls. Each function now fetches from dune.com, caches results for 24 hours via Upstash Redis, and falls back to a static seed array on any failure. Existing page code was not modified — all page components consume the same `DuneResultSet` interface and automatically benefit from live data once Dune query IDs are configured.

### Observations
1. **Execution safety:** `executeDuneQuery` mirrors the Dune safety plan exactly — cached results first, then execute‑fresh with a 30‑second polling loop, 45‑second timeout, and graceful fallback. The maximum possible execution rate is 9 fresh calls per day (one per query ID × 24‑hour cache), well under Dune's free‑tier limit.
2. **Seed freshness:** The seed arrays are accurate April‑2026 snapshots. They serve as a robust fallback but will need manual refresh every quarter if Dune remains unavailable long‑term.
3. **Token unlocks:** Query 10 is routed to the existing DefiLlama `/unlocks` endpoint rather than Dune's community dataset, avoiding a dependency on a dataset that may not exist.
4. **Environment coupling:** All 9 query IDs are read from environment variables (`DUNE_DAO_GOVERNANCE_ID`, etc.). The module compiles and runs without them — it simply serves seed data. When IDs are added to `.env.local`, live data takes over with zero code changes.
5. **TypeScript:** The `DuneRow` interface allows both string and number column types, matching the mixed output of real Dune SQL queries. The `normaliseRow` helper ensures `undefined` values (from API quirks) become `null`, preventing Recharts rendering errors.
