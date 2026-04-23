/**
 * app/api/social/twitter/route.ts
 * Internal API to enqueue or immediately publish a Twitter thread.
 *
 * POST  /api/social/twitter          — schedule a thread for optimal posting time
 * POST  /api/social/twitter?now=true — publish immediately (for manual triggers)
 *
 * Auth: CRON_SECRET header (shared secret between Vercel Cron and this route).
 * Never expose to the browser — all calls are server-to-server.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SocialScheduler }           from '../../../../lib/social/scheduler';
import { TwitterThreadPublisher, buildThread } from '../../../../lib/social/twitter-thread';
import type { TwitterThreadJob }     from '../../../../lib/social/scheduler';

const CRON_SECRET = process.env.CRON_SECRET ?? '';

function isAuthorised(req: NextRequest): boolean {
  return req.headers.get('x-cron-secret') === CRON_SECRET && CRON_SECRET !== '';
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const body = (await req.json()) as Partial<TwitterThreadJob['payload'] & {
    pipelineRunId: string;
    articleSlug:   string;
  }>;

  const { title, slug, summary, keyPoints, keyStats, tags, category, sentiment, pipelineRunId, articleSlug } = body;

  if (!slug || !title || !summary) {
    return NextResponse.json({ error: 'Missing required fields: slug, title, summary' }, { status: 400 });
  }

  const payload: TwitterThreadJob['payload'] = {
    title:     title,
    slug:      slug,
    summary:   summary,
    keyPoints: keyPoints ?? [],
    keyStats:  keyStats  ?? [],
    tags:      tags      ?? [],
    category:  category  ?? 'Markets',
    sentiment: sentiment ?? 'neutral',
  };

  const now = req.nextUrl.searchParams.get('now') === 'true';

  if (now) {
    // Immediate publish
    const creds = {
      apiKey:            process.env.TWITTER_API_KEY            ?? '',
      apiSecret:         process.env.TWITTER_API_SECRET         ?? '',
      accessToken:       process.env.TWITTER_ACCESS_TOKEN       ?? '',
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET ?? '',
      bearerToken:       process.env.TWITTER_BEARER_TOKEN       ?? '',
    };

    if (!creds.apiKey) {
      return NextResponse.json({ error: 'Twitter credentials not configured' }, { status: 503 });
    }

    const publisher = new TwitterThreadPublisher(creds);
    try {
      const result = await publisher.publish({
        article:       payload,
        pipelineRunId: pipelineRunId ?? 'manual',
      });
      return NextResponse.json({ published: true, ...result });
    } catch (err) {
      return NextResponse.json(
        { published: false, error: String(err) },
        { status: 502 },
      );
    }
  }

  // Schedule for optimal posting window
  const scheduler = new SocialScheduler();
  const result    = await scheduler.schedule({
    channel:       'twitter_thread',
    payload,
    pipelineRunId: pipelineRunId ?? 'pipeline',
    articleSlug:   articleSlug ?? slug,
  });

  return NextResponse.json({ scheduled: true, ...result });
}

// ─── GET: preview thread without posting ──────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const slug     = req.nextUrl.searchParams.get('slug')    ?? '';
  const title    = req.nextUrl.searchParams.get('title')   ?? 'Preview Article';
  const summary  = req.nextUrl.searchParams.get('summary') ?? '';
  const category = req.nextUrl.searchParams.get('category') ?? 'Markets';

  const preview = buildThread({
    article: {
      title,
      slug,
      summary,
      keyPoints: [],
      keyStats:  [],
      tags:      [],
      category,
      sentiment: 'neutral',
    },
    pipelineRunId: 'preview',
  });

  return NextResponse.json(preview);
}
