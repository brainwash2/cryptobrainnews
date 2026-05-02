// src/app/api/cron/broadcast-drain/route.ts
import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { validateVercelCronAuth }         from '../../../../lib/ops/cron-guard';
import { TelegramBroadcaster }            from '../../../../lib/news/telegram';
import { NewsletterService }              from '../../../../lib/news/newsletter';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const unauth = validateVercelCronAuth(req);
  if (unauth) return unauth;

  const results: Record<string, unknown> = {};

  if (process.env.TELEGRAM_BOT_TOKEN) {
    const tg = new TelegramBroadcaster(process.env.TELEGRAM_BOT_TOKEN);
    results['telegram'] = await tg.drainRetries();
  }

  if (process.env.RESEND_API_KEY) {
    const nl = new NewsletterService(process.env.RESEND_API_KEY);
    results['newsletter'] = await nl.drainRetries();
  }

  return NextResponse.json({ ok: true, drains: results, at: new Date().toISOString() });
}
