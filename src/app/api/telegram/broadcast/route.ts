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
  const fresh = articles.filter(a => a.sourceType === 'editorial' || a.sourceType === 'alpha');

  if (fresh.length === 0) {
    return NextResponse.json({ sent: 0, debug: { total: articles.length, fresh: 0 } });
  }

  const sent: string[] = [];
  const errors: any[] = [];

  for (const article of fresh.slice(0, 1)) { // try just one for debugging
    const url = `${BASE}/news/${article.id}`;
    const category = article.categories[0]?.toUpperCase() || 'NEWS';
    const emoji: Record<string, string> = {
      'ALPHA CALL': '⚡', 'BITCOIN': '₿', 'ETHEREUM': '🔷',
      'DEFI': '🌊', 'RWA': '🏦', 'AI-CRYPTO': '🤖',
      'REGULATION': '⚖️', 'INSTITUTIONAL': '🏛️', 'MARKET': '📈',
    };
    const icon = emoji[category] || '📰';

    // Truncate body safely
    const bodyText = (article.body || '').slice(0, 200);
    const escapedBody = bodyText.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');

    const text = [
      `${icon} *${article.title}*`,
      '',
      escapedBody + '…',
      '',
      `[Read full article](${url})`,
      '',
      `\\#${category.toLowerCase().replace(/\s+/g, '')} \\#cryptobrainnews`,
    ].join('\n');

    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: channelId,
          text,
          parse_mode: 'MarkdownV2',
          disable_web_page_preview: false,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        sent.push(article.title);
      } else {
        errors.push({ article: article.title, error: data });
      }
    } catch (e: any) {
      errors.push({ article: article.title, error: e.message });
    }
  }

  return NextResponse.json({
    sent: sent.length,
    articles: sent,
    debug: { total: articles.length, fresh: fresh.length },
    errors: errors,
  });
}
