#!/usr/bin/env node
import 'dotenv/config';
/**
 * CryptoBrainNews — Daily Article Pipeline (Groq)
 * Uses your existing GROQ_API_KEY from .env.local
 */
import { createClient } from '@sanity/client';
import { Resend } from 'resend';
import { marked } from 'marked';
import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─────────────────────────────────────────────────────────────────────────────
// ENV
// ─────────────────────────────────────────────────────────────────────────────
const {
  GROQ_API_KEY,
  SANITY_API_TOKEN,
  NEXT_PUBLIC_SANITY_PROJECT_ID,
  NEXT_PUBLIC_SANITY_DATASET = 'production',
  CRON_SECRET,
  UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN,
  RESEND_API_KEY,
  NEXT_PUBLIC_SITE_URL = 'https://cryptobrainnews.vercel.app',
} = process.env;

const BASE_URL = NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
const ROTATION_KEY = 'cbn:daily-article:last-index';
const ROTATION_FILE = path.join(__dirname, 'last-category.json');
const MIN_MARKET_CAP = 50_000_000;

if (!GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY not set in .env.local');
  process.exit(1);
}

const groq = createGroq({ apiKey: GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

// ─────────────────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────────────────

async function withRetry(fn, label, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const wait = 1000 * Math.pow(2, i);
      console.error(`[${label}] Attempt ${i + 1} failed: ${err.message}. Retrying in ${wait}ms…`);
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, wait));
    }
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

function fmt(n) {
  if (!n) return '$0';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// ROTATION (Redis + JSON fallback)
// ─────────────────────────────────────────────────────────────────────────────

async function getLastIndex() {
  if (UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN) {
    try {
      const res = await fetch(`${UPSTASH_REDIS_REST_URL}/get/${ROTATION_KEY}`, {
        headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
      });
      const { result } = await res.json();
      return result != null ? parseInt(result, 10) : -1;
    } catch (e) {
      console.warn('[Redis] GET failed, using file fallback:', e.message);
    }
  }
  try {
    const raw = await fs.readFile(ROTATION_FILE, 'utf8');
    return JSON.parse(raw).index ?? -1;
  } catch {
    return -1;
  }
}

async function setLastIndex(index) {
  if (UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN) {
    try {
      await fetch(`${UPSTASH_REDIS_REST_URL}/set/${ROTATION_KEY}/${index}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
      });
      console.log(`[Redis] Saved index ${index}`);
      return;
    } catch (e) {
      console.warn('[Redis] SET failed, using file fallback:', e.message);
    }
  }
  await fs.writeFile(ROTATION_FILE, JSON.stringify({ index, updatedAt: new Date().toISOString() }));
  console.log(`[File] Saved index ${index} to ${ROTATION_FILE}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// COINGECKO
// ─────────────────────────────────────────────────────────────────────────────

async function fetchCategories() {
  console.log('[CoinGecko] Fetching categories…');
  const res = await withRetry(
    () => fetch('https://api.coingecko.com/api/v3/coins/categories', {
      headers: { Accept: 'application/json' },
    }),
    'CoinGecko/categories'
  );
  if (!res.ok) throw new Error(`CoinGecko categories HTTP ${res.status}`);
  const all = await res.json();
  const filtered = all.filter(c => c.id !== 'all' && c.market_cap != null && c.market_cap >= MIN_MARKET_CAP);
  console.log(`[CoinGecko] ${all.length} total → ${filtered.length} after filter`);
  return filtered;
}

async function fetchCategoryMarketData(categoryId) {
  console.log(`[CoinGecko] Fetching market data for ${categoryId}`);
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=${categoryId}&order=market_cap_desc&per_page=10&sparkline=false&price_change_percentage=24h`;
  const res = await withRetry(
    () => fetch(url, { headers: { Accept: 'application/json' } }),
    'CoinGecko/markets'
  );
  if (!res.ok) throw new Error(`CoinGecko markets HTTP ${res.status}`);
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// GROQ – Generate article
// ─────────────────────────────────────────────────────────────────────────────

async function generateArticle(category, coins, categoryMeta) {
  const top5 = coins.slice(0, 5).map(c =>
    `  - ${c.name} (${c.symbol?.toUpperCase()}): $${c.current_price?.toLocaleString()} | 24h: ${c.price_change_percentage_24h?.toFixed(2)}% | MCap: ${fmt(c.market_cap)}`
  ).join('\n');

  const totalMcap = coins.reduce((s, c) => s + (c.market_cap || 0), 0);
  const totalVol = coins.reduce((s, c) => s + (c.total_volume || 0), 0);
  const today = new Date().toISOString().split('T')[0];
  const categoryName = categoryMeta.name || category;

  const systemInstruction = `You are a senior crypto analyst at CryptoBrainNews, an institutional-grade crypto intelligence platform. You write rigorous, data-driven articles for sophisticated investors. You cite sources with real, clickable URLs when possible. Today is ${today}.`;

  const prompt = `
Research the "${categoryName}" crypto category for a 1000-1200 word article.

Current live market data (${today}):
Category: ${categoryName} (ID: ${category})
Total Market Cap: ${fmt(totalMcap)}
Total 24h Volume: ${fmt(totalVol)}
Top coins:
${top5}

Write the article in this exact Markdown format. Use real source URLs where you can (CoinDesk, Cointelegraph, The Block, etc.).

---
ARTICLE_START

## Hook
[1-2 compelling sentences about the most significant recent development]

## What is ${categoryName}?
[2-3 paragraphs explaining the category, its significance, how it works]

## Key Developments
[3-4 paragraphs covering the 3 most important recent developments. Include citation links.]

## Key Players & Market Size
[2 paragraphs. Mention top 3-5 projects by name with market cap data. Link to CoinGecko or project websites.]

## Institutional Adoption
[2 paragraphs covering banks, funds, or enterprises entering this space]

## Challenges & Risks
[2 paragraphs on realistic risks: regulatory, technical, market]

## 2026 Outlook
[2 paragraphs with forward-looking analysis]

## Conclusion
[1 paragraph summary]

ARTICLE_END

After the article, output exactly:

META_START
TITLE: [compelling headline, 60-70 chars]
EXCERPT: [1 sentence, max 180 chars]
META_TITLE: [SEO title, max 70 chars]
META_DESCRIPTION: [SEO description, max 160 chars]
TWITTER_1: [Tweet 1 of 3, include emoji and #CryptoBrainNews]
TWITTER_2: [Tweet 2 of 3]
TWITTER_3: [Tweet 3 of 3, include {ARTICLE_URL} placeholder]
TAGS: [comma-separated, 4-8 lowercase-hyphenated tags]
META_END
`;

  console.log('[Groq] Generating article (30-60s)…');
  const { text } = await withRetry(
    () => generateText({ model: groq(MODEL), prompt, system: systemInstruction, maxTokens: 4096, temperature: 0.7 }),
    'Groq'
  );
  return { raw: text, categoryName };
}

function parseGroqOutput(raw, category) {
  const articleMatch = raw.match(/ARTICLE_START\s*([\s\S]*?)\s*ARTICLE_END/);
  const markdownBody = articleMatch ? articleMatch[1].trim() : raw.split('META_START')[0].trim();

  const metaMatch = raw.match(/META_START\s*([\s\S]*?)\s*META_END/);
  const metaBlock = metaMatch ? metaMatch[1] : '';

  function extractMeta(key) {
    const match = metaBlock.match(new RegExp(`^${key}:\\s*(.+)`, 'm'));
    return match ? match[1].trim() : '';
  }

  const title = extractMeta('TITLE') || `${category} Market Analysis — ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  const excerpt = extractMeta('EXCERPT').slice(0, 180);
  const metaTitle = extractMeta('META_TITLE').slice(0, 70);
  const metaDescription = extractMeta('META_DESCRIPTION').slice(0, 160);
  const twitter1 = extractMeta('TWITTER_1');
  const twitter2 = extractMeta('TWITTER_2');
  const twitter3 = extractMeta('TWITTER_3');
  const tagsRaw = extractMeta('TAGS');
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim().toLowerCase().replace(/\s+/g, '-')).filter(Boolean) : [category.toLowerCase()];

  return { markdownBody, title, excerpt, metaTitle, metaDescription, twitter1, twitter2, twitter3, tags };
}

// ─────────────────────────────────────────────────────────────────────────────
// MARKDOWN → HTML
// ─────────────────────────────────────────────────────────────────────────────

async function markdownToHtml(markdown) {
  marked.setOptions({ gfm: true, breaks: false });
  const html = await marked.parse(markdown);
  return html;
}

// ─────────────────────────────────────────────────────────────────────────────
// SANITY
// ─────────────────────────────────────────────────────────────────────────────

function getSanityWriteClient() {
  if (!SANITY_API_TOKEN) throw new Error('SANITY_API_TOKEN not set');
  if (!NEXT_PUBLIC_SANITY_PROJECT_ID) throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID not set');
  return createClient({
    projectId: NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2024-03-04',
    useCdn: false,
    token: SANITY_API_TOKEN,
  });
}

async function checkDuplicate(sanity, title, category) {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const results = await sanity.fetch(`
    *[_type == "post" && (lower(title) == lower($title) || (category == $category && publishedAt >= $yesterday))][0] { _id, title, category, publishedAt }
  `, { title, category, yesterday });
  return results || null;
}

async function getExistingTags(sanity) {
  try {
    const result = await sanity.fetch(`array::unique(*[_type == "post" && defined(tags)] { tags }.tags[])`);
    return (result || []).filter(Boolean);
  } catch { return []; }
}

function markdownToPortableText(markdown) {
  return markdown.split(/\n\n+/).filter(Boolean).map((para, i) => ({
    _type: 'block',
    _key: `block_${i}`,
    style: para.startsWith('#') ? 'h2' : 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: `span_${i}`, text: para.replace(/^#{1,6}\s*/, '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'), marks: [] }],
  }));
}

async function publishToSanity(sanity, { title, slug, category, tags, excerpt, rawHtml, markdownBody, metaTitle, metaDescription }) {
  const doc = {
    _type: 'post',
    title,
    slug: { _type: 'slug', current: slug },
    category,
    tags,
    excerpt,
    rawHtml,
    body: markdownToPortableText(markdownBody),
    seo: { _type: 'object', metaTitle: metaTitle || title.slice(0, 70), metaDescription: metaDescription || excerpt.slice(0, 160), noIndex: false },
    publishedAt: new Date().toISOString(),
    status: 'published',
    aiGenerated: true,
  };
  console.log('[Sanity] Creating document…');
  const result = await withRetry(() => sanity.create(doc), 'Sanity/create');
  console.log(`[Sanity] Published: ${result._id}`);
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// TELEGRAM
// ─────────────────────────────────────────────────────────────────────────────

async function triggerTelegram() {
  if (!CRON_SECRET) {
    console.warn('[Telegram] CRON_SECRET not set — skipping');
    return false;
  }
  try {
    const res = await withRetry(() => fetch(`${BASE_URL}/api/telegram/broadcast`, { headers: { Authorization: `Bearer ${CRON_SECRET}` } }), 'Telegram');
    const data = await res.json();
    console.log(`[Telegram] Broadcast result: sent=${data.sent}`);
    return true;
  } catch (e) {
    console.error('[Telegram] Failed:', e.message);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RESEND EMAIL
// ─────────────────────────────────────────────────────────────────────────────

async function sendSummaryEmail({ title, articleUrl, category, categoryName, telegramSent, twitterThreads }) {
  if (!RESEND_API_KEY) return;
  const resend = new Resend(RESEND_API_KEY);
  const fromDomain = process.env.RESEND_DOMAIN || 'cryptobrainnews.com';
  try {
    await resend.emails.send({
      from: `CryptoBrainNews <no-reply@${fromDomain}>`,
      to: ['admin@cryptobrainnews.com'],
      subject: `✅ Daily Article Published: ${title}`,
      html: `<div style="background:#050505;color:#fff;padding:40px;max-width:600px;">
        <div style="border-left:3px solid #FABF2C;padding-left:20px;"><h2>${title}</h2></div>
        <p>Category: ${categoryName} (${category})<br/>Published: ${new Date().toUTCString()}<br/>Telegram: ${telegramSent ? '✓ Sent' : '✗ Failed'}<br/><a href="${articleUrl}">Read article</a></p>
        <div style="background:#0a0a0a;border:1px solid #1a1a1a;padding:16px;">
          <p>Twitter thread:</p>
          ${twitterThreads.map((t, i) => `<p>${i+1}. ${t.replace('{ARTICLE_URL}', articleUrl)}</p>`).join('')}
        </div>
      </div>`,
    });
    console.log('[Resend] Summary email sent');
  } catch (e) { console.error('[Resend] Failed:', e.message); }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═'.repeat(60));
  console.log(`CryptoBrainNews — Daily Article Pipeline (Groq)`);
  console.log(`Started: ${new Date().toUTCString()}`);
  console.log('═'.repeat(60));

  const categories = await withRetry(fetchCategories, 'CoinGecko/categories');
  if (!categories.length) throw new Error('No valid categories');

  const lastIndex = await getLastIndex();
  const nextIndex = (lastIndex + 1) % categories.length;
  const selectedCategory = categories[nextIndex];
  console.log(`[Rotation] ${lastIndex} → ${nextIndex} / ${categories.length-1}`);
  console.log(`[Category] ${selectedCategory.name} (${selectedCategory.id}) | MCap: ${fmt(selectedCategory.market_cap)}`);

  const coins = await withRetry(() => fetchCategoryMarketData(selectedCategory.id), 'CoinGecko/markets');
  if (!coins.length) { console.warn('No coins – skipping'); process.exit(0); }

  const { raw } = await generateArticle(selectedCategory.id, coins, selectedCategory);
  const parsed = parseGroqOutput(raw, selectedCategory.id);
  const { markdownBody, title, excerpt, metaTitle, metaDescription, twitter1, twitter2, twitter3, tags: generatedTags } = parsed;

  console.log(`[Article] Title: "${title}"`);
  const rawHtml = await markdownToHtml(markdownBody);

  const sanity = getSanityWriteClient();
  const slug = slugify(title);
  const duplicate = await checkDuplicate(sanity, title, selectedCategory.id);
  if (duplicate) { console.log(`[Duplicate] Skipping`); process.exit(0); }

  const existingTags = await getExistingTags(sanity);
  const mergedTags = [...new Set([...generatedTags])];
  await publishToSanity(sanity, { title, slug, category: selectedCategory.id, tags: mergedTags, excerpt, rawHtml, markdownBody, metaTitle, metaDescription });
  await setLastIndex(nextIndex);

  const articleUrl = `${BASE_URL}/news/${slug}`;
  console.log(`[Published] ${articleUrl}`);
  await new Promise(r => setTimeout(r, 3000));
  const telegramSent = await triggerTelegram();
  await sendSummaryEmail({ title, articleUrl, category: selectedCategory.id, categoryName: selectedCategory.name, telegramSent, twitterThreads: [twitter1, twitter2, twitter3].filter(Boolean) });

  console.log('═'.repeat(60));
  console.log(`✅ Pipeline complete: ${title}`);
  console.log(`   URL: ${articleUrl}`);
  console.log('═'.repeat(60));
}

main().catch(err => { console.error('💥 Pipeline failed:', err.message); process.exit(1); });
