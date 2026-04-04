/**
 * Telegram Auto-Publisher
 * Runs every 30 min via Vercel Cron.
 * Checks for articles published in the last 30 min, posts to Telegram channel.
 *
 * Setup:
 * 1. Create a Telegram bot via @BotFather → get BOT_TOKEN
 * 2. Create a Telegram channel, add bot as admin
 * 3. Get CHANNEL_ID: forward a message from channel to @userinfobot
 * 4. Add to env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL_ID
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAllArticles } from '@/lib/articles';

export const maxDuration = 30;

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cryptobrainnews.com').replace(/\/$/, '');

export async function GET(req: NextRequest) {
  // Vercel Cron sends Authorization header
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!botToken || !channelId) {
    return NextResponse.json({ error: 'Telegram not configured' });
  }

  // TEMPORARY: Disable the 35‑minute filter for testing – will send the most recent article.
  // Revert to original after test: const cutoff = Math.floor(Date.now() / 1000) - 35 * 60;
  const cutoff = 0; // sends any article regardless of publish time
  const articles = await getAllArticles();
  const fresh = articles.filter(
    a => (a.sourceType === 'editorial' || a.sourceType === 'alpha')
      && a.published_on > cutoff
  );

  if (fresh.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No new articles' });
  }

  const sent: string[] = [];

  for (const article of fresh.slice(0, 3)) { // max 3 per run
    const url = `${BASE}/news/${article.id}`;
    const category = article.categories[0]?.toUpperCase() || 'NEWS';
    const emoji: Record<string, string> = {
      'ALPHA CALL': '⚡', 'BITCOIN': '₿', 'ETHEREUM': '🔷',
      'DEFI': '🌊', 'RWA': '🏦', 'AI-CRYPTO': '🤖',
      'REGULATION': '⚖️', 'INSTITUTIONAL': '🏛️', 'MARKET': '📈',
    };
    const icon = emoji[category] || '📰';

    const text = [
      `${icon} *${article.title}*`,
      '',
      article.body.slice(0, 200).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&') + '…',
      '',
      `[Read full article](${url})`,
      '',
      `\\#${category.toLowerCase().replace(/\s+/g, '')} \\#cryptobrainnews`,
    ].join('\n');

    try {
      const res = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: channelId,
            text,
            parse_mode: 'MarkdownV2',
            disable_web_page_preview: false,
          }),
        }
      );

      if (res.ok) {
        sent.push(article.title);
      } else {
        const err = await res.json();
        console.error('[Telegram] Send failed:', err);
      }
    } catch (e: any) {
      console.error('[Telegram] Error:', e.message);
    }

    // Rate limit: 1 message/second
    await new Promise(r => setTimeout(r, 1200));
  }

  return NextResponse.json({ sent: sent.length, articles: sent });
}
