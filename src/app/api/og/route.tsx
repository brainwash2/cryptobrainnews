/**
 * app/api/og/route.tsx
 * Edge OG image generation for news articles, category pages, and the homepage.
 *
 * Usage:
 *   /api/og?slug=bitcoin-on-chain-analysis-april-2026   → article OG
 *   /api/og?category=DeFi                               → category OG
 *   /api/og                                             → homepage OG
 *
 * Caching:
 *   - Vercel CDN: immutable=true, s-maxage=86400 (1 day) per slug
 *   - Redis: article metadata cached 24 hr (only meta, not image bytes)
 *   - Generated image is cached by Vercel CDN via Cache-Control
 *
 * Design tokens:
 *   Background : #0d0d1a  (brand dark)
 *   Accent     : #00d4ff  (brand cyan)
 *   Text       : #ffffff
 *   Sentiment  : bullish=#22c55e  bearish=#ef4444  neutral=#94a3b8
 */

import { ImageResponse } from 'next/og';
import { type NextRequest } from 'next/server';
import { PageCache }          from '../../../lib/news/page-cache';
import { getArticleBySlug }   from '../../../lib/news/sanity-queries';
import type { ArticleCard }   from '../../../lib/news/sanity-queries';

export const runtime = 'edge';

const WIDTH  = 1200;
const HEIGHT = 630;

const SENTIMENT_COLOR: Record<string, string> = {
  bullish: '#22c55e',
  bearish: '#ef4444',
  neutral: '#94a3b8',
};

const cache = new PageCache();

// ─── Article metadata fetcher (cached 24 hr) ──────────────────────────────────

async function getOGMeta(slug: string): Promise<ArticleCard | null> {
  const { data } = await cache.getOrSet(
    'ogMeta',
    `slug=${slug}`,
    () => getArticleBySlug(slug) as Promise<ArticleCard | null>,
  );
  return data;
}

// ─── Image templates ──────────────────────────────────────────────────────────

function ArticleTemplate({
  title,
  metaDescription,
  category,
  tags,
  sentiment,
  publishedAt,
}: Pick<ArticleCard, 'title' | 'metaDescription' | 'category' | 'tags' | 'sentiment' | 'publishedAt'>) {
  const sentimentColor = SENTIMENT_COLOR[sentiment] ?? SENTIMENT_COLOR['neutral'];
  const date = new Date(publishedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const visibleTags = tags.slice(0, 4);

  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        background: '#0d0d1a',
        display: 'flex',
        flexDirection: 'column',
        padding: '56px 64px',
        fontFamily: 'system-ui, sans-serif',
        position: 'relative',
      }}
    >
      {/* Top accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: '#00d4ff', display: 'flex' }} />

      {/* Brand + category row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
        <span style={{ color: '#00d4ff', fontSize: 20, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>
          CryptoBrainNews
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: sentimentColor, display: 'flex' }} />
          <span style={{ color: '#94a3b8', fontSize: 16, textTransform: 'uppercase', letterSpacing: 2 }}>
            {category}
          </span>
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-start',
        }}
      >
        <h1
          style={{
            color: '#ffffff',
            fontSize: title.length > 60 ? 40 : 52,
            fontWeight: 800,
            lineHeight: 1.2,
            margin: 0,
            maxWidth: 900,
          }}
        >
          {title}
        </h1>
      </div>

      {/* Description */}
      <p
        style={{
          color: '#94a3b8',
          fontSize: 22,
          lineHeight: 1.5,
          margin: '24px 0',
          maxWidth: 860,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {metaDescription}
      </p>

      {/* Footer: tags + date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {visibleTags.map((tag) => (
            <span
              key={tag}
              style={{
                background: 'rgba(0,212,255,0.1)',
                border: '1px solid rgba(0,212,255,0.3)',
                color: '#00d4ff',
                fontSize: 14,
                padding: '4px 14px',
                borderRadius: 20,
                display: 'flex',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
        <span style={{ color: '#555', fontSize: 16 }}>{date}</span>
      </div>

      {/* Bottom border */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'rgba(0,212,255,0.2)', display: 'flex' }} />
    </div>
  );
}

function CategoryTemplate({ category }: { category: string }) {
  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        background: 'linear-gradient(135deg, #0d0d1a 0%, #111128 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: '#00d4ff', display: 'flex' }} />
      <span style={{ color: '#00d4ff', fontSize: 18, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 24, display: 'flex' }}>
        CryptoBrainNews
      </span>
      <h1 style={{ color: '#ffffff', fontSize: 80, fontWeight: 900, margin: 0 }}>{category}</h1>
      <p style={{ color: '#94a3b8', fontSize: 24, marginTop: 20 }}>Data-first crypto intelligence</p>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'rgba(0,212,255,0.2)', display: 'flex' }} />
    </div>
  );
}

function DefaultTemplate() {
  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        background: '#0d0d1a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: '#00d4ff', display: 'flex' }} />
      <span style={{ color: '#00d4ff', fontSize: 22, letterSpacing: 5, textTransform: 'uppercase', marginBottom: 32, display: 'flex' }}>
        CryptoBrainNews
      </span>
      <h1 style={{ color: '#ffffff', fontSize: 64, fontWeight: 900, margin: 0, textAlign: 'center', maxWidth: 900 }}>
        Data-first crypto intelligence
      </h1>
      <p style={{ color: '#94a3b8', fontSize: 26, marginTop: 24 }}>
        On-chain analysis · Market news · DeFi insights
      </p>
    </div>
  );
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<ImageResponse | Response> {
  const slug     = req.nextUrl.searchParams.get('slug')     ?? '';
  const category = req.nextUrl.searchParams.get('category') ?? '';

  try {
    if (slug) {
      const article = await getOGMeta(slug);
      if (!article) {
        return new Response('Article not found', { status: 404 });
      }
      return new ImageResponse(
        <ArticleTemplate
          title={article.title}
          metaDescription={article.metaDescription}
          category={article.category}
          tags={article.tags}
          sentiment={article.sentiment}
          publishedAt={article.publishedAt}
        />,
        {
          width: WIDTH,
          height: HEIGHT,
          headers: {
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
          },
        },
      );
    }

    if (category) {
      return new ImageResponse(
        <CategoryTemplate category={category} />,
        {
          width: WIDTH,
          height: HEIGHT,
          headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
        },
      );
    }

    return new ImageResponse(
      <DefaultTemplate />,
      {
        width: WIDTH,
        height: HEIGHT,
        headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
      },
    );
  } catch (err) {
    console.error('[og-route] error', { slug, category, err });
    return new Response('Failed to generate image', { status: 500 });
  }
}
