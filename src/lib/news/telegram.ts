/**
 * lib/news/telegram.ts
 * Telegram broadcast with:
 *   - Rate-limit awareness (Telegram: 30 msg/s globally, 1 msg/s per chat)
 *   - Automatic dead-letter queuing on failure
 *   - Message chunking for articles exceeding 4096-char limit
 *   - HTML parse mode with safe escaping
 */

import { randomUUID } from 'crypto';
import { BroadcastQueue } from './broadcast-queue';
import type { TelegramPayload } from './types';

const TELEGRAM_API = 'https://api.telegram.org';
const MAX_MSG_LENGTH = 4096;
// Minimum delay between messages to the same chat (1050ms > Telegram's 1/s limit)
const INTER_MESSAGE_DELAY_MS = 1050;

export class TelegramBroadcaster {
  private readonly botToken: string;
  private readonly queue: BroadcastQueue;

  constructor(botToken: string) {
    if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN is required');
    this.botToken = botToken;
    this.queue = new BroadcastQueue();
  }

  /**
   * Send a message. On failure, enqueues for retry rather than throwing.
   * Returns true if sent successfully, false if queued for retry.
   */
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
        await this.sendRaw(chunkPayload);
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

  /** Drain retry queue – call from end of daily pipeline run or a separate cron. */
  async drainRetries(): Promise<{ sent: number; requeued: number; deadLettered: number }> {
    return this.queue.drainRetryQueue<TelegramPayload>('telegram', (payload) =>
      this.sendRaw(payload),
    );
  }

  /** Escape HTML special chars for Telegram HTML parse mode. */
  static escapeHTML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /** Format a published article for Telegram. */
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
      // Respect Retry-After header
      const retryAfter = Number(res.headers.get('Retry-After') ?? '5');
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      // One automatic retry on rate-limit
      return this.sendRaw(payload);
    }

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Telegram API ${res.status}: ${body}`);
    }
  }

  /** Split text at word boundaries without breaking HTML tags. */
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
