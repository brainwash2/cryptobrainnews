/**
 * lib/social/scheduler.ts
 * Redis-backed social post scheduler.
 *
 * Design:
 *   - Posts are stored in a sorted set keyed by Unix timestamp (scheduled time).
 *   - A cron job (Vercel Cron or external) calls processDueJobs() every minute.
 *   - Each job carries the full payload so the cron worker is stateless.
 *   - Supports Telegram, Twitter thread, and future channels via discriminated union.
 *
 * Redis keys:
 *   social:schedule          ZSET  – score = Unix ms, member = job JSON
 *   social:published:<id>    STRING – mark completed jobs (TTL 30d)
 *   social:failed:<id>       STRING – mark permanently failed jobs (TTL 7d)
 *
 * Concurrency:
 *   processDueJobs() acquires a short lock (SET NX) so parallel cron
 *   invocations don't double-publish.
 */

import { Redis }   from '@upstash/redis';
import { randomUUID } from 'crypto';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ScheduledChannel = 'twitter_thread' | 'telegram' | 'newsletter';

interface BaseJob {
  id:           string;
  channel:      ScheduledChannel;
  scheduledAt:  number; // Unix ms
  createdAt:    string; // ISO-8601
  pipelineRunId:string;
  articleSlug:  string;
  retries:      number;
}

export interface TwitterThreadJob extends BaseJob {
  channel: 'twitter_thread';
  payload: {
    title:     string;
    slug:      string;
    summary:   string;
    keyPoints: string[];
    keyStats:  Array<{
      metric:    string;
      value:     string;
      context:   string;
      source:    string;
      direction: 'up' | 'down' | 'neutral';
    }>;
    tags:      string[];
    category:  string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
  };
}

export interface TelegramJob extends BaseJob {
  channel: 'telegram';
  payload: {
    chatId:    string;
    text:      string;
    parseMode: 'HTML' | 'Markdown';
  };
}

export type ScheduledJob = TwitterThreadJob | TelegramJob;

export interface ScheduleResult {
  jobId:       string;
  scheduledAt: number;
  channel:     ScheduledChannel;
}

export interface ProcessResult {
  processed: number;
  succeeded: number;
  failed:    number;
  skipped:   number; // already published
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SCHEDULE_KEY         = 'social:schedule';
const PUBLISHED_PREFIX     = 'social:published:';
const FAILED_PREFIX        = 'social:failed:';
const PROCESS_LOCK_KEY     = 'social:process:lock';
const PROCESS_LOCK_TTL_MS  = 55_000;   // Lock held for up to 55 s
const MAX_JOB_RETRIES      = 3;
const PUBLISHED_TTL_S      = 60 * 60 * 24 * 30; // 30 days
const FAILED_TTL_S         = 60 * 60 * 24 * 7;  // 7 days
const BATCH_SIZE           = 20; // Max jobs to process per cron tick

// ─── Optimal posting windows (UTC) — from social media research ───────────────
// Best engagement for crypto content: 13:00–15:00 UTC and 20:00–22:00 UTC

export function nextOptimalPostTime(nowMs = Date.now()): number {
  const now      = new Date(nowMs);
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const windows = [
    Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth(), todayUTC.getUTCDate(), 13, 0),
    Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth(), todayUTC.getUTCDate(), 20, 0),
    // Tomorrow's windows as fallback
    Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth(), todayUTC.getUTCDate() + 1, 13, 0),
    Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth(), todayUTC.getUTCDate() + 1, 20, 0),
  ];

  // Return first window that is at least 5 minutes in the future
  const buffer = 5 * 60 * 1000;
  return windows.find((w) => w > nowMs + buffer) ?? windows[windows.length - 1];
}

// ─── Scheduler class ──────────────────────────────────────────────────────────

export class SocialScheduler {
  private readonly redis: Redis;

  constructor() {
    this.redis = Redis.fromEnv();
  }

  /**
   * Schedule a job for the next optimal posting window.
   * Pass scheduledAt explicitly to override (e.g. for immediate dispatch).
   */
  async schedule(
    job: Omit<ScheduledJob, 'id' | 'createdAt' | 'retries' | 'scheduledAt'>,
    scheduledAt?: number,
  ): Promise<ScheduleResult> {
    const id        = randomUUID();
    const postAt    = scheduledAt ?? nextOptimalPostTime();

    const fullJob: ScheduledJob = {
      ...job,
      id,
      createdAt:   new Date().toISOString(),
      scheduledAt: postAt,
      retries:     0,
    } as ScheduledJob;

    await this.redis.zadd(SCHEDULE_KEY, {
      score:  postAt,
      member: JSON.stringify(fullJob),
    });

    return { jobId: id, scheduledAt: postAt, channel: job.channel };
  }

  /**
   * Process all jobs whose scheduledAt <= now.
   * Should be called by a cron handler at /api/cron/social.
   * Acquires a distributed lock to prevent concurrent processing.
   */
  async processDueJobs(
    handlers: Partial<Record<ScheduledChannel, (job: ScheduledJob) => Promise<void>>>,
  ): Promise<ProcessResult> {
    const result: ProcessResult = { processed: 0, succeeded: 0, failed: 0, skipped: 0 };

    // Distributed lock — prevents double-processing on Vercel's multi-region
    const locked = await this.redis.set(PROCESS_LOCK_KEY, '1', {
      nx: true,
      px: PROCESS_LOCK_TTL_MS,
    });
    if (!locked) return result; // Another worker is running

    try {
      const now    = Date.now();
      // Upstash Redis v2: zrange with byScore: true
      const rawJobs = await this.redis.zrange(SCHEDULE_KEY, 0, now, {
        byScore: true,
        count:   BATCH_SIZE,
        offset:  0,
      });

      for (const raw of rawJobs) {
        const job = JSON.parse(raw as string) as ScheduledJob;
        result.processed += 1;

        // Idempotency: skip already-published jobs
        const alreadyDone = await this.redis.exists(PUBLISHED_PREFIX + job.id);
        if (alreadyDone) {
          result.skipped += 1;
          await this.redis.zrem(SCHEDULE_KEY, raw);
          continue;
        }

        const handler = handlers[job.channel];
        if (!handler) {
          result.skipped += 1;
          continue;
        }

        try {
          await handler(job);
          await this.redis.set(PUBLISHED_PREFIX + job.id, '1', { ex: PUBLISHED_TTL_S });
          await this.redis.zrem(SCHEDULE_KEY, raw);
          result.succeeded += 1;
        } catch (err) {
          result.failed += 1;
          const nextRetry = job.retries + 1;

          if (nextRetry >= MAX_JOB_RETRIES) {
            // Permanent failure
            await this.redis.set(
              FAILED_PREFIX + job.id,
              JSON.stringify({ job, error: String(err), failedAt: new Date().toISOString() }),
              { ex: FAILED_TTL_S },
            );
            await this.redis.zrem(SCHEDULE_KEY, raw);
          } else {
            // Re-schedule with exponential backoff
            const backoffMs  = Math.pow(2, nextRetry) * 60 * 1000; // 2m, 4m, 8m
            const retryAt    = Date.now() + backoffMs;
            const updatedJob = { ...job, retries: nextRetry, scheduledAt: retryAt };
            await this.redis.zrem(SCHEDULE_KEY, raw);
            await this.redis.zadd(SCHEDULE_KEY, {
              score:  retryAt,
              member: JSON.stringify(updatedJob),
            });
          }
        }
      }
    } finally {
      await this.redis.del(PROCESS_LOCK_KEY);
    }

    return result;
  }

  /** Peek at upcoming scheduled jobs (for dashboard). */
  async upcoming(limit = 20): Promise<ScheduledJob[]> {
    // Upstash Redis v2: zrange with byScore: true, min=Date.now(), max=+inf
    const raws = await this.redis.zrange(SCHEDULE_KEY, Date.now(), '+inf', {
      byScore: true,
      count:   limit,
      offset:  0,
    });
    return raws.map((r: unknown) => JSON.parse(r as string) as ScheduledJob);
  }

  /** Count pending jobs by channel. */
  async pendingCounts(): Promise<Record<ScheduledChannel, number>> {
    // Get all members without scores
    const all = await this.redis.zrange(SCHEDULE_KEY, 0, -1);
    const counts: Record<ScheduledChannel, number> = {
      twitter_thread: 0,
      telegram:       0,
      newsletter:     0,
    };
    for (const raw of all) {
      const job = JSON.parse(raw as string) as ScheduledJob;
      counts[job.channel] = (counts[job.channel] ?? 0) + 1;
    }
    return counts;
  }
}
