/**
 * scripts/daily-article.ts
 * Daily automated article pipeline: RSS → Grok → DeepSeek → Gemini → Sanity
 *
 * Graceful failure model:
 *   Stage           Fatal?   Fallback
 *   ─────────────────────────────────────────────────────
 *   RSS fetch       YES      Abort run – nothing to process
 *   Grok            YES      Per-article: skip + dead-letter
 *   DeepSeek        NO       Use Grok output directly
 *   Gemini          NO       Use DeepSeek (or Grok) output directly
 *   Sanity write    YES      Per-article: retry × 3, then dead-letter
 *   Telegram        NO       Log warn, continue
 *
 * Idempotency:
 *   - Redis dedup checked BEFORE any AI calls (URL + title SHA-256)
 *   - Sanity checked by slug BEFORE write to prevent duplicate documents
 *   - markSeen() called ONLY after successful Sanity write
 *
 * Run:
 *   npx ts-node --esm scripts/daily-article.ts
 *   or via Vercel Cron with a thin wrapper that calls runPipeline()
 */

import { randomUUID } from 'crypto';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Internal imports – adjust paths if your monorepo differs
import { ArticleDedup } from '../src/lib/news/dedup';
import { PipelineLogger } from '../src/lib/news/pipeline-logger';
import { RSSCache } from '../src/lib/news/rss-cache';
import { TelegramBroadcaster } from '../src/lib/news/telegram';
import type {
  RSSItem,
  GrokSummary,
  DeepSeekEnrichment,
  GeminiPolish,
  AIStageOutputs,
  SanityArticlePayload,
  SanityWriteResult,
  PipelineRun,
} from '../src/lib/news/types';
import {
  isGrokSummary,
  isDeepSeekEnrichment,
  isGeminiPolish,
} from '../src/lib/news/types';

// ─── Config ──────────────────────────────────────────────────────────────────

const RSS_FEEDS: string[] = (process.env.RSS_FEED_URLS ?? '').split(',').filter(Boolean);
const MAX_ARTICLES_PER_RUN = Number(process.env.MAX_ARTICLES_PER_RUN ?? '5');
const DEAD_LETTER_DIR = process.env.DEAD_LETTER_DIR ?? 'scripts/dead-letter';

const GROK_API_KEY = process.env.GROK_API_KEY ?? '';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY ?? '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '';
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';
const SANITY_API_TOKEN = process.env.SANITY_API_TOKEN ?? '';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? '';
const _TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID ?? '';

// ─── Retry helper ─────────────────────────────────────────────────────────────

async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number,
  baseDelayMs: number,
  label: string,
): Promise<{ result: T; attempts: number }> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn();
      return { result, attempts: attempt };
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1); // exponential backoff
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw new Error(`${label} failed after ${maxAttempts} attempts: ${String(lastError)}`);
}

// ─── Dead-letter writer ───────────────────────────────────────────────────────

function writeDeadLetter(runId: string, item: RSSItem, reason: string, partial: unknown): string {
  mkdirSync(DEAD_LETTER_DIR, { recursive: true });
  const filename = `${runId}-${Date.now()}-${item.guid.replace(/[^a-z0-9]/gi, '-').slice(0, 40)}.json`;
  const path = join(DEAD_LETTER_DIR, filename);
  writeFileSync(
    path,
    JSON.stringify({ runId, failedAt: new Date().toISOString(), reason, item, partial }, null, 2),
    'utf-8',
  );
  return path;
}

// ─── Minimal XML→RSSItem parser ───────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseRSSXML(xml: string, _sourceUrl: string): RSSItem[] {
  const items: RSSItem[] = [];
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
  for (const [, body] of itemMatches) {
    const get = (tag: string): string =>
      (body.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`))?.[1] ??
        body.match(new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`))?.[1] ??
        '').trim();

    const title = get('title');
    const link = get('link');
    const pubDate = get('pubDate');
    const guid = get('guid') || link;
    const description = get('description');
    if (!title || !link) continue;

    items.push({ title, link, pubDate, guid, description, content: get('content:encoded') || undefined });
  }
  return items;
}

// ─── AI Stages ────────────────────────────────────────────────────────────────

async function runGrok(item: RSSItem): Promise<GrokSummary> {
  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    signal: AbortSignal.timeout(30_000),
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROK_API_KEY}` },
    body: JSON.stringify({
      model: 'grok-2-latest',
      messages: [
        {
          role: 'system',
          content:
            'You are a crypto news analyst. Respond ONLY with valid JSON matching the GrokSummary schema. No markdown fences.',
        },
        {
          role: 'user',
          content: `Summarise this article for a data-first crypto audience.
Schema: { headline: string, summary: string (2-3 sentences), keyPoints: string[] (3-5 bullets), rawArticleUrl: string, sourceTitle: string }
Title: ${item.title}
URL: ${item.link}
Content: ${(item.content ?? item.description).slice(0, 4000)}`,
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Grok API ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { choices: Array<{ message: { content: string } }> };
  const raw: unknown = JSON.parse(data.choices[0].message.content);
  if (!isGrokSummary(raw)) throw new Error('Grok response failed type guard');
  return raw;
}

async function runDeepSeek(item: RSSItem, grok: GrokSummary): Promise<DeepSeekEnrichment> {
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    signal: AbortSignal.timeout(45_000),
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${DEEPSEEK_API_KEY}` },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content:
            'You are a senior crypto journalist. Respond ONLY with valid JSON. No markdown fences.',
        },
        {
          role: 'user',
          content: `Expand this summary into a full article body.
Schema: { expandedBody: string (Markdown), tags: string[], category: string, sentiment: "bullish"|"bearish"|"neutral", relatedTickers: string[] }
Summary: ${grok.summary}
Key points: ${grok.keyPoints.join('; ')}
Source: ${item.link}`,
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`DeepSeek API ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { choices: Array<{ message: { content: string } }> };
  const raw: unknown = JSON.parse(data.choices[0].message.content);
  if (!isDeepSeekEnrichment(raw)) throw new Error('DeepSeek response failed type guard');
  return raw;
}

async function runGemini(grok: GrokSummary, deepSeek: DeepSeekEnrichment): Promise<GeminiPolish> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      signal: AbortSignal.timeout(45_000),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Polish this crypto article for SEO and publication.
Respond ONLY with valid JSON. No markdown fences.
Schema: { title: string, metaDescription: string (max 160 chars), body: string (Markdown), slug: string (kebab-case max 80 chars) }
Draft title: ${grok.headline}
Draft body: ${deepSeek.expandedBody.slice(0, 6000)}
Tags: ${deepSeek.tags.join(', ')}`,
              },
            ],
          },
        ],
      }),
    },
  );
  if (!res.ok) throw new Error(`Gemini API ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as {
    candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
  };
  const raw: unknown = JSON.parse(data.candidates[0].content.parts[0].text);
  if (!isGeminiPolish(raw)) throw new Error('Gemini response failed type guard');
  return raw;
}

// ─── Fallback content builder (when AI stages are degraded) ──────────────────

function buildFallbackPolish(grok: GrokSummary, deepSeek?: DeepSeekEnrichment): GeminiPolish {
  const headline = grok.headline;
  const slug = headline
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80);
  return {
    title: headline,
    metaDescription: grok.summary.slice(0, 160),
    body: deepSeek?.expandedBody ?? `${grok.summary}\n\n${grok.keyPoints.map((p) => `- ${p}`).join('\n')}`,
    slug,
  };
}

// ─── Sanity write ─────────────────────────────────────────────────────────────

async function slugExistsInSanity(slug: string): Promise<boolean> {
  const query = encodeURIComponent(`*[_type == "article" && slug.current == "${slug}"][0]._id`);
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=${query}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${SANITY_API_TOKEN}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Sanity slug check ${res.status}`);
  const { result } = (await res.json()) as { result: string | null };
  return result != null;
}

async function writeToSanity(payload: SanityArticlePayload): Promise<SanityWriteResult> {
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${SANITY_DATASET}`;
  const res = await fetch(url, {
    method: 'POST',
    signal: AbortSignal.timeout(20_000),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SANITY_API_TOKEN}`,
    },
    body: JSON.stringify({ mutations: [{ create: payload }] }),
  });
  if (!res.ok) throw new Error(`Sanity write ${res.status}: ${await res.text()}`);
  const { results } = (await res.json()) as { results: Array<{ id: string }> };
  const documentId = results[0]?.id;
  if (!documentId) throw new Error('Sanity returned no document ID');
  return { documentId, slug: payload.slug.current, publishedAt: payload.publishedAt };
}

// ─── Per-article processor ────────────────────────────────────────────────────

async function processArticle(
  item: RSSItem,
  runId: string,
  dedup: ArticleDedup,
  logger: PipelineLogger,
): Promise<{ published: boolean; deadLetterPath?: string }> {

  // 1. Dedup check
  logger.setStage('dedup-check');
  const { isDuplicate, matchedOn } = await dedup.isDuplicate(item.link, item.title);
  if (isDuplicate) {
    logger.info(`Skipping duplicate (matched on ${matchedOn ?? 'unknown'})`, { url: item.link });
    return { published: false };
  }

  // 2. Grok – FATAL per article (without a summary, there's nothing to build on)
  logger.setStage('grok-summarise');
  let grok: GrokSummary;
  try {
    const { result, attempts } = await withRetry(() => runGrok(item), 3, 1000, 'Grok');
    grok = result;
    logger.info('Grok succeeded', { attempts });
  } catch (err) {
    const path = writeDeadLetter(runId, item, 'Grok failed', null);
    logger.error('Grok fatal – dead-lettered', 'fatal', err, 3);
    return { published: false, deadLetterPath: path };
  }

  // 3. DeepSeek – DEGRADED (fall back to Grok output)
  logger.setStage('deepseek-enrich');
  let deepSeek: DeepSeekEnrichment | undefined;
  try {
    const { result, attempts } = await withRetry(() => runDeepSeek(item, grok), 2, 2000, 'DeepSeek');
    deepSeek = result;
    logger.info('DeepSeek succeeded', { attempts });
  } catch (err) {
    logger.error('DeepSeek failed – degraded to Grok output only', 'degraded', err, 2);
  }

  // 4. Gemini – DEGRADED (fall back to deepSeek or Grok output)
  logger.setStage('gemini-polish');
  let gemini: GeminiPolish | undefined;
  if (deepSeek) {
    try {
      const { result, attempts } = await withRetry(
        () => runGemini(grok, deepSeek!),
        2,
        2000,
        'Gemini',
      );
      gemini = result;
      logger.info('Gemini succeeded', { attempts });
    } catch (err) {
      logger.error('Gemini failed – degraded to DeepSeek output', 'degraded', err, 2);
    }
  }

  // Resolve final content (best available stage wins)
  const finalPolish: GeminiPolish = gemini ?? buildFallbackPolish(grok, deepSeek);
  const stageOutputs: AIStageOutputs = {
    grok,
    ...(deepSeek ? { deepSeek } : {}),
    ...(gemini ? { gemini } : {}),
  };

  // 5. Sanity idempotency check
  logger.setStage('sanity-write');
  try {
    const exists = await slugExistsInSanity(finalPolish.slug);
    if (exists) {
      logger.info('Slug already exists in Sanity – skipping write', { slug: finalPolish.slug });
      await dedup.markSeen(item.link, item.title, runId);
      return { published: false };
    }
  } catch (err) {
    logger.warn('Sanity slug check failed – proceeding with write anyway', { cause: String(err) });
  }

  // 6. Sanity write – FATAL per article
  const payload: SanityArticlePayload = {
    _type: 'article',
    title: finalPolish.title,
    slug: { _type: 'slug', current: finalPolish.slug },
    metaDescription: finalPolish.metaDescription,
    body: finalPolish.body,
    tags: deepSeek?.tags ?? [],
    category: deepSeek?.category ?? 'News',
    sentiment: deepSeek?.sentiment ?? 'neutral',
    relatedTickers: deepSeek?.relatedTickers ?? [],
    sourceUrl: item.link,
    publishedAt: new Date().toISOString(),
    generatedBy: stageOutputs,
    pipelineRunId: runId,
  };

  let sanityResult: SanityWriteResult;
  try {
    const { result, attempts } = await withRetry(() => writeToSanity(payload), 3, 2000, 'Sanity');
    sanityResult = result;
    logger.info('Sanity write succeeded', { documentId: sanityResult.documentId, attempts });
  } catch (err) {
    const path = writeDeadLetter(runId, item, 'Sanity write failed', payload);
    logger.error('Sanity write fatal – dead-lettered', 'fatal', err, 3);
    return { published: false, deadLetterPath: path };
  }

  // 7. Mark seen ONLY after successful Sanity write
  await dedup.markSeen(item.link, item.title, runId, sanityResult.documentId);

  // 8. Telegram broadcast – non-fatal (via hardened TelegramBroadcaster)
  const telegram = new TelegramBroadcaster(TELEGRAM_BOT_TOKEN);
  await telegram.send(
    TelegramBroadcaster.formatArticleMessage(
      finalPolish.title,
      grok.summary,
      finalPolish.slug,
      deepSeek?.tags ?? [],
    ),
    runId,
  );

  return { published: true };
}

// ─── Main entrypoint ──────────────────────────────────────────────────────────

export async function runPipeline(): Promise<PipelineRun> {
  const runId = randomUUID();
  const startedAt = new Date().toISOString();
  const logger = new PipelineLogger(runId);
  const dedup = new ArticleDedup();
  const rssCache = new RSSCache();

  logger.info('Pipeline run starting', { runId, maxArticles: MAX_ARTICLES_PER_RUN });

  const run: PipelineRun = {
    runId,
    startedAt,
    stage: 'idle',
    articlesAttempted: 0,
    articlesPublished: 0,
    errors: [],
    deadLetterPaths: [],
  };

  // RSS fetch via RSSCache (with stampede guard and 1-hr TTL)
  let items: RSSItem[];
  try {
    const feedConfig = RSS_FEEDS.map((url, i) => ({ url, name: `Feed-${i + 1}` }));
    const result = await rssCache.getAllItems(feedConfig);
    items = result.items;
    if (items.length === 0) {
      throw new Error('All RSS feeds returned zero items – aborting run.');
    }
    logger.info(`Fetched ${items.length} total items from ${feedConfig.length} feeds`);
  } catch (err) {
    run.stage = 'failed';
    run.errors.push(logger.error('RSS fetch fatal', 'fatal', err, 0));
    run.completedAt = new Date().toISOString();
    return run;
  }

  // Bulk dedup pre-check to avoid wasteful AI calls
  logger.setStage('dedup-check');
  const dedupMap = await dedup.bulkCheck(
    items.map((i) => ({ guid: i.guid, url: i.link, title: i.title })),
  );
  const fresh = items.filter((i) => !dedupMap.get(i.guid)?.isDuplicate);
  logger.info(`Dedup: ${items.length} total → ${fresh.length} fresh`);

  // Process up to MAX_ARTICLES_PER_RUN fresh items sequentially
  const toProcess = fresh.slice(0, MAX_ARTICLES_PER_RUN);
  for (const item of toProcess) {
    run.articlesAttempted += 1;
    try {
      const { published, deadLetterPath } = await processArticle(item, runId, dedup, logger);
      if (published) run.articlesPublished += 1;
      if (deadLetterPath) run.deadLetterPaths.push(deadLetterPath);
    } catch (err) {
      logger.error(`Unhandled error processing ${item.link}`, 'fatal', err);
    }
  }

  // Drain any queued retries from this run (Telegram + Newsletter)
  const tg = new TelegramBroadcaster(TELEGRAM_BOT_TOKEN);
  const tgDrain = await tg.drainRetries();
  logger.info('Telegram retry drain', tgDrain);

  if (process.env.RESEND_API_KEY) {
    const { NewsletterService } = await import('../src/lib/news/newsletter');
    const nl = new NewsletterService(process.env.RESEND_API_KEY);
    const nlDrain = await nl.drainRetries();
    logger.info('Newsletter retry drain', nlDrain);
  }

  run.stage = logger.hasFatal() ? 'failed' : 'complete';
  run.errors = [...logger.getErrors()];
  run.completedAt = new Date().toISOString();

  logger.info('Pipeline run complete', {
    articlesAttempted: run.articlesAttempted,
    articlesPublished: run.articlesPublished,
    deadLetterCount: run.deadLetterPaths.length,
    fatalErrors: run.errors.filter((e) => e.severity === 'fatal').length,
  });

  return run;
}

// CLI entrypoint
if (require.main === module) {
  runPipeline()
    .then((run) => {
      process.exitCode = run.stage === 'failed' ? 1 : 0;
    })
    .catch((err) => {
      console.error('Unhandled pipeline crash:', err);
      process.exitCode = 1;
    });
}