# 🧠 CRYPTOBRAINNEWS - PROJECT DOCUMENTATION

## 1. IDENTITY & VISION
- **Name:** CryptoBrainNews
- **Mission:** Institutional-grade crypto intelligence terminal.
- **Visual Identity:** "The Block" (Data Density) x "Cointelegraph" (Media Layout).
- **Colors:** Black (#000000) background, Electric Yellow (#FABF2C) accent.

## 2. TECH STACK (Production)
- **Framework:** Next.js 16 (App Router / Turbopack).
- **Deployment:** Vercel (Production Live).
- **Styling:** Tailwind CSS + Shadcn/UI (Customized).
- **Icons:** Lucide React / Heroicons.
- **Charts:** Recharts.
- **Backend:** Supabase (Auth & Database).
- **Auth:** Supabase Magic Link (OTP) via Resend.

## 3. DATA STRATEGY (Critical Architecture)
- **CoinGecko:** Fetched **Client-Side** in `PriceTicker` and `PriceIndexes` to bypass Cloud Firewalls (Error 429/403).
- **DefiLlama:** Fetched **Server-Side** (or Client fallback) for TVL/Volume.
- **CryptoCompare:** News feed aggregation.
- **Fallback System:** `src/lib/api.ts` contains `FALLBACK_MARKET_DATA` to ensure the UI never crashes even if APIs fail.

## 4. CURRENT FOLDER STRUCTURE
src/
├── app/
│   ├── layout.tsx              # Global Shell (Header + Ticker)
│   ├── page.tsx                # Root (Renders Homepage)
│   ├── homepage/               # News Grid & Hero
│   ├── price-indexes/          # Crypto Table + Highlights
│   ├── news/                   # Internal Article Reader ([id])
│   ├── markets-overview/       # (Legacy) Market Data
│   ├── de-fi-analytics/        # (Legacy) DeFi Dashboard
│   ├── data/                   # **NEW** "The Block" Terminal Structure
│   │   ├── layout.tsx          # Sidebar Layout
│   │   ├── _components/        # DataSidebar, DataBreadcrumb
│   │   └── page.tsx            # Redirects
│   └── go-alpha/               # Paywall Landing Page
├── components/
│   ├── auth/                   # AuthButton, AlphaGate
│   ├── common/                 # Header, Footer, PriceTicker
│   └── ui/                     # Atoms
└── lib/
    ├── api.ts                  # Central Data Fetcher (Hybrid)
    ├── supabase-client.ts      # Auth Client
    └── categories.ts           # Taxonomy

## 5. RECENT COMPLETED MILESTONES
- [x] **Authentication:** Login via Email OTP works.
- [x] **Monetization:** `AlphaGate` component successfully locks content.
- [x] **Internal News:** Articles open internally at `/news/[id]`.
- [x] **Navigation:** Mega-menu header implemented.
- [x] **Terminal UI:** `DataSidebar` and `DataLayout` created (The Block style).

## 6. ACTIVE SPRINT: "The Block" Migration
We are currently refactoring the "Island" pages (`markets-overview`, `de-fi-analytics`) into the unified `/data/` route structure recommended by the Claude 4.6 Audit.
