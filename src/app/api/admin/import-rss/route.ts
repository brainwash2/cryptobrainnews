/**
 * RSS-to-Sanity Importer
 * POST /api/admin/import-rss
 * Body: { feedUrl: string, category: string, dryRun?: boolean }
 *
 * SCHEDULING via Vercel Cron — add to vercel.json:
 * { "crons": [{ "path": "/api/admin/import-rss-cron", "schedule": "0 * * * *" }] }
 * Then create /api/admin/import-rss-cron/route.ts that POSTs to this endpoint.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'next-sanity';
 
const ADMIN_SECRET = process.env.ADMIN_SECRET || '';
 
function hashUrl(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) - hash) + url.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
 
function parseRssItems(xml: string) {
  const items: { title: string; link: string; description: string; pubDate: string; imageUrl: string }[] = [];
  const matches = [...xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi)];
  for (const [, itemXml] of matches.slice(0, 20)) {
    const get = (tag: string) => {
      const cdata = itemXml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'));
      if (cdata) return cdata[1].trim();
      const plain = itemXml.match(new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`, 'i'));
      return plain ? plain[1].trim() : '';
    };
    const title = get('title');
    const link = get('link') || get('guid');
    if (!title || !link) continue;
    const imgMatch = itemXml.match(/url="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i);
    items.push({
      title, link,
      description: get('description').replace(/<[^>]+>/g, '').slice(0, 500),
      pubDate: get('pubDate'),
      imageUrl: imgMatch ? imgMatch[1] : '',
    });
  }
  return items;
}
 
export async function POST(req: NextRequest) {
  if (ADMIN_SECRET) {
    const auth = req.headers.get('x-admin-secret');
    if (auth !== ADMIN_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
 
  let body: any = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
 
  const { feedUrl, category = 'market', dryRun = false } = body;
  if (!feedUrl) return NextResponse.json({ error: 'feedUrl is required' }, { status: 400 });
 
  let xml: string;
  try {
    const res = await fetch(feedUrl, {
      headers: { 'User-Agent': 'CryptoBrainNews-Importer/1.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    xml = await res.text();
  } catch (err: any) {
    return NextResponse.json({ error: `Feed fetch failed: ${err.message}` }, { status: 502 });
  }
 
  const items = parseRssItems(xml);
  if (items.length === 0) return NextResponse.json({ imported: 0, skipped: 0, message: 'No items in feed' });
 
  // dryRun: return what WOULD be imported without writing
  if (dryRun === true || dryRun === 'true') {
    return NextResponse.json({ dryRun: true, count: items.length, wouldImport: items.map(i => i.title) });
  }
 
  const token = process.env.SANITY_API_TOKEN;
  if (!token) return NextResponse.json({ error: 'SANITY_API_TOKEN not configured' }, { status: 500 });
 
  const sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-03-04',
    useCdn: false,
    token,
  });
 
  let imported = 0, skipped = 0;
  const created: string[] = [];
 
  for (const item of items) {
    const urlHash = hashUrl(item.link);
    const existing = await sanityClient.fetch(`*[_type == "post" && sourceUrlHash == $hash][0]._id`, { hash: urlHash }).catch(() => null);
    if (existing) { skipped++; continue; }
 
    try {
      await sanityClient.create({
        _type: 'post',
        title: item.title,
        slug: { _type: 'slug', current: item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 96) },
        category, status: 'draft',
        excerpt: item.description.slice(0, 180),
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        sourceUrlHash: urlHash, sourceUrl: item.link,
        body: [{ _type: 'block', _key: `b${urlHash}`, style: 'normal', markDefs: [],
          children: [{ _type: 'span', _key: `s${urlHash}`, text: item.description, marks: [] }] }],
      });
      imported++; created.push(item.title);
    } catch (err: any) { console.error(`[RSS Import] Failed: ${item.title}`, err.message); }
  }
 
  return NextResponse.json({ imported, skipped, total: items.length, created });
}
