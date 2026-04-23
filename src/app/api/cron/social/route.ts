/**
 * app/api/cron/social/route.ts
 * Vercel Cron handler — runs every minute to process due social posts.
 *
 * vercel.json entry:
 *   { "path": "/api/cron/social", "schedule": "* * * * *" }
 *
 * Auth: Vercel automatically sets Authorization: Bearer <CRON_SECRET>
 * on cron-invoked routes. We verify this.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { SocialScheduler }                from '../../../../lib/social/scheduler';
import { TwitterThreadPublisher }          from '../../../../lib/social/twitter-thread';

const CRON_SECRET = process.env.CRON_SECRET ?? '';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${CRON_SECRET}` || !CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const scheduler = new SocialScheduler();
  const creds = {
    apiKey:            process.env.TWITTER_API_KEY             ?? '',
    apiSecret:         process.env.TWITTER_API_SECRET          ?? '',
    accessToken:       process.env.TWITTER_ACCESS_TOKEN        ?? '',
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET ?? '',
    bearerToken:       process.env.TWITTER_BEARER_TOKEN        ?? '',
  };

  const publisher = creds.apiKey ? new TwitterThreadPublisher(creds) : null;

  const result = await scheduler.processDueJobs({
    twitter_thread: publisher
      ? async (job) => {
          if (job.channel !== 'twitter_thread') return;
          await publisher.publish({
            article:       job.payload,
            pipelineRunId: job.pipelineRunId,
          });
        }
      : undefined,
  });

  return NextResponse.json({ ok: true, ...result });
}
