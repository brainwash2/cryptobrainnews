# CryptoBrainNews — Editorial Workflow Guide
 
## Overview
 
This guide is for journalists, editors, and content managers. It covers:
1. Writing and publishing articles via Sanity Studio
2. Using draft preview before publishing
3. Scheduling future articles
4. Using the admin dashboard
5. Importing RSS articles as drafts
 
---
 
## 1. Sanity Studio Access
 
Open Sanity Studio at `/studio` (local) or your hosted Studio URL.
 
**Login:** Use the credentials provided by the site administrator.
 
**Document types you'll use:**
- **News Article** (`post`) — editorial articles
- **Author** — author profiles
- **Glossary Term** — terms that appear as tooltips in articles
 
---
 
## 2. Writing an Article
 
1. In Studio sidebar, click **News Article → New Article**
2. Fill in:
   - **Title** — headline (also auto-generates the slug)
   - **Author** — select from the author list (create one if needed)
   - **Category** — select the most relevant category
   - **Excerpt** — 1–2 sentence teaser (≤180 chars); shown on article cards and search
   - **Main Image** — upload or drag in the hero image
   - **Body** — write your article using the rich text editor
3. Fill in the **SEO** tab:
   - **Meta Title** — if different from the headline (≤70 chars)
   - **Meta Description** — compelling summary for Google (≤160 chars)
4. In the **Publishing** tab:
   - Set **Status** to `draft` while writing
   - Set **Published At** to the desired publish date/time
 
---
 
## 3. Draft Preview
 
Before publishing, preview the article on the live frontend:
 
1. In Studio, open the article you want to preview
2. Look for the **Preview** button in the top toolbar (or document actions menu)
3. This opens `https://your-domain.com/news/[slug]?draft=true`
 
> Note: Draft preview requires `SANITY_API_READ_TOKEN` set on the frontend.
> Contact your developer to enable this if the preview button is not working.
 
---
 
## 4. Publishing an Article
 
When the article is ready:
 
1. Change **Status** from `draft` → `published`
2. Confirm **Published At** is set correctly
3. Click **Publish** (the green button at the top)
 
The article will appear on the site within **60 seconds** (ISR cache TTL).
 
---
 
## 5. Scheduling Future Articles
 
To schedule an article for future publication:
 
1. Write and finish the article
2. In the **Publishing** tab, set **Scheduled Publish At** to the future date/time
3. Set **Status** to `scheduled`
4. Click **Publish** to save
 
> **Important:** Scheduled publishing is a UI convention — the article will actually
> go live when a developer (or Vercel Cron Job) changes the status to `published`.
> For automatic scheduling, ask your developer to set up the cron job described in
> `/api/admin/import-rss/route.ts`.
 
---
 
## 6. Admin Dashboard
 
Visit `/admin` to see:
- Total article count by status (published / draft / scheduled)
- Full article list with quick **Edit ↗** links back to Studio
- RSS → Sanity import tool
 
The dashboard requires `SANITY_API_TOKEN` to be set on the server.
 
---
 
## 7. RSS → Sanity Import
 
To bulk-import articles from any RSS feed as drafts:
 
```bash
curl -X POST https://your-domain.com/api/admin/import-rss \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: YOUR_ADMIN_SECRET" \
  -d '{
    "feedUrl": "https://cointelegraph.com/rss",
    "category": "market",
    "dryRun": false
  }'
```
 
**dryRun: true** — shows what would be imported without writing anything.
 
Imported articles arrive as **drafts** in Sanity Studio. An editor then reviews,
edits, and publishes each one manually.
 
---
 
## 8. Author Management
 
1. In Studio sidebar, click **Author → New Author**
2. Fill in name, bio, avatar, Twitter handle, and role
3. When writing articles, select this author from the **Author** field
 
---
 
## 9. Category Reference
 
| Category value | Appears on page |
|---|---|
| `market` | /news/category/market |
| `bitcoin` | /news/category/bitcoin |
| `ethereum` | /news/category/ethereum |
| `defi` | /news/category/defi |
| `nft` | /news/category/nft |
| `regulation` | /news/category/regulation |
| `research` | /news/category/research |
| `layer2` | /news/category/layer2 |
| `Alpha Call` | Homepage featured section |
| `Daily Analysis` | Homepage analysis section |
 
---
 
## 10. Tips
 
- **Images:** Use 16:9 ratio images, minimum 1200×630px for best OG sharing
- **Excerpts:** Always fill in — used on cards, search results, and social previews
- **SEO fields:** Fill in Meta Description for every article — it directly impacts Google CTR
- **Slugs:** Auto-generated from title. Only change manually if the title changes after publishing (coordinate with developer to add a redirect)
