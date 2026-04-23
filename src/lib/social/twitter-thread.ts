/**
 * lib/social/twitter-thread.ts
 * X/Twitter thread builder and publisher.
 *
 * Responsibilities:
 *   1. Converts a published article into a 5–8 tweet thread
 *      following the "Data-first, no-BS" brand voice.
 *   2. Publishes via Twitter API v2 (thread = reply chain).
 *   3. Queues failed threads via BroadcastQueue (channel: 'telegram'
 *      slot reused — add 'twitter' channel if needed, or extend the enum).
 *
 * Thread anatomy (brand standard):
 *   Tweet 1  — Hook: bold claim or data point (≤240 chars)
 *   Tweet 2  — Context / why it matters
 *   Tweet 3–N — Key stats / on-chain data (one stat per tweet)
 *   Final     — CTA: article link + hashtags
 *
 * Rate limits:
 *   Free tier  : 17 tweets/24 h — NOT suitable for production.
 *   Basic tier : 100 tweets/24 h.
 *   Pro tier   : 10 000 tweets/month.
 *   All tiers  : 1 req/s per user auth.
 *   This module enforces INTER_TWEET_DELAY_MS between tweets in a thread.
 */

import { randomUUID }    from 'crypto';
import { Redis }         from '@upstash/redis';
import type { KeyStat }  from '../news/seo/geo-enhancer';


// ─── Config ───────────────────────────────────────────────────────────────────

const TWITTER_API_BASE      = 'https://api.twitter.com/2';
const INTER_TWEET_DELAY_MS  = 1_100; // >1 s between tweets (API rate limit)
const MAX_TWEET_CHARS       = 280;
const THREAD_REDIS_KEY      = 'social:twitter:published';
const THREAD_TTL_SECONDS    = 60 * 60 * 24 * 7; // 7 days

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TwitterCredentials {
  apiKey:            string;
  apiSecret:         string;
  accessToken:       string;
  accessTokenSecret: string;
  bearerToken:       string;
}

export interface ThreadInput {
  article: {
    title:      string;
    slug:       string;
    summary:    string;   // Grok 2-3 sentence summary
    keyPoints:  string[]; // Grok bullet points
    keyStats:   KeyStat[];
    tags:       string[];
    category:   string;
    sentiment:  'bullish' | 'bearish' | 'neutral';
  };
  pipelineRunId: string;
}

export interface Tweet {
  text:      string;
  replyToId?: string; // Set for all tweets after the first
}

export interface PublishedThread {
  threadId:   string;  // ID of the first tweet
  tweetIds:   string[];
  articleSlug:string;
  publishedAt:string;
}

export interface ThreadBuildResult {
  tweets:      string[]; // Raw text array before posting
  charCounts:  number[];
}

// ─── Thread builder ───────────────────────────────────────────────────────────

const SENTIMENT_EMOJI: Record<string, string> = {
  bullish: '🟢',
  bearish: '🔴',
  neutral: '⚪',
};

const CATEGORY_HASHTAGS: Record<string, string[]> = {
  Bitcoin:  ['#Bitcoin', '#BTC', '#OnChain'],
  DeFi:     ['#DeFi', '#Web3', '#TVL'],
  Ethereum: ['#Ethereum', '#ETH', '#EVM'],
  Altcoins: ['#Altcoins', '#Crypto', '#Altseason'],
  Markets:  ['#Crypto', '#CryptoMarkets', '#Trading'],
};

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + '…';
}

function hashtagsForCategory(category: string, tags: string[]): string {
  const base  = CATEGORY_HASHTAGS[category] ?? ['#Crypto'];
  const extra = tags
    .slice(0, 2)
    .map((t) => `#${t.replace(/\s+/g, '').slice(0, 20)}`)
    .filter((h) => !base.includes(h));
  return [...base, ...extra].slice(0, 4).join(' ');
}

/**
 * Pure function — builds tweet texts without making any API calls.
 * Call this to preview before publishing.
 */
export function buildThread(input: ThreadInput): ThreadBuildResult {
  const { article } = input;
  const siteUrl     = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cryptobrainnews.com';
  const articleUrl  = `${siteUrl}/news/${article.slug}`;
  const emoji       = SENTIMENT_EMOJI[article.sentiment] ?? '⚪';
  const hashtags    = hashtagsForCategory(article.category, article.tags);

  const tweets: string[] = [];

  // Tweet 1 — Hook (data point or bold claim)
  const hook = article.keyStats.length > 0
    ? `${emoji} ${article.keyStats[0].metric}: ${article.keyStats[0].value}\n\n${truncate(article.keyStats[0].context, 120)}\n\nThread ��`
    : `${emoji} ${truncate(article.title, 200)}\n\nThread 🧵`;
  tweets.push(truncate(hook, MAX_TWEET_CHARS));

  // Tweet 2 — Context / why it matters
  const context = truncate(
    `What this means:\n\n${article.summary}`,
    MAX_TWEET_CHARS,
  );
  tweets.push(context);

  // Tweets 3–N — Key stats (one per tweet, max 4)
  const statsToUse = article.keyStats.slice(1, 5);
  for (const stat of statsToUse) {
    const dirArrow = stat.direction === 'up' ? '↑' : stat.direction === 'down' ? '↓' : '→';
    const statTweet = truncate(
      `${dirArrow} ${stat.metric}: ${stat.value}\n${stat.context}${stat.source ? `\n\nSource: ${stat.source}` : ''}`,
      MAX_TWEET_CHARS,
    );
    tweets.push(statTweet);
  }

  // Key points (if no stats) — up to 3 bullet tweets
  if (statsToUse.length === 0) {
    for (const point of article.keyPoints.slice(0, 3)) {
      tweets.push(truncate(`• ${point}`, MAX_TWEET_CHARS));
    }
  }

  // Final tweet — CTA
  const cta = truncate(
    `Full analysis + charts 👇\n\n${articleUrl}\n\n${hashtags}`,
    MAX_TWEET_CHARS,
  );
  tweets.push(cta);

  return {
    tweets,
    charCounts: tweets.map((t) => t.length),
  };
}

// ─── Publisher ────────────────────────────────────────────────────────────────

export class TwitterThreadPublisher {
  private readonly creds:  TwitterCredentials;
  private readonly redis:  Redis;

  constructor(creds: TwitterCredentials) {
    this.creds = creds;
    this.redis = Redis.fromEnv();
  }

  /**
   * Publish a thread. Returns PublishedThread on success.
   * Throws on unrecoverable API error — caller should dead-letter.
   */
  async publish(input: ThreadInput): Promise<PublishedThread> {
    const { tweets } = buildThread(input);

    // Idempotency: check if this article's thread was already published
    const existing = await this.redis.hget<string>(
      THREAD_REDIS_KEY,
      input.article.slug,
    );
    if (existing) {
      return JSON.parse(existing) as PublishedThread;
    }

    const tweetIds: string[] = [];
    let replyToId: string | undefined;

    for (let i = 0; i < tweets.length; i++) {
      const body: Record<string, unknown> = { text: tweets[i] };
      if (replyToId) {
        body['reply'] = { in_reply_to_tweet_id: replyToId };
      }

      const tweetId = await this.postTweet(body);
      tweetIds.push(tweetId);
      replyToId = tweetId;

      if (i < tweets.length - 1) {
        await new Promise((r) => setTimeout(r, INTER_TWEET_DELAY_MS));
      }
    }

    const result: PublishedThread = {
      threadId:    tweetIds[0],
      tweetIds,
      articleSlug: input.article.slug,
      publishedAt: new Date().toISOString(),
    };

    // Persist so re-runs don't duplicate
    await this.redis.hset(THREAD_REDIS_KEY, {
      [input.article.slug]: JSON.stringify(result),
    });
    await this.redis.expire(THREAD_REDIS_KEY, THREAD_TTL_SECONDS);

    return result;
  }

  private async postTweet(body: Record<string, unknown>): Promise<string> {
    // Twitter API v2 uses OAuth 1.0a for user-context writes
    const authHeader = await this.buildOAuth1Header('POST', `${TWITTER_API_BASE}/tweets`, body);

    const res = await fetch(`${TWITTER_API_BASE}/tweets`, {
      method:  'POST',
      signal:  AbortSignal.timeout(15_000),
      headers: {
        'Content-Type':  'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(body),
    });

    if (res.status === 429) {
      const resetMs = Number(res.headers.get('x-rate-limit-reset') ?? '0') * 1000;
      const waitMs  = Math.max(resetMs - Date.now(), 15_000);
      await new Promise((r) => setTimeout(r, Math.min(waitMs, 60_000)));
      return this.postTweet(body); // one automatic retry after rate-limit window
    }

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Twitter API ${res.status}: ${err}`);
    }

    const data = (await res.json()) as { data: { id: string } };
    return data.data.id;
  }

  /**
   * Minimal OAuth 1.0a header builder.
   * For production, swap with the `oauth-1.0a` npm package.
   * This implementation covers the exact subset needed for POST /tweets.
   */
  private async buildOAuth1Header(
    method: string,
    url:    string,
    _body:   Record<string, unknown>,
  ): Promise<string> {
    const nonce     = randomUUID().replace(/-/g, '');
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const oauthParams: Record<string, string> = {
      oauth_consumer_key:     this.creds.apiKey,
      oauth_nonce:            nonce,
      oauth_signature_method: 'HMAC-SHA256',
      oauth_timestamp:        timestamp,
      oauth_token:            this.creds.accessToken,
      oauth_version:          '1.0',
    };

    // Build signature base string
    const allParams: Record<string, string> = {
      ...oauthParams,
      // For JSON body, Twitter v2 does NOT include body params in signature
    };

    const sortedParams = Object.keys(allParams)
      .sort()
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(allParams[k])}`)
      .join('&');

    const signatureBase = [
      method.toUpperCase(),
      encodeURIComponent(url),
      encodeURIComponent(sortedParams),
    ].join('&');

    const signingKey = `${encodeURIComponent(this.creds.apiSecret)}&${encodeURIComponent(this.creds.accessTokenSecret)}`;

    // HMAC-SHA256 via SubtleCrypto (Edge-compatible)
    const encoder    = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(signingKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      keyMaterial,
      encoder.encode(signatureBase),
    );
    const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

    oauthParams['oauth_signature'] = signature;

    const headerValue = 'OAuth ' +
      Object.keys(oauthParams)
        .sort()
        .map((k) => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
        .join(', ');

    return headerValue;
  }
}
