/**
 * lib/news/broadcast-queue.ts
 * Redis-backed dead-letter queue for Telegram and Newsletter broadcasts.
 *
 * On first failure:    item pushed to retry list with attempt count = 1
 * On retry (cron):     up to MAX_RETRIES attempts with exponential backoff check
 * After MAX_RETRIES:   item moved to dead-letter list (permanent, inspectable)
 *
 * Queue keys:
 *   broadcast:retry:<channel>   LIST  – pending retries (LPUSH/RPOP)
 *   broadcast:dead:<channel>    LIST  – permanent failures (LPUSH only)
 *   broadcast:inflight:<id>     STRING – per-item lock (prevents double-send)
 *
 * Designed to be drained by a separate cron job or at the end of the
 * daily pipeline run via drainRetryQueue().
 */

import { Redis } from '@upstash/redis';

export type BroadcastChannel = 'telegram' | 'newsletter';

export interface BroadcastJob<T = unknown> {
  id: string;           // uuid-v4 from the original pipeline run
  channel: BroadcastChannel;
  payload: T;
  attempts: number;
  firstFailedAt: string;
  lastFailedAt: string;
  lastError: string;
}

const MAX_RETRIES = 4;
const INFLIGHT_TTL_SECONDS = 120; // prevent double-send within 2 min

function retryKey(channel: BroadcastChannel): string  { return `broadcast:retry:${channel}`; }
function deadKey(channel: BroadcastChannel): string   { return `broadcast:dead:${channel}`; }
function inflightKey(id: string): string               { return `broadcast:inflight:${id}`; }

export class BroadcastQueue {
  private readonly redis: Redis;

  constructor() {
    this.redis = Redis.fromEnv();
  }

  /**
   * Push a failed broadcast onto the retry queue.
   * If the job has already hit MAX_RETRIES, send straight to dead-letter.
   */
  async enqueueFailure<T>(
    job: Omit<BroadcastJob<T>, 'lastFailedAt'> & { error: string },
  ): Promise<void> {
    const updated: BroadcastJob<T> = {
      ...job,
      attempts: job.attempts,
      lastFailedAt: new Date().toISOString(),
      lastError: job.error,
    };

    if (updated.attempts >= MAX_RETRIES) {
      await this.redis.lpush(deadKey(job.channel), JSON.stringify(updated));
    } else {
      await this.redis.lpush(retryKey(job.channel), JSON.stringify(updated));
    }
  }

  /**
   * Drain the retry queue for a given channel.
   * Calls sendFn for each job; on success removes from queue, on failure
   * re-enqueues with incremented attempt count.
   *
   * Returns counts for observability.
   */
  async drainRetryQueue<T>(
    channel: BroadcastChannel,
    sendFn: (payload: T) => Promise<void>,
  ): Promise<{ sent: number; requeued: number; deadLettered: number }> {
    const counts = { sent: 0, requeued: 0, deadLettered: 0 };

    // Drain entire queue in one pass (snapshot length to avoid infinite loop)
    const length = await this.redis.llen(retryKey(channel));
    if (length === 0) return counts;

    for (let i = 0; i < length; i++) {
      const raw = await this.redis.rpop<string>(retryKey(channel));
      if (!raw) break;

      let job: BroadcastJob<T>;
      try {
        job = JSON.parse(raw) as BroadcastJob<T>;
      } catch {
        // Malformed entry – drop it
        continue;
      }

      // Idempotency lock: skip if another worker is processing this id
      const locked = await this.redis.set(inflightKey(job.id), '1', {
        nx: true,
        ex: INFLIGHT_TTL_SECONDS,
      });
      if (!locked) continue;

      try {
        await sendFn(job.payload);
        counts.sent += 1;
        // Success – do NOT re-enqueue; inflight key expires naturally
      } catch (err) {
        counts.requeued += 1;
        const nextAttempts = job.attempts + 1;
        if (nextAttempts >= MAX_RETRIES) counts.deadLettered += 1;

        await this.enqueueFailure<T>({
          ...job,
          attempts: nextAttempts,
          error: err instanceof Error ? err.message : String(err),
        });
        // Release inflight lock so retry can proceed after backoff
        await this.redis.del(inflightKey(job.id));
      }
    }

    return counts;
  }

  /** Inspect dead-letter items (for dashboard/alerting). */
  async peekDeadLetters(channel: BroadcastChannel, count = 20): Promise<BroadcastJob[]> {
    const items = await this.redis.lrange(deadKey(channel), 0, count - 1);
    return items.map((raw) => JSON.parse(raw as string) as BroadcastJob);
  }

  /** Count pending retries. Useful for health-check endpoints. */
  async pendingCount(channel: BroadcastChannel): Promise<number> {
    return this.redis.llen(retryKey(channel));
  }
}
