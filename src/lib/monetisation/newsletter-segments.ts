/**
 * lib/monetisation/newsletter-segments.ts
 * Subscriber segmentation for Pro vs Free newsletter sends.
 */

import { Redis }  from '@upstash/redis';

export type NewsletterSegment = 'free' | 'pro' | 'all' | 'engaged' | 'churned_pro';

export interface SubscriberRecord {
  emailHash:       string;
  email:           string;
  subscribedAt:    string;
  segment:         'free' | 'pro';
  confirmedAt?:    string;
  unsubscribedAt?: string;
  tags:            string[];
  openCount:       number;
  lastOpenAt?:     string;
}

export interface SegmentStats {
  segment:     NewsletterSegment;
  count:       number;
  sampleEmails:string[];
}

export interface SendList {
  segment:    NewsletterSegment;
  emails:     string[];
  count:      number;
  generatedAt:string;
}

const SUB_PREFIX      = 'newsletter:sub:';
const SEG_PREFIX      = 'newsletter:segment:';
const OPENS_PREFIX    = 'newsletter:opens:';
const ENGAGED_CUTOFF  = 3;

function subKey(emailHash: string): string { return SUB_PREFIX + emailHash; }
function segKey(segment: string): string   { return SEG_PREFIX + segment; }
function opensKey(emailHash: string): string { return OPENS_PREFIX + emailHash; }

export async function hashEmail(email: string): Promise<string> {
  const data = new TextEncoder().encode(email.toLowerCase().trim());
  const buf  = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export class NewsletterSegmentManager {
  private readonly redis: Redis;

  constructor() {
    this.redis = Redis.fromEnv();
  }

  async addSubscriber(email: string, tags: string[] = []): Promise<SubscriberRecord> {
    const emailHash = await hashEmail(email);
    const existing  = await this.redis.hgetall(subKey(emailHash)) as SubscriberRecord | null;

    if (existing && !existing.unsubscribedAt) {
      return existing;
    }

    const record: SubscriberRecord = {
      emailHash,
      email,
      subscribedAt: new Date().toISOString(),
      segment:      'free',
      tags,
      openCount:    0,
    };

    const pipeline = this.redis.pipeline();
    pipeline.hset(subKey(emailHash), record as unknown as Record<string, unknown>);
    pipeline.sadd(segKey('free'), emailHash);
    pipeline.sadd(segKey('all'),  emailHash);
    await pipeline.exec();

    return record;
  }

  async unsubscribe(email: string): Promise<void> {
    const emailHash = await hashEmail(email);
    const record    = await this.redis.hgetall(subKey(emailHash)) as SubscriberRecord | null;
    if (!record) return;

    const pipeline = this.redis.pipeline();
    pipeline.hset(subKey(emailHash), { ...record, unsubscribedAt: new Date().toISOString() } as unknown as Record<string, unknown>);
    pipeline.srem(segKey('free'),        emailHash);
    pipeline.srem(segKey('pro'),         emailHash);
    pipeline.srem(segKey('all'),         emailHash);
    pipeline.srem(segKey('engaged'),     emailHash);
    pipeline.srem(segKey('churned_pro'), emailHash);
    await pipeline.exec();
  }

  async promoteToProSegment(email: string): Promise<void> {
    const emailHash = await hashEmail(email);
    const pipeline  = this.redis.pipeline();
    pipeline.hset(subKey(emailHash), { segment: 'pro' });
    pipeline.srem(segKey('free'),         emailHash);
    pipeline.srem(segKey('churned_pro'),  emailHash);
    pipeline.sadd(segKey('pro'),          emailHash);
    pipeline.sadd(segKey('all'),          emailHash);
    await pipeline.exec();
  }

  async demoteToFreeSegment(email: string): Promise<void> {
    const emailHash = await hashEmail(email);
    const pipeline  = this.redis.pipeline();
    pipeline.hset(subKey(emailHash), { segment: 'free' });
    pipeline.srem(segKey('pro'),          emailHash);
    pipeline.sadd(segKey('free'),         emailHash);
    pipeline.sadd(segKey('churned_pro'),  emailHash);
    pipeline.sadd(segKey('all'),          emailHash);
    await pipeline.exec();
  }

  async recordOpen(email: string, issueId: string): Promise<void> {
    const emailHash = await hashEmail(email);
    const now       = Date.now();

    const pipeline = this.redis.pipeline();
    pipeline.zadd(opensKey(emailHash), { score: now, member: issueId });
    pipeline.hincrby(subKey(emailHash), 'openCount', 1);
    pipeline.hset(subKey(emailHash), { lastOpenAt: new Date().toISOString() });
    await pipeline.exec();

    await this.updateEngagedStatus(emailHash);
  }

  private async updateEngagedStatus(emailHash: string): Promise<void> {
    const cutoffMs   = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const recentOpens = await this.redis.zcount(opensKey(emailHash), cutoffMs, '+inf');
    const pipeline    = this.redis.pipeline();

    if (recentOpens >= ENGAGED_CUTOFF) {
      pipeline.sadd(segKey('engaged'), emailHash);
    } else {
      pipeline.srem(segKey('engaged'), emailHash);
    }
    await pipeline.exec();
  }

  async getSendList(segment: NewsletterSegment): Promise<SendList> {
    const emailHashes = await this.redis.smembers(segKey(segment));

    const emails: string[] = [];
    const batchSize = 100;

    for (let i = 0; i < emailHashes.length; i += batchSize) {
      const batch = emailHashes.slice(i, i + batchSize);
      const keys  = batch.map(subKey);
      const recs  = await this.redis.mget(...keys) as (SubscriberRecord | null)[];
      for (const rec of recs) {
        if (rec && !rec.unsubscribedAt) emails.push(rec.email);
      }
    }

    return {
      segment,
      emails,
      count:       emails.length,
      generatedAt: new Date().toISOString(),
    };
  }

  async getSegmentStats(): Promise<SegmentStats[]> {
    const segments: NewsletterSegment[] = ['free', 'pro', 'all', 'engaged', 'churned_pro'];

    return Promise.all(
      segments.map(async (segment) => {
        const count   = await this.redis.scard(segKey(segment));
        const samples = await this.redis.srandmember(segKey(segment), 5) as string[];
        const sampleRecs = samples.length > 0
          ? await this.redis.mget(...samples.map(subKey)) as (SubscriberRecord | null)[]
          : [];
        const sampleEmails = sampleRecs
          .filter((r): r is SubscriberRecord => r !== null)
          .map((r) => r.email.replace(/(.{2}).+(@.+)/, '$1***$2'));

        return { segment, count: count ?? 0, sampleEmails };
      }),
    );
  }

  static buildSegmentedContent(
    segment:       'free' | 'pro',
    articleTitle:  string,
    articleSlug:   string,
    summary:       string,
    fullBody:      string,
    csvExportUrl?: string,
  ): { subject: string; previewText: string; htmlSnippet: string } {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cryptobrainnews.com';

    if (segment === 'pro') {
      return {
        subject:     `[Pro] ${articleTitle}`,
        previewText: summary.slice(0, 90),
        htmlSnippet: `
          <div style="background:#00d4ff10;border-left:3px solid #00d4ff;padding:12px 16px;margin-bottom:20px;border-radius:0 8px 8px 0">
            <span style="color:#00d4ff;font-size:11px;font-weight:bold;letter-spacing:2px">PRO MEMBER</span>
          </div>
          <p>${summary}</p>
          <hr style="border:none;border-top:1px solid #1a1a2e;margin:20px 0"/>
          ${fullBody.slice(0, 2000)}
          ${csvExportUrl ? `<p><a href="${csvExportUrl}" style="color:#00d4ff">Download CSV data →</a></p>` : ''}
          <a href="${baseUrl}/news/${articleSlug}" style="color:#00d4ff">Read full article →</a>
        `,
      };
    }

    return {
      subject:     articleTitle,
      previewText: summary.slice(0, 90),
      htmlSnippet: `
        <p>${summary}</p>
        <div style="background:#0d0d1a;border:1px solid #1a1a2e;border-radius:12px;padding:20px;margin:24px 0;text-align:center">
          <p style="color:#00d4ff;font-weight:bold;margin:0 0 8px">🔒 Pro members get the full analysis</p>
          <p style="color:#94a3b8;font-size:13px;margin:0 0 16px">Full article body · On-chain chart data · CSV exports · Ad-free</p>
          <a href="${baseUrl}/pro?upgrade=newsletter" style="background:#00d4ff;color:#0d0d1a;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px">
            Upgrade to Pro — $19/mo
          </a>
        </div>
        <a href="${baseUrl}/news/${articleSlug}" style="color:#00d4ff">Read free summary →</a>
      `,
    };
  }
}
