// src/app/api/cron/daily-article/route.ts
import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { validateVercelCronAuth }         from '../../../../lib/ops/cron-guard';
import { runPipeline }                    from '../../../../../scripts/daily-article';
import { OpsAlerter }                     from '../../../../lib/ops/alerts';
import type { StageError }                from '../../../../lib/news/types';

export const maxDuration = 60;

export async function GET(req: NextRequest): Promise<NextResponse> {
  const unauth = validateVercelCronAuth(req);
  if (unauth) return unauth;

  const run = await runPipeline();

  if (run.stage === 'failed' || run.articlesPublished === 0) {
    const alerter = new OpsAlerter();
    await alerter.pipelineAlert({
      stage:             run.stage,
      runId:             run.runId,
      articlesPublished: run.articlesPublished,
      fatalErrors:       run.errors.filter((e: StageError) => e.severity === 'fatal').length,
      deadLetterCount:   run.deadLetterPaths.length,
    });
  }

  return NextResponse.json({
    ok:                run.stage !== 'failed',
    runId:             run.runId,
    articlesPublished: run.articlesPublished,
    articlesAttempted: run.articlesAttempted,
    fatalErrors:       run.errors.filter((e: StageError) => e.severity === 'fatal').length,
    deadLetterCount:   run.deadLetterPaths.length,
    duration:          run.completedAt && run.startedAt
      ? `${((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000).toFixed(1)}s`
      : null,
  });
}
