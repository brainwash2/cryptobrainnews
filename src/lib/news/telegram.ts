// src/lib/news/telegram.ts
import 'server-only';
import { randomUUID } from 'crypto';
import { Redis } from '@upstash/redis';
import { BroadcastQueue } from './broadcast-queue';
import type { TelegramPayload } from './types';

const TELEGRAM_API = 'https://api.telegram.org';
const MAX_MSG_LENGTH = 4096;
const INTER_MESSAGE_DELAY_MS = 1050;
const RATE_KEY_PREFIX = 'tg:ratelimit:';

export class TelegramBroadcaster {
  private readonly botToken: string;
  private readonly queue: BroadcastQueue;
  private readonly redis: Redis;

  constructor(botToken: string) {
    if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN is required');
    this.botToken = botToken;
    this.queue = new BroadcastQueue();
    this.redis = Redis.fromEnv();
  }

  async send(
    payload: TelegramPayload,
    runId?: string,
  ): Promise<boolean> {
    const id = runId ?? randomUUID();
    const chunks = this.chunkMessage(payload.text, MAX_MSG_LENGTH);

    for (let i = 0; i < chunks.length; i++) {
      const chunkPayload: TelegramPayload = {
        ...payload,
        text: chunks[i],
      };
      try {
        await this.throttledSend(chunkPayload);
        if (i < chunks.length - 1) {
          await new Promise((r) => setTimeout(r, INTER_MESSAGE_DELAY_MS));
        }
      } catch (err) {
        await this.queue.enqueueFailure({
          id: `${id}-chunk${i}`,
          channel: 'telegram',
          payload: chunkPayload,
          attempts: 1,
          firstFailedAt: new Date().toISOString(),
          error: err instanceof Error ? err.message : String(err),
          lastError: '',
        });
        return false;
      }
    }
    return true;
  }

  async drainRetries(): Promise<{ sent: number; requeued: number; deadLettered: number }> {
    return this.queue.drainRetryQueue<TelegramPayload>('telegram', (payload) =>
      this.throttledSend(payload),
    );
  }

  static escapeHTML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  static formatArticleMessage(
    title: string,
    summary: string,
    slug: string,
    tags: string[],
  ): TelegramPayload {
    const tagLine = tags.slice(0, 5).map((t) => `#${t.replace(/\s+/g, '')}`).join(' ');
    const url = `https://cryptobrainnews.com/news/${slug}`;
    const text =
      `📰 <b>${TelegramBroadcaster.escapeHTML(title)}</b>\n\n` +
      `${TelegramBroadcaster.escapeHTML(summary)}\n\n` +
      `${tagLine}\n\n` +
      `<a href="${url}">Read full article →</a>`;

    return { chatId: process.env.TELEGRAM_CHAT_ID ?? '', text, parseMode: 'HTML', disableWebPagePreview: false };
  }

  /**
   * Rate‑limited send: enforces ≤1 msg/sec per chat via Redis NX key.
   * Key `tg:ratelimit:<chatId>` acts as a sliding window mutex with a
   * 1050 ms TTL. Concurrent callers (e.g. across serverless instances)
   * wait for the remaining PTTL before acquiring their own slot.
   */
  private async throttledSend(payload: TelegramPayload): Promise<void> {
    const rateKey = RATE_KEY_PREFIX + payload.chatId;

    // Try to atomically acquire the rate-limit slot
    const acquired = await this.redis.set(rateKey, '1', {
      nx: true,
      px: INTER_MESSAGE_DELAY_MS,
    });

    if (!acquired) {
      // Slot is taken — wait for the remaining TTL then refresh the window
      const pttl = await this.redis.pttl(rateKey);
      await new Promise((r) => setTimeout(r, Math.max(pttl, 0)));
      await this.redis.set(rateKey, '1', { px: INTER_MESSAGE_DELAY_MS });
    }

    await this.sendRaw(payload);
  }

  private async sendRaw(payload: TelegramPayload): Promise<void> {
    const res = await fetch(`${TELEGRAM_API}/bot${this.botToken}/sendMessage`, {
      method: 'POST',
      signal: AbortSignal.timeout(15_000),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: payload.chatId,
        text: payload.text,
        parse_mode: payload.parseMode,
        disable_web_page_preview: payload.disableWebPagePreview ?? false,
      }),
    });

    if (res.status === 429) {
      // Respect Retry‑After header (Telegram returns seconds)
      const retryAfter = Number(res.headers.get('Retry-After') ?? '5');
      console.warn(`[Telegram] 429 rate-limited. Waiting ${retryAfter}s…`);
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      return this.sendRaw(payload);
    }

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Telegram API ${res.status}: ${body}`);
    }
  }

  private chunkMessage(text: string, maxLen: number): string[] {
    if (text.length <= maxLen) return [text];
    const chunks: string[] = [];
    let remaining = text;
    while (remaining.length > maxLen) {
      let cutAt = remaining.lastIndexOf('\n', maxLen);
      if (cutAt < maxLen * 0.5) cutAt = remaining.lastIndexOf(' ', maxLen);
      if (cutAt <= 0) cutAt = maxLen;
      chunks.push(remaining.slice(0, cutAt).trim());
      remaining = remaining.slice(cutAt).trim();
    }
    if (remaining) chunks.push(remaining);
    return chunks;
  }
}
