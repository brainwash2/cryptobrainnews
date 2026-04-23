/**
 * lib/monetisation/analytics.ts
 * Affiliate click and conversion tracking backed by Redis.
 */

import { Redis } from '@upstash/redis';

const DAILY_TTL_SECONDS = 60 * 60 * 24 * 90; // 90 days
const EVENT_LIST_MAX    = 100;

export interface AffiliateClickEvent {
  partnerId:   string;
  articleSlug: string;
  position:    'footer' | 'inline' | 'sidebar';
  referrer?:   string;
  userAgent?:  string;
  ip?:         string;
  timestamp:   string;
  sessionId?:  string;
}

export interface DailyAffiliateStat {
  date:       string;
  clicks:     number;
  revenue:    number;
}

export interface PartnerSummary {
  partnerId:   string;
  totalClicks: number;
  totalRevenue:number;
  last7Days:   DailyAffiliateStat[];
  last30Days:  DailyAffiliateStat[];
  topArticles: Array<{ slug: string; clicks: number }>;
}

function dailyClickKey(partnerId: string, date: string): string {
  return `aff:clicks:${partnerId}:${date}`;
}
function totalClickKey(partnerId: string): string {
  return `aff:clicks:${partnerId}:total`;
}
function dailyRevKey(partnerId: string, date: string): string {
  return `aff:revenue:${partnerId}:${date}`;
}
function totalRevKey(partnerId: string): string {
  return `aff:revenue:${partnerId}:total`;
}
function articleClickKey(slug: string, partnerId: string): string {
  return `aff:articles:${slug}:${partnerId}`;
}
function eventListKey(partnerId: string): string {
  return `aff:events:${partnerId}`;
}

async function hashIP(ip: string): Promise<string> {
  const data   = new TextEncoder().encode(ip + (process.env.IP_HASH_SALT ?? 'cbn'));
  const buf    = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16);
}

export class AffiliateAnalytics {
  private readonly redis: Redis;

  constructor() {
    this.redis = Redis.fromEnv();
  }

  async trackClick(event: AffiliateClickEvent): Promise<void> {
    const date      = event.timestamp.slice(0, 10);
    const hashedIP  = event.ip ? await hashIP(event.ip) : undefined;

    const storedEvent = {
      ...event,
      ip: hashedIP ?? null,
    };

    const pipeline = this.redis.pipeline();
    pipeline.incr(dailyClickKey(event.partnerId, date));
    pipeline.expire(dailyClickKey(event.partnerId, date), DAILY_TTL_SECONDS);
    pipeline.incr(totalClickKey(event.partnerId));
    pipeline.incr(articleClickKey(event.articleSlug, event.partnerId));
    pipeline.lpush(eventListKey(event.partnerId), JSON.stringify(storedEvent));
    pipeline.ltrim(eventListKey(event.partnerId), 0, EVENT_LIST_MAX - 1);
    await pipeline.exec();
  }

  async recordRevenue(partnerId: string, date: string, amountUSD: number): Promise<void> {
    const pipeline = this.redis.pipeline();
    pipeline.incrbyfloat(dailyRevKey(partnerId, date), amountUSD);
    pipeline.expire(dailyRevKey(partnerId, date), DAILY_TTL_SECONDS);
    pipeline.incrbyfloat(totalRevKey(partnerId), amountUSD);
    await pipeline.exec();
  }

  async getDailyStats(partnerId: string, days = 30): Promise<DailyAffiliateStat[]> {
    const dates = Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      return d.toISOString().slice(0, 10);
    });

    const clickKeys   = dates.map((d) => dailyClickKey(partnerId, d));
    const revenueKeys = dates.map((d) => dailyRevKey(partnerId, d));

    const [clickResults, revResults] = await Promise.all([
      this.redis.mget<number[]>(...clickKeys),
      this.redis.mget<number[]>(...revenueKeys),
    ]);

    return dates.map((date, i) => ({
      date,
      clicks:  clickResults[i]  ?? 0,
      revenue: revResults[i]    ?? 0,
    }));
  }

  async getTotalStats(partnerIds: string[]): Promise<Record<string, { clicks: number; revenue: number }>> {
    const clickKeys   = partnerIds.map(totalClickKey);
    const revenueKeys = partnerIds.map(totalRevKey);

    const [clicks, revenues] = await Promise.all([
      this.redis.mget<number[]>(...clickKeys),
      this.redis.mget<number[]>(...revenueKeys),
    ]);

    return Object.fromEntries(
      partnerIds.map((id, i) => [
        id,
        { clicks: clicks[i] ?? 0, revenue: revenues[i] ?? 0 },
      ]),
    );
  }

  async getTopArticles(
    partnerId: string,
    articleSlugs: string[],
    limit = 10,
  ): Promise<Array<{ slug: string; clicks: number }>> {
    if (articleSlugs.length === 0) return [];

    const keys    = articleSlugs.map((s) => articleClickKey(s, partnerId));
    const results = await this.redis.mget<number[]>(...keys);

    return articleSlugs
      .map((slug, i) => ({ slug, clicks: results[i] ?? 0 }))
      .filter((a) => a.clicks > 0)
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, limit);
  }

  async getRecentEvents(partnerId: string, count = 20): Promise<AffiliateClickEvent[]> {
    const raws = await this.redis.lrange(eventListKey(partnerId), 0, count - 1);
    return raws.map((r) => JSON.parse(r as string) as AffiliateClickEvent);
  }

  async getPartnerSummary(partnerId: string, articleSlugs: string[]): Promise<PartnerSummary> {
    const [totals, last30, topArticles] = await Promise.all([
      this.getTotalStats([partnerId]),
      this.getDailyStats(partnerId, 30),
      this.getTopArticles(partnerId, articleSlugs),
    ]);

    return {
      partnerId,
      totalClicks:  totals[partnerId]?.clicks  ?? 0,
      totalRevenue: totals[partnerId]?.revenue ?? 0,
      last7Days:    last30.slice(0, 7),
      last30Days:   last30,
      topArticles,
    };
  }
}
