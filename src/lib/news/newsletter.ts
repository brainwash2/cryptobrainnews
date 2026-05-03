/**
 * lib/news/newsletter.ts
 * Resend-backed newsletter broadcast with:
 *   - Dead-letter queuing on failure (mirrors Telegram strategy)
 *   - Subscriber batching (Resend free tier: 100 emails/day; adjust batch size for Pro)
 *   - Idempotency key per article slug to prevent double-sends on retries
 *   - Unsubscribe link injected automatically
 */
import 'server-only';

import { randomUUID } from 'crypto';
import { BroadcastQueue } from './broadcast-queue';
import type { NewsletterPayload } from './types';

const RESEND_API = 'https://api.resend.com';
const BATCH_SIZE = 90; // stay under Resend free-tier daily limit with headroom
const FROM_ADDRESS = process.env.NEWSLETTER_FROM ?? 'news@cryptobrainnews.com';
const UNSUBSCRIBE_BASE = 'https://cryptobrainnews.com/unsubscribe';

export interface ResendSendRequest {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
  idempotency_key?: string;
}

export interface NewsletterSendJob {
  payload: NewsletterPayload;
  recipients: string[];
  articleSlug: string;  // Used as idempotency key prefix
}

export class NewsletterService {
  private readonly apiKey: string;
  private readonly queue: BroadcastQueue;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error('RESEND_API_KEY is required');
    this.apiKey = apiKey;
    this.queue = new BroadcastQueue();
  }

  /**
   * Broadcast to all recipients in batches.
   * Each batch failure is independently queued for retry.
   * Returns { sent, queued } counts.
   */
  async broadcast(job: NewsletterSendJob): Promise<{ sent: number; queued: number }> {
    const { payload, recipients, articleSlug } = job;
    const batches = this.toBatches(recipients, BATCH_SIZE);
    let sent = 0;
    let queued = 0;

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const idempotencyKey = `${articleSlug}-batch-${batchIndex}`;

      const request: ResendSendRequest = {
        from: FROM_ADDRESS,
        to: batch,
        subject: payload.subject,
        html: this.buildHTML(payload, batch),
        text: this.buildText(payload),
        headers: {
          'List-Unsubscribe': `<${UNSUBSCRIBE_BASE}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
        idempotency_key: idempotencyKey,
      };

      try {
        await this.sendBatch(request);
        sent += batch.length;
      } catch (err) {
        queued += batch.length;
        await this.queue.enqueueFailure<ResendSendRequest>({
          id: `newsletter-${idempotencyKey}-${randomUUID()}`,
          channel: 'newsletter',
          payload: request,
          attempts: 1,
          firstFailedAt: new Date().toISOString(),
          error: err instanceof Error ? err.message : String(err),
          lastError: '',
        });
      }
    }

    return { sent, queued };
  }

  /** Drain the newsletter retry queue. Call from daily pipeline or separate cron. */
  async drainRetries(): Promise<{ sent: number; requeued: number; deadLettered: number }> {
    return this.queue.drainRetryQueue<ResendSendRequest>('newsletter', (req) =>
      this.sendBatch(req),
    );
  }

  private async sendBatch(request: ResendSendRequest): Promise<void> {
    const res = await fetch(`${RESEND_API}/emails`, {
      method: 'POST',
      signal: AbortSignal.timeout(20_000),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        ...(request.idempotency_key
          ? { 'Idempotency-Key': request.idempotency_key }
          : {}),
      },
      body: JSON.stringify(request),
    });

    if (res.status === 429) {
      const retryAfter = Number(res.headers.get('Retry-After') ?? '10');
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      return this.sendBatch(request);
    }

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend API ${res.status}: ${body}`);
    }
  }

  private buildHTML(payload: NewsletterPayload, _recipients: string[]): string {
    // Minimal plain-HTML template — swap for your React Email component in production
    const tagPills = payload.tags
      .slice(0, 6)
      .map((t) => `<span style="background:#1a1a2e;color:#00d4ff;padding:2px 8px;border-radius:4px;font-size:12px;margin-right:4px">${t}</span>`)
      .join('');

    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#0d0d1a;color:#e0e0e0;font-family:system-ui,sans-serif;margin:0;padding:0">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:32px 16px">
    <tr><td>
      <p style="color:#00d4ff;font-size:12px;letter-spacing:2px;text-transform:uppercase">CryptoBrainNews Daily</p>
      <h1 style="font-size:24px;line-height:1.3;color:#ffffff;margin:8px 0 16px">${payload.articleTitle}</h1>
      <p style="font-size:15px;line-height:1.6;color:#b0b0c0">${payload.summary}</p>
      <div style="margin:20px 0">${tagPills}</div>
      <a href="${payload.articleUrl}" style="display:inline-block;background:#00d4ff;color:#0d0d1a;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px">Read Full Article →</a>
      <hr style="border:none;border-top:1px solid #1a1a2e;margin:32px 0">
      <p style="font-size:11px;color:#555">You're receiving this because you subscribed to CryptoBrainNews.
        <a href="${UNSUBSCRIBE_BASE}?email={{email}}" style="color:#555">Unsubscribe</a>
      </p>
    </td></tr>
  </table>
</body>
</html>`;
  }

  private buildText(payload: NewsletterPayload): string {
    return [
      `CryptoBrainNews Daily`,
      ``,
      payload.articleTitle,
      ``,
      payload.summary,
      ``,
      `Tags: ${payload.tags.join(', ')}`,
      ``,
      `Read full article: ${payload.articleUrl}`,
      ``,
      `Unsubscribe: ${UNSUBSCRIBE_BASE}`,
    ].join('\n');
  }

  private toBatches<T>(arr: T[], size: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      batches.push(arr.slice(i, i + size));
    }
    return batches;
  }
}
