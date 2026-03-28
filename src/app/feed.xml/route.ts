import { getAllArticles } from '@/lib/articles';

export const revalidate = 3600;
export const dynamic = 'force-static';

export async function GET() {
  const BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cryptobrainnews.com').replace(/\/$/, '');

  const articles = await getAllArticles().catch(() => []);

  // Only editorial articles in our RSS — wire articles point to external sources
  const editorial = articles
    .filter(a => a.sourceType === 'editorial' || a.sourceType === 'alpha')
    .slice(0, 50);

  const items = editorial.map(article => {
    const url = `${BASE}/news/${article.id}`;
    const pubDate = new Date(article.published_on * 1000).toUTCString();
    const category = article.categories[0] || 'Crypto';
    const description = article.body.slice(0, 300).replace(/[<>&'"]/g, c =>
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] || c)
    );
    const title = article.title.replace(/[<>&'"]/g, c =>
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] || c)
    );

    return `
    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}...</description>
      <category>${category}</category>
      <author>editorial@cryptobrainnews.com (CryptoBrain Editorial)</author>
      ${article.image ? `<enclosure url="${article.image}" type="image/jpeg" length="0"/>` : ''}
      <media:content url="${article.image || ''}" medium="image"/>
    </item>`.trim();
  }).join('\n    ');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>CryptoBrainNews — Institutional Crypto Intelligence</title>
    <link>${BASE}</link>
    <description>Institutional-grade crypto intelligence, DeFi data, and on-chain analytics.</description>
    <language>en-US</language>
    <copyright>Copyright ${new Date().getFullYear()} CryptoBrainNews</copyright>
    <managingEditor>editorial@cryptobrainnews.com (CryptoBrain Editorial)</managingEditor>
    <webMaster>tech@cryptobrainnews.com</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>60</ttl>
    <image>
      <url>${BASE}/icon-192.png</url>
      <title>CryptoBrainNews</title>
      <link>${BASE}</link>
    </image>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
