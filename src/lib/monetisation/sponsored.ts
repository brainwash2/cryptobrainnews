/**
 * lib/monetisation/sponsored.ts
 * Sponsored content slot manager.
 */

import { Redis } from '@upstash/redis';

export type SponsorSlot =
  | 'article-sidebar'
  | 'article-footer'
  | 'category-banner'
  | 'newsletter-footer'
  | 'home-featured';

export interface SponsorRecord {
  id:             string;
  slot:           SponsorSlot;
  advertiser:     string;
  headline:       string;
  body:           string;
  ctaText:        string;
  ctaUrl:         string;
  imageUrl?:      string;
  logoUrl?:       string;
  categories:     string[];
  startsAt:       string;
  endsAt:         string;
  maxImpressions: number;
  priority:       number;
  active:         boolean;
}

export interface SponsorDisplay {
  record:         SponsorRecord;
  impressionKey:  string;
}

const ACTIVE_HASH_KEY  = 'sponsors:active';
const ARCHIVE_LIST_KEY = 'sponsors:archive';
const IMP_PREFIX       = 'sponsors:imp:';

function impressionKey(sponsorId: string): string {
  return IMP_PREFIX + sponsorId;
}

export class SponsoredContentStore {
  private readonly redis: Redis;

  constructor() {
    this.redis = Redis.fromEnv();
  }

  async upsert(record: SponsorRecord): Promise<void> {
    await this.redis.hset(ACTIVE_HASH_KEY, {
      [record.id]: JSON.stringify(record),
    });
  }

  async deactivate(sponsorId: string): Promise<void> {
    const raw = await this.redis.hget<string>(ACTIVE_HASH_KEY, sponsorId);
    if (raw) {
      const record = JSON.parse(raw) as SponsorRecord;
      const finalCount = await this.redis.get<number>(impressionKey(sponsorId));
      await this.redis.lpush(
        ARCHIVE_LIST_KEY,
        JSON.stringify({ ...record, active: false, finalImpressions: finalCount ?? 0 }),
      );
      await this.redis.hdel(ACTIVE_HASH_KEY, sponsorId);
    }
  }

  async getForSlot(slot: SponsorSlot, category?: string): Promise<SponsorDisplay | null> {
    const allRaw = await this.redis.hgetall<Record<string, string>>(ACTIVE_HASH_KEY);
    if (!allRaw) return null;

    const now        = new Date().toISOString();
    const candidates: SponsorRecord[] = [];

    for (const raw of Object.values(allRaw)) {
      const record = JSON.parse(raw) as SponsorRecord;
      if (!record.active)             continue;
      if (record.slot !== slot)       continue;
      if (record.startsAt > now)      continue;
      if (record.endsAt   < now)      continue;
      if (
        record.categories.length > 0 &&
        category &&
        !record.categories.some((c) => c.toLowerCase() === category.toLowerCase())
      ) continue;

      if (record.maxImpressions > 0) {
        const count = await this.redis.get<number>(impressionKey(record.id)) ?? 0;
        if (count >= record.maxImpressions) continue;
      }

      candidates.push(record);
    }

    if (candidates.length === 0) return null;

    candidates.sort((a, b) =>
      b.priority !== a.priority
        ? b.priority - a.priority
        : a.endsAt.localeCompare(b.endsAt),
    );

    const winner = candidates[0];
    return { record: winner, impressionKey: impressionKey(winner.id) };
  }

  async recordImpression(sponsorId: string): Promise<number> {
    return this.redis.incr(impressionKey(sponsorId));
  }

  async listActive(): Promise<SponsorRecord[]> {
    const allRaw = await this.redis.hgetall<Record<string, string>>(ACTIVE_HASH_KEY);
    if (!allRaw) return [];
    return Object.values(allRaw).map((r) => JSON.parse(r) as SponsorRecord);
  }

  async getImpressions(sponsorId: string): Promise<number> {
    return (await this.redis.get<number>(impressionKey(sponsorId))) ?? 0;
  }
}
