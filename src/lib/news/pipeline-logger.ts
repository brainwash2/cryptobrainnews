/**
 * lib/news/pipeline-logger.ts
 * Lightweight structured logger for the daily-article pipeline.
 * Writes JSON lines to stdout (captured by Vercel/Cron logs).
 * All methods are synchronous to avoid async noise in pipeline control flow.
 */

import type { PipelineStage, StageError, StageSeverity } from './types';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  ts: string;
  level: LogLevel;
  runId: string;
  stage: PipelineStage;
  msg: string;
  data?: Record<string, unknown>;
}

export class PipelineLogger {
  private readonly runId: string;
  private currentStage: PipelineStage = 'idle';
  private readonly errors: StageError[] = [];

  constructor(runId: string) {
    this.runId = runId;
  }

  setStage(stage: PipelineStage): void {
    this.currentStage = stage;
    this.info(`Entering stage: ${stage}`);
  }

  info(msg: string, data?: Record<string, unknown>): void {
    this.write('info', msg, data);
  }

  warn(msg: string, data?: Record<string, unknown>): void {
    this.write('warn', msg, data);
  }

  error(
    msg: string,
    severity: StageSeverity,
    cause?: unknown,
    retriesAttempted = 0,
  ): StageError {
    const err: StageError = {
      stage: this.currentStage,
      severity,
      message: msg,
      cause: cause instanceof Error ? cause.message : String(cause ?? ''),
      retriesAttempted,
    };
    this.errors.push(err);
    this.write('error', msg, {
      severity,
      cause: err.cause,
      retriesAttempted,
    });
    return err;
  }

  getErrors(): Readonly<StageError[]> {
    return this.errors;
  }

  hasFatal(): boolean {
    return this.errors.some((e) => e.severity === 'fatal');
  }

  private write(level: LogLevel, msg: string, data?: Record<string, unknown>): void {
    const entry: LogEntry = {
      ts: new Date().toISOString(),
      level,
      runId: this.runId,
      stage: this.currentStage,
      msg,
      ...(data ? { data } : {}),
    };
    // JSON-lines format – one entry per line, easily parseable by log aggregators
    process.stdout.write(JSON.stringify(entry) + '\n');
  }
}
