# CryptoBrainNews — Editorial & Business Blueprint (Updated April 2026)
*For founders, editors, and contributing partners*

---

## Part 0 – Current Publishing Pipeline (4 Steps + Promotion)

We use a **4‑step pipeline** that turns a Grok research brief into a published article, followed by automatic and manual promotion.

| Step | Tool | Purpose |
|------|------|---------|
| 1 | Grok (X Premium) | Daily hot topic research brief |
| 2 | DeepSeek | First draft + metadata (category, tags, excerpt, SEO) |
| 3 | Gemini 3.1 Pro | Polish, add Key Takeaways, generate meta title/description, Twitter thread |
| 4 | DeepSeek | Sanity formatter – outputs ready‑to‑copy block |
| 5 | Sanity Studio | Publish article |
| 6 | Promotion | Telegram (auto), X/Twitter (manual thread), LinkedIn (manual), Newsletter (auto) |

**Detailed steps:**

1. **Grok** – Paste `grok_daily_research.txt` prompt → get structured research brief.
2. **DeepSeek** – Paste `deepseek_article_writer.txt` prompt + research brief → get draft + metadata.
3. **Gemini** – With system instruction (executive editor) + master prompt → polish article, add Key Takeaways, generate SEO metadata + Twitter thread.
4. **DeepSeek** – Paste `deepseek_sanity_formatter.txt` prompt + Gemini output → get Sanity‑ready block.
5. **Sanity Studio** – Copy fields (Category, Tags, Excerpt, SEO Meta Title, SEO Meta Description, Body), set Status to `published`, click Publish.
6. **Promotion:**
   - **Telegram bot** – auto‑posts within 35 minutes (or manually trigger with curl).
   - **X (Twitter)** – post the generated thread manually (3 posts with emojis).
   - **LinkedIn** – share the article with a professional note.
   - **Newsletter** – the daily brief includes the article automatically.

All master prompts are stored in `docs/`:
- `grok_daily_research.txt`
- `deepseek_article_writer.txt`
- `gemini_system_and_prompt.txt`
- `deepseek_sanity_formatter.txt`

---

## Part 1 – Inviting Your Partner to Sanity Studio

### Step 1 — Invite via Sanity Manage
1. Go to https://sanity.io/manage
2. Select your CryptoBrainNews project
3. Click “Members” tab → “+ Add members”
4. Enter your partner’s email
5. Assign role: “Editor”
6. They accept the email invite and create a free Sanity account.
7. After accepting, they visit: https://cryptobrainnews.vercel.app/studio

### Step 2 — Role Guide

| Role | What they can do | Who gets it |
|------|------------------|-------------|
| **Administrator** | Everything (schema, API tokens, billing) | You only |
| **Editor** | Create, edit, publish all documents | Your partner, trusted writers |
| **Contributor** | Create and edit drafts only – cannot publish | Freelancers, guest writers |
| **Viewer** | Read‑only | Advertisers reviewing content |

> Free Sanity plan includes 2 non‑admin users. For 3+ editors, upgrade to Growth ($15/seat/month).

### Step 3 — Create an Author Profile for Your Partner
In Sanity Studio → Author → New:
- Name, slug, bio, avatar, Twitter handle, role: “Co‑Founder & Editor”

---

## Part 2 – Editorial Workflow (Day‑to‑Day)

### Article Lifecycle
```
IDEA → RESEARCH → DRAFT → REVIEW → PUBLISH → PROMOTE
```

**Step‑by‑step:**

1. **Idea** – Use Grok to spot a trending topic.  
2. **Research** – Run the Grok research prompt to get a brief.  
3. **Draft** – Paste the research into DeepSeek (using `deepseek_article_writer.txt` prompt).  
4. **Polish** – Paste the draft into Gemini with the polishing prompt.  
5. **Format** – Paste the Gemini output into DeepSeek (Sanity formatter).  
6. **Publish** – Copy the Sanity block into Studio, set status to `published`.  
7. **Live in 60 seconds** – ISR cache expires, article appears on site.  
8. **Promote** – Telegram bot auto‑posts; post the Twitter thread manually; share on LinkedIn; newsletter includes it automatically.

### Writing Checklist (for every article)

```
✅ Title: clear, uppercase, ≤80 chars
✅ Excerpt: 1‑2 sentences, compelling, ≤180 chars
✅ Author: assigned (not blank)
✅ Category: selected from dropdown (use high‑priority categories: rwa, ai‑crypto, institutional, etc.)
✅ Tags: 3‑8 relevant tags (hyphenated lowercase: "eigenlayer", "bitcoin-etf")
✅ Hero image: 1200×630px, alt text filled
✅ SEO meta description: ≤160 chars, includes primary keyword
✅ Body: at least 300 words for editorial; wire commentary can be shorter
✅ Sources: linked inline for any data claims
✅ Status: published (not left as draft)
```

---

## Part 3 – What Category to Focus on Right Now (April 2026)

**Priority 1 — RWA (Real‑World Assets)**  
Tokenized RWA has reached $36B onchain, expected to hit $50B by end‑2026. Every major asset manager is entering this space. Write about: BlackRock BUIDL, Ondo Finance, tokenized T‑bills, Centrifuge.

**Priority 2 — AI × Crypto**  
The x402 protocol is emerging as the payment rail for AI agents, with adoption by Google Cloud, AWS, and Anthropic. Write about: Bittensor, Fetch.ai, DePAI protocols.

**Priority 3 — Institutional**  
JPMorgan plans to accept Bitcoin/Ether as collateral, SoFi became the first US bank to offer direct digital asset trading. Write about: Solana ETF filings, corporate treasury adoption, bank crypto integration.

**Priority 4 — Stablecoins**  
Stablecoins have hit mainstream with tokenized deposits and treasuries. Write about: USDC, USDT, yield‑bearing stablecoins, T‑bill products.

**Skip for now:** NFTs, memecoin speculation – low institutional interest.

---

## Part 4 – Role Split with Your Partner

**You (Technical Founder):**
- Site infrastructure, deployments
- Data pages and onchain integrations
- Monetisation (newsletter, ads, API access)
- Schema changes (Administrator)
- Business development

**Your Partner (Editorial Lead):**
- Daily/weekly article publishing
- Editorial calendar ownership
- Category strategy
- Source relationships
- Social media distribution

**Shared:**
- Alpha Calls
- Fact‑checking technical claims
- Sponsor outreach

---

## Part 5 – First 30 Days Content Plan

| Week | Tasks |
|------|-------|
| **1** | [ ] Create author profiles in Studio. [ ] Publish an RWA explainer. [ ] Publish an AI×Crypto explainer. |
| **2** | [ ] Weekly market recap. [ ] Deep‑dive on Solana ETF filing status. [ ] 1 Alpha Call. |
| **3** | [ ] “Best RWA Protocols 2026” (listicle). [ ] “EigenLayer vs EtherFi: Restaking Comparison”. [ ] “Bitcoin L2s Explained”. |
| **4** | [ ] Submit sitemap to Google Search Console. [ ] Set up X Pro columns. [ ] Reach out to 5 crypto newsletters for mentions. |

---

## Part 6 – Revenue Roadmap

| Phase | Revenue stream | When | Target |
|---|---|---|---|
| Month 1‑2 | Affiliate links | Now | $200‑500/month |
| Month 2‑3 | Newsletter sponsorships | 500+ subscribers | $200‑500/issue |
| Month 3‑6 | Sponsored articles | Domain authority growing | $500‑2000/article |
| Month 6+ | API access tier | After data pages live | $99‑499/month |
| Month 6+ | “The Cartel” subscriptions | After content authority | $29‑99/month |

---

## Part 7 – Technical Next Steps (For You)

After the first article is published, in priority order:

1. **Google Search Console** – verify domain, submit sitemap.xml.
2. **Telegram bot** – already set up; ensure it posts new articles automatically.
3. **Onchain data widgets** – embed live DeFiLlama TVL for RWA on the RWA category page.
4. **Glassnode free tier** – BTC MVRV ratio widget on homepage.
5. **MCP server** – expose `/api/mcp/news` so AI agents can query your articles.

---

**Your first article is now ready to go.** Use the pipeline above (Grok → DeepSeek → Gemini → DeepSeek formatter → Sanity). After it’s live, come back to this blueprint for the next piece.
