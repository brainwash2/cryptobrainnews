// scripts/daily-article.ts
import 'server-only';
import { randomUUID } from 'crypto';
import { Redis } from '@upstash/redis';
import { ArticleDedup } from '../src/lib/news/dedup';
import { PipelineLogger } from '../src/lib/news/pipeline-logger';
import { RSSCache } from '../src/lib/news/rss-cache';
import { TelegramBroadcaster } from '../src/lib/news/telegram';
import { BroadcastQueue } from '../src/lib/news/broadcast-queue';
import { OpsAlerter } from '../src/lib/ops/alerts';
import type {
  RSSItem,
  GrokSummary,
  DeepSeekEnrichment,
  GeminiPolish,
  SanityArticlePayload,
  SanityWriteResult,
  PipelineRun,
} from '../src/lib/news/types';
import {
  isGrokSummary,
  isDeepSeekEnrichment,
  isGeminiPolish,
} from '../src/lib/news/types';

const RSS_FEEDS: string[] = (process.env.RSS_FEED_URLS ?? '').split(',').filter(Boolean);
const MAX_ARTICLES_PER_RUN = Number(process.env.MAX_ARTICLES_PER_RUN ?? '5');

// ── API keys ──────────────────────────────────────────────────────────────
const GROQ_API_KEY       = process.env.GROQ_API_KEY       ?? '';
const DEEPSEEK_API_KEY   = process.env.DEEPSEEK_API_KEY   ?? '';
const GEMINI_API_KEY     = process.env.GEMINI_API_KEY     ?? '';
const SANITY_PROJECT_ID  = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '';
const SANITY_DATASET     = process.env.NEXT_PUBLIC_SANITY_DATASET     ?? 'production';
const SANITY_API_TOKEN   = process.env.SANITY_API_TOKEN   ?? '';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? '';

// ── Per-stage timeout config (ms) ─────────────────────────────────────────
const GROQ_TIMEOUT_MS     = parseInt(process.env.GROQ_TIMEOUT_MS     ?? '30000', 10);
const DEEPSEEK_TIMEOUT_MS = parseInt(process.env.DEEPSEEK_TIMEOUT_MS ?? '45000', 10);
const GEMINI_TIMEOUT_MS   = parseInt(process.env.GEMINI_TIMEOUT_MS   ?? '45000', 10);

// ── Circuit breaker constants ─────────────────────────────────────────────
const CIRCUIT_BREAKER_THRESHOLD = 3;  // trips after this many consecutive failures
const CIRCUIT_BREAKER_WINDOW_S  = 3600; // 1-hour sliding window

// ── NonRetryableError ──────────────────────────────────────────────────────
/**
 * Thrown when an AI stage returns a 4xx (non-429) HTTP error.
 * These are client errors (bad API key, malformed request) that will not
 * resolve by retrying — we should bail immediately to preserve credits.
 */
class NonRetryableError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name  = 'NonRetryableError';
    this.status = status;
  }
}

// ── PipelineCircuitBreaker ────────────────────────────────────────────────
/**
 * Manages three Redis keys:
 *   pipeline:health               → 'healthy' | 'degraded' | 'failed' (TTL 24h)
 *   pipeline:consecutive-failures → integer counter, TTL 1h rolling window
 */
class PipelineCircuitBreaker {
  constructor(private readonly redis: Redis) {}

  async setHealth(status: 'healthy' | 'degraded' | 'failed'): Promise<void> {
    try {
      await this.redis.set('pipeline:health', status, { ex: 86400 });
    } catch {
      // Redis write errors must never surface to the pipeline caller
    }
  }

  async getHealth(): Promise<'healthy' | 'degraded' | 'failed' | null> {
    try {
      return await this.redis.get<'healthy' | 'degraded' | 'failed'>('pipeline:health');
    } catch {
      return null;
    }
  }

  async incrementFailures(): Promise<number> {
    try {
      const key   = 'pipeline:consecutive-failures';
      const count = await this.redis.incr(key);
      // Set TTL only on first write so the window slides from first failure
      if (count === 1) await this.redis.expire(key, CIRCUIT_BREAKER_WINDOW_S);
      return count;
    } catch {
      return 0;
    }
  }

  async resetFailures(): Promise<void> {
    try {
      await this.redis.del('pipeline:consecutive-failures');
    } catch {
      // silent
    }
  }

  async getFailureCount(): Promise<number> {
    try {
      const raw = await this.redis.get<number>('pipeline:consecutive-failures');
      return raw ?? 0;
    } catch {
      return 0;
    }
  }

  async isTripped(): Promise<boolean> {
    return (await this.getFailureCount()) >= CIRCUIT_BREAKER_THRESHOLD;
  }
}

// Shared broadcast queue instance for dead-letter writes
const deadLetterQueue = new BroadcastQueue();

// ── Retry helper ──────────────────────────────────────────────────────────
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
      // Non-retryable errors (bad API key, 400, 403 …) must not be retried —
      // retrying would burn credits with zero chance of recovery.
      if (err instanceof NonRetryableError) throw err;
      lastError = err;
      if (attempt < maxAttempts)
        await new Promise(r => setTimeout(r, baseDelayMs * Math.pow(2, attempt - 1)));
    }
  }
  throw new Error(`${label} failed after ${maxAttempts} attempts: ${String(lastError)}`);
}

// ── Dead‑letter writer → Redis LPUSH ────────────────────────────────────
async function writeDeadLetter(
  runId: string,
  item: RSSItem,
  reason: string,
  partial: unknown,
): Promise<string> {
  const id = `${runId}-${item.guid.replace(/[^a-z0-9]/gi, '-').slice(0, 40)}`;
  try {
    await deadLetterQueue.enqueueFailure({
      id,
      channel: 'telegram',
      payload: { runId, failedAt: new Date().toISOString(), reason, item, partial },
      attempts: 1,
      firstFailedAt: new Date().toISOString(),
      error: reason,
      lastError: reason,
    });
    return id;
  } catch (err) {
    console.warn('[pipeline] Unable to write dead-letter to Redis:', String(err));
    return '';
  }
}

// ── Shared non-retryable check helper ────────────────────────────────────
/** Returns true for 4xx responses that are NOT 429 (rate-limit). */
function isClientError(status: number): boolean {
  return status >= 400 && status < 500 && status !== 429;
}

// ─── AI Stage 1: Groq ────────────────────────────────────────────────────
async function runGroq(item: RSSItem): Promise<GrokSummary> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    signal: AbortSignal.timeout(GROQ_TIMEOUT_MS),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You are a crypto news analyst. Respond ONLY with valid JSON matching the GrokSummary schema. No markdown fences.',
        },
        {
          role: 'user',
          content: `Summarise this article. Schema: { headline, summary, keyPoints, rawArticleUrl, sourceTitle }\nTitle: ${item.title}\nURL: ${item.link}\nContent: ${(item.content ?? item.description).slice(0, 4000)}`,
        },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    if (isClientError(res.status)) {
      throw new NonRetryableError(`Groq API ${res.status}: ${body}`, res.status);
    }
    throw new Error(`Groq API ${res.status}: ${body}`);
  }
  const data = (await res.json()) as { choices: Array<{ message: { content: string } }> };
  const raw: unknown = JSON.parse(data.choices[0].message.content);
  if (!isGrokSummary(raw)) throw new Error('Groq response failed type guard');
  return raw;
}

// ─── AI Stage 2: DeepSeek (optional) ─────────────────────────────────────
async function runDeepSeek(item: RSSItem, grok: GrokSummary): Promise<DeepSeekEnrichment> {
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    signal: AbortSignal.timeout(DEEPSEEK_TIMEOUT_MS),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
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
          content: `Expand this summary into a full article body. Schema: { expandedBody, tags, category, sentiment, relatedTickers }\nSummary: ${grok.summary}\nKey points: ${grok.keyPoints.join('; ')}\nSource: ${item.link}`,
        },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    if (isClientError(res.status)) {
      throw new NonRetryableError(`DeepSeek API ${res.status}: ${body}`, res.status);
    }
    throw new Error(`DeepSeek API ${res.status}: ${body}`);
  }
  const data = (await res.json()) as { choices: Array<{ message: { content: string } }> };
  const raw: unknown = JSON.parse(data.choices[0].message.content);
  if (!isDeepSeekEnrichment(raw)) throw new Error('DeepSeek response failed type guard');
  return raw;
}

// ─── AI Stage 3: Gemini (optional) ───────────────────────────────────────
async function runGemini(grok: GrokSummary, deepSeek: DeepSeekEnrichment): Promise<GeminiPolish> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Polish this crypto article for SEO. Return JSON with: title, metaDescription, body, slug.\nDraft title: ${grok.headline}\nDraft body: ${deepSeek.expandedBody.slice(0, 6000)}\nTags: ${deepSeek.tags.join(', ')}`,
              },
            ],
          },
        ],
      }),
    },
  );
  if (!res.ok) {
    const body = await res.text();
    if (isClientError(res.status)) {
      throw new NonRetryableError(`Gemini API ${res.status}: ${body}`, res.status);
    }
    throw new Error(`Gemini API ${res.status}: ${body}`);
  }
  const data = (await res.json()) as {
    candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
  };
  const raw: unknown = JSON.parse(data.candidates[0].content.parts[0].text);
  if (!isGeminiPolish(raw)) throw new Error('Gemini response failed type guard');
  return raw;
}

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
    body:
      deepSeek?.expandedBody ??
      `${grok.summary}\n\n${grok.keyPoints.map(p => `- ${p}`).join('\n')}`,
    slug,
  };
}

async function slugExistsInSanity(slug: string): Promise<boolean> {
  const query = encodeURIComponent(
    `*[_type == "post" && slug.current == "${slug}"][0]._id`,
  );
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
  const json = (await res.json()) as { results?: Array<{ id: string }> };
  const documentId = json.results?.[0]?.id ?? `san-${payload.slug.current}`;
  return { documentId, slug: payload.slug.current, publishedAt: payload.publishedAt };
}

interface ProcessResult {
  published:       boolean;
  deadLetterPath?: string;
  /** True when a non-retryable error means the whole pipeline should stop. */
  circuitBreak?:   boolean;
}

async function processArticle(
  item: RSSItem,
  runId: string,
  dedup: ArticleDedup,
  logger: PipelineLogger,
): Promise<ProcessResult> {
  logger.setStage('dedup-check');
  const { isDuplicate } = await dedup.isDuplicate(item.link, item.title, item.description);
  if (isDuplicate) {
    logger.info('Skipping duplicate', { url: item.link });
    return { published: false };
  }

  logger.setStage('grok-summarise');
  let grok: GrokSummary;
  try {
    const { result, attempts } = await withRetry(() => runGroq(item), 3, 1000, 'Groq');
    grok = result;
    logger.info('Groq succeeded', { attempts });
  } catch (err) {
    const isNonRetry = err instanceof NonRetryableError;
    const reason = isNonRetry
      ? `Groq non-retryable (HTTP ${(err as NonRetryableError).status}) – pipeline halted`
      : 'Groq failed after retries';
    const path = await writeDeadLetter(runId, item, reason, null);
    logger.error(
      isNonRetry ? 'Groq non-retryable – circuit break' : 'Groq fatal – dead-lettered',
      'fatal',
      err,
      isNonRetry ? 0 : 3,
    );
    return { published: false, deadLetterPath: path || undefined, circuitBreak: isNonRetry };
  }

  logger.setStage('deepseek-enrich');
  let deepSeek: DeepSeekEnrichment | undefined;
  try {
    const { result, attempts } = await withRetry(
      () => runDeepSeek(item, grok),
      2,
      2000,
      'DeepSeek',
    );
    deepSeek = result;
    logger.info('DeepSeek succeeded', { attempts });
  } catch (err) {
    // DeepSeek failure is degraded — Gemini or fallback will still run
    logger.error('DeepSeek failed – degraded to Groq output only', 'degraded', err, 2);
  }

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

  const finalPolish = gemini ?? buildFallbackPolish(grok, deepSeek);

  logger.setStage('sanity-write');
  try {
    const exists = await slugExistsInSanity(finalPolish.slug);
    if (exists) {
      logger.info('Slug already exists – skipping write', { slug: finalPolish.slug });
      await dedup.markSeen(item.link, item.title, runId, undefined, item.description);
      return { published: false };
    }
  } catch (err) {
    logger.warn('Slug check failed – proceeding with write', { cause: String(err) });
  }

  const bodyBlock = {
    _key: randomUUID(),
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: randomUUID(),
        text: finalPolish.body,
        marks: [],
      },
    ],
  };

  const payload = {
    _type: 'post',
    title: finalPolish.title,
    slug: { _type: 'slug', current: finalPolish.slug },
    body: [bodyBlock],
    excerpt: grok.summary.slice(0, 180),
    category: deepSeek?.category ?? 'News',
    tags: deepSeek?.tags ?? [],
    publishedAt: new Date().toISOString(),
    status: 'published',
    seo: {
      metaTitle: finalPolish.title.slice(0, 70),
      metaDescription: finalPolish.metaDescription.slice(0, 160),
      noIndex: false,
    },
  } as SanityArticlePayload;

  let sanityResult: SanityWriteResult;
  try {
    const { result, attempts } = await withRetry(
      () => writeToSanity(payload),
      3,
      2000,
      'Sanity',
    );
    sanityResult = result;
    logger.info('Sanity write succeeded', {
      documentId: sanityResult.documentId,
      attempts,
    });
  } catch (err) {
    const path = await writeDeadLetter(runId, item, 'Sanity write failed', payload);
    logger.error('Sanity write fatal – dead-lettered', 'fatal', err, 3);
    return { published: false, deadLetterPath: path || undefined };
  }

  await dedup.markSeen(item.link, item.title, runId, sanityResult.documentId, item.description);

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

export async function runPipeline(): Promise<PipelineRun> {
  const runId     = randomUUID();
  const startedAt = new Date().toISOString();
  const logger    = new PipelineLogger(runId);
  const dedup     = new ArticleDedup();
  const rssCache  = new RSSCache();

  // ── Circuit breaker + health key setup ───────────────────────────────────
  let cb: PipelineCircuitBreaker | null = null;
  try {
    cb = new PipelineCircuitBreaker(Redis.fromEnv());
  } catch {
    logger.warn('Redis unavailable — circuit breaker disabled for this run', {});
  }

  // Check if circuit breaker is already tripped from previous runs
  if (cb) {
    const tripped = await cb.isTripped();
    if (tripped) {
      const failCount = await cb.getFailureCount();
      const msg = `Circuit breaker tripped: ${failCount} consecutive failures in last hour — pipeline paused`;
      logger.warn(msg, { failCount });
      await cb.setHealth('failed');

      const alerter = new OpsAlerter();
      await alerter.healthAlert({
        system:  'pipeline-circuit-breaker',
        message: `Pipeline PAUSED — ${failCount} consecutive failures in last hour. Manual inspection required.`,
      });

      return {
        runId,
        startedAt,
        completedAt: new Date().toISOString(),
        stage:              'failed',
        articlesAttempted:  0,
        articlesPublished:  0,
        errors:             [],
        deadLetterPaths:    [],
      };
    }
    // Mark healthy at the start of each live run
    await cb.setHealth('healthy');
  }

  logger.info('Pipeline run starting', { runId, maxArticles: MAX_ARTICLES_PER_RUN });
  const run: PipelineRun = {
    runId,
    startedAt,
    stage:              'idle',
    articlesAttempted:  0,
    articlesPublished:  0,
    errors:             [],
    deadLetterPaths:    [],
  };

  let items: RSSItem[];
  try {
    const feedConfig = RSS_FEEDS.map((url, i) => ({ url, name: `Feed-${i + 1}` }));
    const result = await rssCache.getAllItems(feedConfig);
    items = result.items;
    if (items.length === 0) throw new Error('All RSS feeds returned zero items.');
    logger.info(`Fetched ${items.length} total items from ${feedConfig.length} feeds`);
  } catch (err) {
    run.stage = 'failed';
    run.errors.push(logger.error('RSS fetch fatal', 'fatal', err, 0));
    run.completedAt = new Date().toISOString();
    if (cb) {
      const failCount = await cb.incrementFailures();
      await cb.setHealth(failCount >= CIRCUIT_BREAKER_THRESHOLD ? 'failed' : 'degraded');
    }
    return run;
  }

  logger.setStage('dedup-check');
  const dedupMap = await dedup.bulkCheck(
    items.map(i => ({ guid: i.guid, url: i.link, title: i.title, description: i.description })),
  );
  const fresh     = items.filter(i => !dedupMap.get(i.guid)?.isDuplicate);
  logger.info(`Dedup: ${items.length} total → ${fresh.length} fresh`);

  const toProcess = fresh.slice(0, MAX_ARTICLES_PER_RUN);
  let circuitBroken = false;

  for (const item of toProcess) {
    run.articlesAttempted += 1;
    try {
      const { published, deadLetterPath, circuitBreak } = await processArticle(
        item, runId, dedup, logger,
      );
      if (published) run.articlesPublished += 1;
      if (deadLetterPath) run.deadLetterPaths.push(deadLetterPath);

      if (circuitBreak) {
        // Non-retryable Groq error: same key would fail every article — stop now
        circuitBroken = true;
        logger.warn(
          'Non-retryable Groq error — stopping article loop to preserve API credits',
          { item: item.link },
        );
        if (cb) await cb.setHealth('degraded');
        break;
      }
    } catch (err) {
      logger.error(`Unhandled error processing ${item.link}`, 'fatal', err);
    }
  }

  const tg      = new TelegramBroadcaster(TELEGRAM_BOT_TOKEN);
  const tgDrain = await tg.drainRetries();
  logger.info('Telegram retry drain', tgDrain);

  if (process.env.RESEND_API_KEY) {
    const { NewsletterService } = await import('../src/lib/news/newsletter');
    const nl      = new NewsletterService(process.env.RESEND_API_KEY);
    const nlDrain = await nl.drainRetries();
    logger.info('Newsletter retry drain', nlDrain);
  }

  run.stage  = logger.hasFatal() ? 'failed' : 'complete';
  run.errors = [...logger.getErrors()];
  run.completedAt = new Date().toISOString();

  // ── Update circuit breaker state ─────────────────────────────────────────
  if (cb) {
    const hasFatal = run.stage === 'failed' || circuitBroken;

    if (!hasFatal && run.articlesPublished > 0) {
      // Successful run — reset window
      await cb.resetFailures();
      await cb.setHealth('healthy');
    } else if (hasFatal) {
      const failCount = await cb.incrementFailures();
      const tripped   = failCount >= CIRCUIT_BREAKER_THRESHOLD;
      await cb.setHealth(tripped ? 'failed' : 'degraded');

      if (tripped) {
        logger.warn(`Circuit breaker threshold reached (${failCount} failures)`, { failCount });
        const alerter = new OpsAlerter();
        await alerter.healthAlert({
          system:  'pipeline-circuit-breaker',
          message: `Circuit breaker TRIPPED after ${failCount} consecutive failures — pipeline will pause on next run. Check Groq/DeepSeek/Gemini API keys and quotas.`,
        });
      }
    } else {
      // Partial run (some degraded stages, no fatals, no published) — mark degraded but don't increment
      await cb.setHealth('degraded');
    }
  }

  // ── pipeline:last-success ─────────────────────────────────────────────────
  if (run.stage === 'complete') {
    try {
      const redis = Redis.fromEnv();
      await redis.set('pipeline:last-success', run.completedAt, { ex: 90000 });
    } catch (e) {
      logger.warn('pipeline:last-success write failed', { error: String(e) });
    }
  }

  logger.info('Pipeline run complete', {
    articlesAttempted:  run.articlesAttempted,
    articlesPublished:  run.articlesPublished,
    deadLetterCount:    run.deadLetterPaths.length,
    fatalErrors:        run.errors.filter(e => e.severity === 'fatal').length,
    circuitBroken,
  });
  return run;
}

// CLI entrypoint
if (require.main === module) {
  runPipeline()
    .then(run => {
      process.exitCode = run.stage === 'failed' ? 1 : 0;
    })
    .catch(err => {
      console.error('Unhandled pipeline crash:', err);
      process.exitCode = 1;
    });
}
