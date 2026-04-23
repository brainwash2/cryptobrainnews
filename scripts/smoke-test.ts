/**
 * scripts/smoke-test.ts
 * Full integration smoke test — run before any production deployment.
 * Usage: npx ts-node --esm scripts/smoke-test.ts
 *         npx ts-node --esm scripts/smoke-test.ts --skip-paid
 */

import { Redis }           from '@upstash/redis';
import { auditEnv }        from '../src/lib/ops/env-audit';
import { ArticleDedup }    from '../src/lib/news/dedup';
import { PageCache }       from '../src/lib/news/page-cache';
import { SocialScheduler } from '../src/lib/social/scheduler';
import { buildThread }     from '../src/lib/social/twitter-thread';
import { AffiliateInjector } from '../src/lib/monetisation/affiliate';
import { buildNewsArticleSchema } from '../src/lib/news/seo/schema';
import { readClient }      from '../src/lib/news/sanity-client';

const SKIP_PAID = process.argv.includes('--skip-paid');
const BASE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

interface TestResult {
  name:    string;
  passed:  boolean;
  message: string;
  ms:      number;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void> | void): Promise<void> {
  const start = Date.now();
  try {
    await fn();
    results.push({ name, passed: true,  message: 'OK', ms: Date.now() - start });
    process.stdout.write(`  ✅  ${name} (${Date.now() - start}ms)\n`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name, passed: false, message: msg, ms: Date.now() - start });
    process.stdout.write(`  ❌  ${name}: ${msg}\n`);
  }
}

async function runSmokeTests(): Promise<void> {
  process.stdout.write('\n🔍  CryptoBrainNews Smoke Test\n');
  process.stdout.write('─'.repeat(50) + '\n\n');

  await test('ENV audit — pipeline context', () => { auditEnv('pipeline'); });

  await test('Redis ping', async () => {
    const redis  = Redis.fromEnv();
    const result = await redis.ping();
    if (result !== 'PONG') throw new Error(`Expected PONG, got ${result}`);
  });

  await test('Sanity CDN read', async () => {
    const result = await readClient.fetch<Array<{ _id: string }>>(
      `*[_type == "article"] | order(_createdAt desc) [0..1] { _id }`,
    );
    if (!Array.isArray(result)) throw new Error('Expected array from Sanity');
  });

  await test('Sanity write + delete test document', async () => {
    const { writeClient } = await import('../src/lib/news/sanity-client');
    const doc = await writeClient.create({
      _type: 'article', title: '__smoke_test__',
      slug: { _type: 'slug', current: '__smoke-test__' },
      body: 'smoke test', publishedAt: new Date().toISOString(),
    });
    if (!doc._id) throw new Error('No _id returned');
    await writeClient.delete(doc._id);
  });

  await test('RSS feed fetch', async () => {
    const feeds = (process.env.RSS_FEED_URLS ?? '').split(',').filter(Boolean);
    if (feeds.length === 0) throw new Error('RSS_FEED_URLS not configured');
    const res = await fetch(feeds[0], {
      signal: AbortSignal.timeout(10_000),
      headers: { 'User-Agent': 'CryptoBrainNews-smoke/1.0' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    if (!xml.includes('<item>')) throw new Error('No <item> elements');
  });

  await test('Dedup round-trip', async () => {
    const dedup     = new ArticleDedup();
    const testUrl   = `https://smoke-test.invalid/${Date.now()}`;
    const testTitle = `Smoke Test ${Date.now()}`;
    const before = await dedup.isDuplicate(testUrl, testTitle);
    if (before.isDuplicate) throw new Error('Fresh URL flagged as duplicate');
    await dedup.markSeen(testUrl, testTitle, 'smoke-run', 'smoke-doc');
    const after = await dedup.isDuplicate(testUrl, testTitle);
    if (!after.isDuplicate) throw new Error('Not flagged after markSeen');
  });

  await test('PageCache round-trip', async () => {
    const cache    = new PageCache();
    const key      = `smoke-${Date.now()}`;
    const testData = { results: [] as unknown[], total: 0 };
    const { fromCache: c1 } = await cache.getOrSet('search' as const, key, async () => testData);
    if (c1) throw new Error('Expected MISS');
    const { fromCache: c2 } = await cache.getOrSet('search' as const, key, async () => ({ results: [], total: 999 }));
    if (!c2) throw new Error('Expected HIT');
    await cache.invalidate('search' as const, key);
    const { fromCache: c3 } = await cache.getOrSet('search' as const, key, async () => testData);
    if (c3) throw new Error('Expected MISS after invalidate');
  });

  if (!SKIP_PAID) {
    await test('Grok API', async () => {
      const key = process.env.GROK_API_KEY ?? '';
      if (!key) throw new Error('GROK_API_KEY not set');
      const res = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST', signal: AbortSignal.timeout(20_000),
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: 'grok-2-latest', messages: [{ role: 'user', content: 'Reply: {"test":"ok"}' }] }),
      });
      if (!res.ok) throw new Error(`Grok API ${res.status}`);
      const data = (await res.json()) as { choices: Array<{ message: { content: string } }> };
      if (!data.choices[0]?.message?.content?.includes('ok')) throw new Error('Unexpected response');
    });
  } else {
    process.stdout.write('  ⏭️  Grok API — skipped (--skip-paid)\n');
  }

  await test('Telegram send', async () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_OPS_CHAT_ID ?? process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) throw new Error('Telegram not configured');
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', signal: AbortSignal.timeout(8_000),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: `🧪 Smoke test — ${new Date().toUTCString()}`, parse_mode: 'HTML' }),
    });
    if (!res.ok) throw new Error(`Telegram ${res.status}`);
  });

  await test('Twitter thread preview', async () => {
    const result = buildThread({
      article: {
        title: 'Test', slug: 'test', summary: 'Test', keyPoints: [],
        keyStats: [], tags: [], category: 'Bitcoin', sentiment: 'neutral',
      },
      pipelineRunId: 'smoke-test',
    });
    if (result.tweets.length < 3) throw new Error('Expected ≥3 tweets');
    if (result.charCounts.some((c: number) => c > 280)) throw new Error('Tweet exceeds 280 chars');
  });

  await test('Stripe account retrieve', async () => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY not set');
    const res = await fetch('https://api.stripe.com/v1/account', {
      signal: AbortSignal.timeout(8_000),
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) throw new Error(`Stripe ${res.status}`);
  });

  await test('Affiliate injector', async () => {
    const injector = new AffiliateInjector();
    const result = injector.inject('Bitcoin', ['BTC'], ['on-chain']);
    if (result.footerCards.length === 0) throw new Error('No footer cards');
  });

  await test('Schema builders', async () => {
    const s = buildNewsArticleSchema({
      title: 'Test', slug: 'test', metaDescription: 'Test',
      body: 'Test', publishedAt: new Date().toISOString(),
      author: null, tags: [], category: 'Bitcoin', sourceUrl: 'https://example.com',
    });
    if (s['@type'] !== 'NewsArticle') throw new Error('Wrong @type');
  });

  await test('Scheduler round-trip', async () => {
    const scheduler = new SocialScheduler();
    const result = await scheduler.schedule({
      channel: 'twitter_thread',
      payload: {
        title: 'Smoke', slug: 'smoke', summary: 'Test',
        keyPoints: [], keyStats: [], tags: [], category: 'Markets', sentiment: 'neutral',
      },
      pipelineRunId: 'smoke-run', articleSlug: 'smoke-test',
    });
    if (!result.jobId) throw new Error('No jobId');
    const redis = Redis.fromEnv();
    const upcoming = await scheduler.upcoming(10);
    const found = upcoming.find((j) => j.id === result.jobId);
    if (found) await redis.zrem('social:schedule', JSON.stringify(found));
  });

  await test('Health endpoint', async () => {
    const res = await fetch(`${BASE_URL}/api/health`, { signal: AbortSignal.timeout(30_000) });
    if (res.status !== 200 && res.status !== 503) throw new Error(`HTTP ${res.status}`);
  });

  const total  = results.length;
  const passed = results.filter((r) => r.passed).length;
  process.stdout.write(`\nResults: ${passed}/${total} passed\n`);
  process.exitCode = passed === total ? 0 : 1;
}

runSmokeTests().catch((err) => {
  console.error('Smoke test runner crashed:', err);
  process.exitCode = 1;
});
