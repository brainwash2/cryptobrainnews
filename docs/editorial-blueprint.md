
# CryptoBrainNews — Editorial & Business Blueprint
*For founders, editors, and contributing partners*

---

## Part 1 — Inviting Your Partner to Sanity Studio

### Step 1 — Invite via Sanity Manage
```
1. Go to https://sanity.io/manage
2. Select your CryptoBrainNews project
3. Click "Members" tab → "+ Add members"
4. Enter your partner's email
5. Assign role: "Editor" (recommended — can create/edit, cannot delete or change schema)
6. They receive an email invite → they click accept → they need a free Sanity account
7. After accepting, they visit: https://cryptobrainnews.vercel.app/studio
```

### Step 2 — Role Guide

| Role | What they can do | Who gets it |
|---|---|---|
| **Administrator** | Everything including schema, API tokens, billing | You only |
| **Editor** | Create, edit, publish all document types | Your partner, trusted writers |
| **Contributor** | Create and edit drafts only — cannot publish | Freelancers, guest writers |
| **Viewer** | Read-only | Advertisers reviewing content before sponsorship |

> **Important:** The free Sanity plan includes 2 non-admin users. For 3+ editors, upgrade to Growth ($15/seat/month).

### Step 3 — Create an Author profile for your partner
In Sanity Studio → Author → New:
- Name, slug, bio, avatar, Twitter handle, role: "Co-Founder & Editor"
- This links their byline to their author page automatically

---

## Part 2 — Editorial Workflow (Day-to-Day)

### Article lifecycle

```
IDEA → DRAFT → REVIEW → PUBLISHED → PROMOTED
```

**Step-by-step:**

1. **New idea** → Create post in Studio, set status: `draft`, assign to Author
2. **Write** → Body in Studio rich text editor, fill excerpt (180 chars), add tags
3. **SEO check** → Fill SEO tab: meta title (≤70 chars), meta description (≤160 chars)
4. **Image** → Upload 1200×630px hero image with alt text (required for OG sharing)
5. **Review** → Partner reads the draft in Studio (real-time collaboration — both can edit simultaneously)
6. **Publish** → Change status to `published`, confirm publishedAt date → click Publish
7. **Live in 60 seconds** → ISR cache expires, article appears on site
8. **Promote** → Share link on Twitter/X, Telegram, newsletter

### Content calendar suggestion (starting out)

| Day | Content type | Category | Who |
|---|---|---|---|
| Monday | Market weekly recap | market | You or Partner |
| Wednesday | Deep-dive analysis | research / rwa / ai-crypto | You |
| Friday | Alpha Call | Alpha Call | You |
| Daily | News commentary (short) | Any | Either |

### Writing checklist for every article

```
✅ Title: clear, uppercase, ≤80 chars
✅ Excerpt: 1-2 sentences, compelling, ≤180 chars
✅ Author: assigned (not blank)
✅ Category: selected from dropdown
✅ Tags: 3-8 relevant tags (hyphenated lowercase: "eigenlayer", "bitcoin-etf")
✅ Hero image: 1200×630px, alt text filled
✅ SEO meta description: ≤160 chars, includes primary keyword
✅ Body: at least 300 words for editorial; wire commentary can be shorter
✅ Sources: linked inline for any data claims
✅ Status: published (not left as draft)
```

---

## Part 3 — What Category to Focus on Right Now

Based on March 2026 research, here's where the audience is:

**Priority 1 — RWA (Real-World Assets)**
Tokenized real-world assets have reached $36 billion onchain and are expected to reach at least $50 billion by 2026 year-end. This is the #1 institutional narrative. Every major asset manager is entering this space. Write about: BlackRock BUIDL, Ondo Finance, tokenized T-bills, Centrifuge.

**Priority 2 — AI × Crypto**
The x402 protocol emerged as a decentralized payment standard designed specifically for autonomous AI agents, with rapid adoption by Google Cloud, AWS, and Anthropic. Write about: Bittensor, Fetch.ai, agent-to-agent payments, DePAI protocols.

**Priority 3 — Institutional**
JPMorgan plans to accept Bitcoin and Ether as collateral, and SoFi became the first US chartered bank to offer direct digital asset trading from customer accounts. Write about: Solana ETF filings, corporate treasury adoption, bank crypto integration.

**Priority 4 — Stablecoins**
Stablecoins found product-market fit and hit the mainstream, with TradFi institutions embracing them at a whole new level — tokenized deposits, tokenized treasuries, and onchain bonds allow banks and fintechs to build new products.

**Skip for now:** NFTs, memecoin speculation — low institutional interest in March 2026.

---

## Part 4 — Role Split with Your Partner

Given you're the technical founder and they're the editorial partner, here's the recommended split:

**You (Technical Founder):**
- Site infrastructure and deployments
- Data pages and onchain integrations
- Monetisation (newsletter, ads, API access)
- Schema changes (you're the only Administrator)
- Business development and partnerships

**Your Partner (Editorial Lead):**
- Daily/weekly article publishing
- Editorial calendar ownership
- Category strategy
- Source relationships (protocol teams, researchers)
- Social media distribution

**Shared:**
- Alpha Calls (your best content — requires both conviction)
- Fact-checking each other's technical claims
- Sponsor outreach

---

## Part 5 — First 30 Days Content Plan

### Week 1 — Foundation
- [ ] Create Author profiles for both of you in Studio
- [ ] Publish 2 "About us" style articles: who we are, our methodology
- [ ] Publish 1 RWA explainer: "What is RWA tokenization and why does it matter in 2026?"
- [ ] Publish 1 AI×Crypto explainer: "x402: The payment rail for AI agents"

### Week 2 — Market coverage
- [ ] Weekly market recap (Monday)
- [ ] Deep-dive on one institutional story (e.g., Solana ETF filing status)
- [ ] 1 Alpha Call (your conviction play)
- [ ] Interview format: reach out to 1 protocol team for a comment

### Week 3 — SEO content
- [ ] "Best RWA protocols 2026" — high search volume, long-form
- [ ] "EigenLayer vs EtherFi: restaking comparison"
- [ ] "Bitcoin L2s explained: Stacks, Lightning, Rootstock"

### Week 4 — Distribution
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Twitter/X account @CryptoBrainNews
- [ ] Set up Telegram channel (auto-post new articles via bot)
- [ ] Reach out to 5 crypto newsletters to get a mention/link

---

## Part 6 — Revenue Roadmap

| Phase | Revenue stream | When | Target |
|---|---|---|---|
| Month 1-2 | Affiliate links (MEXC, Bybit) | Now | $200-500/month |
| Month 2-3 | Newsletter sponsorships | 500+ subscribers | $200-500/issue |
| Month 3-6 | Sponsored articles | Domain authority growing | $500-2000/article |
| Month 6+ | API access tier | After data pages live | $99-499/month |
| Month 6+ | "The Cartel" subscriptions | After content authority | $29-99/month |

---

## Part 7 — Technical Next Steps (for you)

After the current build is stable, in priority order:

1. **Telegram bot** — auto-post published articles to your Telegram channel (Vercel webhook → Telegram Bot API, ~2 hours)
2. **Google Search Console** — verify domain, submit sitemap.xml, monitor impressions
3. **Onchain data widgets** — embed live DeFiLlama TVL for RWA on the RWA category page
4. **Glassnode free tier** — BTC MVRV ratio widget on homepage (institutional signal)
5. **MCP server** — expose `/api/mcp/news` so AI agents (Claude, GPT) can query your articles as a tool — this is your moat against competitors
