/**
 * lib/ops/alerts.ts
 * Ops alerting layer — sends structured alerts to the ops Telegram channel.
 */

import { Redis } from '@upstash/redis';

const TELEGRAM_API = 'https://api.telegram.org';
const DEDUP_TTL_S  = 60 * 60;

interface PipelineAlertData {
  stage:             string;
  runId:             string;
  articlesPublished: number;
  fatalErrors:       number;
  deadLetterCount:   number;
}
interface HealthAlertData {
  system:  string;
  message: string;
  latency?: number;
}
interface DeadLetterAlertData {
  count:   number;
  channel: string;
}

export class OpsAlerter {
  private readonly botToken: string;
  private readonly chatId:   string;
  private readonly redis:    Redis;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN   ?? '';
    this.chatId   = process.env.TELEGRAM_OPS_CHAT_ID ?? process.env.TELEGRAM_CHAT_ID ?? '';
    this.redis    = Redis.fromEnv();
  }

  private get configured(): boolean {
    return Boolean(this.botToken && this.chatId);
  }

  async pipelineAlert(data: PipelineAlertData): Promise<void> {
    const icon = data.stage === 'failed' ? '🔴' : '⚠️';
    const text =
      `${icon} <b>Pipeline Alert</b>\n` +
      `Run: ${data.runId.slice(0, 8)}\n` +
      `Stage: ${data.stage}\n` +
      `Published: ${data.articlesPublished}\n` +
      `Fatal: ${data.fatalErrors}\n` +
      `Dead-letters: ${data.deadLetterCount}`;
    await this.sendDeduped('alert:pipeline', text);
  }

  async healthAlert(data: HealthAlertData): Promise<void> {
    const text =
      `🚨 <b>Health Alert — ${data.system}</b>\n` +
      `${data.message}` +
      (data.latency !== undefined ? `\nLatency: ${data.latency}ms` : '');
    await this.sendDeduped(`alert:health:${data.system}`, text);
  }

  async deadLetterAlert(data: DeadLetterAlertData): Promise<void> {
    const text =
      `📭 <b>Dead-Letter Accumulation — ${data.channel}</b>\n` +
      `Count: <b>${data.count}</b> pending items\n` +
      `Action required: drain or inspect queue`;
    await this.sendDeduped(`alert:deadletter:${data.channel}`, text);
  }

  async recoveryNotice(system: string): Promise<void> {
    await this.sendRaw(`✅ <b>Recovery — ${system}</b>\nSystem is healthy again.`);
  }

  private async sendDeduped(dedupKey: string, text: string): Promise<void> {
    const alreadySent = await this.redis.get(dedupKey).catch(() => null);
    if (alreadySent) return;
    await this.redis.set(dedupKey, '1', { ex: DEDUP_TTL_S }).catch(() => null);
    void this.sendRaw(text);
  }

  private async sendRaw(text: string): Promise<void> {
    if (!this.configured) return;
    try {
      await fetch(`${TELEGRAM_API}/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        signal: AbortSignal.timeout(10_000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.chatId,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });
    } catch {
      // Silent fail — alerter must never propagate
    }
  }
}
