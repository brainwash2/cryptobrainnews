/**
 * Telegram Auto-Publisher
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAllArticles } from '@/lib/articles';

export const maxDuration = 30;

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cryptobrainnews.com').replace(/\/$/, '');

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!botToken || !channelId) {
    return NextResponse.json({ error: 'Telegram not configured' });
  }

  const articles = await getAllArticles();
  console.log('[Telegram] Total articles fetched:', articles.length);
  if (articles.length > 0) {
    console.log('[Telegram] First article:', {
      title: articles[0].title,
      sourceType: articles[0].sourceType,
      published_on: articles[0].published_on,
      published_on_type: typeof articles[0].published_on,
    });
  }

  // TEMP: no time filter
  const cutoff = 0;
  const fresh = articles.filter(
    a => (a.sourceType === 'editorial' || a.sourceType === 'alpha')
      && a.published_on > cutoff
  );

  console.log('[Telegram] Fresh articles count:', fresh.length);
  if (fresh.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No new articles', debug: { total: articles.length, cutoff } });
  }

  const sent: string[] = [];

  for (const article of fresh.slice(0, 3)) {
    const url = `${BASE}/news/${article.id}`;
    const category = article.categories[0]?.toUpperCase() || 'NEWS';
    const emoji: Record<string, string> = {
      'ALPHA CALL': '⚡', 'BITCOIN': '₿', 'ETHEREUM': '🔷',
      'DEFI': '🌊', 'RWA': '🏦', 'AI-CRYPTO': '🤖',
      'REGULATION': '⚖️', 'INSTITUTIONAL': '🏛️', 'MARKET': '��',
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

    await new Promise(r => setTimeout(r, 1200));
  }

  return NextResponse.json({ sent: sent.length, articles: sent, debug: { total: articles.length, fresh: fresh.length } });
}
