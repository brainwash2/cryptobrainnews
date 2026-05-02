// src/app/api/cron/social/route.ts
import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { validateVercelCronAuth }         from '../../../../lib/ops/cron-guard';
import { SocialScheduler }                from '../../../../lib/social/scheduler';
import { TwitterThreadPublisher }          from '../../../../lib/social/twitter-thread';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const unauth = validateVercelCronAuth(req);
  if (unauth) return unauth;

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
