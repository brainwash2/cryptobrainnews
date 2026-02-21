import { getAllArticles } from '@/lib/articles';

export async function GET() {
  const articles = await getAllArticles();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cryptobrainnews.com';

  const items = articles.slice(0, 20).map((article) => {
    const pubDate = new Date(article.published_on * 1000).toUTCString();
    const link = article.url.startsWith('http')
      ? article.url
      : `${siteUrl}/news/${article.id}`;

    return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="false">${article.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${article.body?.slice(0, 300) || article.title}]]></description>
      <category>${article.categories[0] || 'General'}</category>
      <source url="${siteUrl}/feed.xml">CryptoBrainNews</source>
    </item>`;
  });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CryptoBrainNews</title>
    <link>${siteUrl}</link>
    <description>Institutional-grade crypto intelligence and DeFi analytics</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items.join('')}
  </channel>
</rss>`;

  return new Response(rss.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=600',
    },
  });
}
