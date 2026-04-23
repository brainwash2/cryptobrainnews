/**
 * app/api/cron/broadcast-drain/route.ts
 * Drains Telegram + Newsletter retry queues every 15 minutes.
 * Handles transient failures from the daily pipeline run.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { TelegramBroadcaster }            from '../../../../lib/news/telegram';
import { NewsletterService }              from '../../../../lib/news/newsletter';

const CRON_SECRET = process.env.CRON_SECRET ?? '';

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (req.headers.get('authorization') !== `Bearer ${CRON_SECRET}` || !CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const results: Record<string, unknown> = {};

  // Telegram drain
  if (process.env.TELEGRAM_BOT_TOKEN) {
    const tg         = new TelegramBroadcaster(process.env.TELEGRAM_BOT_TOKEN);
    results['telegram'] = await tg.drainRetries();
  }

  // Newsletter drain
  if (process.env.RESEND_API_KEY) {
    const nl            = new NewsletterService(process.env.RESEND_API_KEY);
    results['newsletter'] = await nl.drainRetries();
  }

  return NextResponse.json({ ok: true, drains: results, at: new Date().toISOString() });
}
