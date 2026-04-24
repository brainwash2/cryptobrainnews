/**
 * lib/news/types.ts
 * Canonical strict-mode types for the CryptoBrainNews news pipeline.
 * No `any` allowed. All external API shapes are validated at runtime via guards.
 */

// ─── RSS ────────────────────────────────────────────────────────────────────

export interface RSSItem {
  title: string;
  link: string;
  pubDate: string;        // ISO-8601 string as returned by the feed
  guid: string;           // Unique identifier – prefer over link for dedup
  description: string;
  content?: string;       // <content:encoded> when present
  author?: string;
  categories?: string[];
  imageUrl?: string;
}

export interface RSSFeed {
  source: string;         // Human-readable feed name
  url: string;
  items: RSSItem[];
  fetchedAt: string;      // ISO-8601
}

// ─── AI Stage Outputs ────────────────────────────────────────────────────────

/** Output produced by the Grok summarisation stage. */
export interface GrokSummary {
  headline: string;
  summary: string;        // 2–3 sentence factual summary
  keyPoints: string[];    // 3–5 bullet facts
  rawArticleUrl: string;
  sourceTitle: string;
}

/** Output produced by the DeepSeek enrichment stage. */
export interface DeepSeekEnrichment {
  expandedBody: string;   // Full article body in Markdown
  tags: string[];
  category: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  relatedTickers: string[];
}

/** Output produced by the Gemini polish stage. */
export interface GeminiPolish {
  title: string;          // SEO-optimised headline
  metaDescription: string;
  body: string;           // Final Markdown body
  slug: string;           // kebab-case, max 80 chars
  schemaMarkup?: Record<string, unknown>; // NewsArticle schema
}

/** Union of all possible AI stages that fed into the final article. */
export type AIStageOutputs = {
  grok: GrokSummary;
  deepSeek?: DeepSeekEnrichment;   // Optional – may have been skipped on failure
  gemini?: GeminiPolish;           // Optional – may have been skipped on failure
};

// ─── Pipeline ────────────────────────────────────────────────────────────────

export type PipelineStage =
  | 'idle'
  | 'rss-fetch'
  | 'dedup-check'
  | 'grok-summarise'
  | 'deepseek-enrich'
  | 'gemini-polish'
  | 'sanity-write'
  | 'telegram-broadcast'
  | 'complete'
  | 'failed';

export type StageSeverity = 'fatal' | 'degraded' | 'warn';

export interface StageError {
  stage: PipelineStage;
  severity: StageSeverity;
  message: string;
  cause?: string;         // Serialised original error message
  retriesAttempted: number;
}

export interface PipelineRun {
  runId: string;          // uuid-v4
  startedAt: string;      // ISO-8601
  completedAt?: string;
  stage: PipelineStage;
  articlesAttempted: number;
  articlesPublished: number;
  errors: StageError[];
  deadLetterPaths: string[]; // Paths to any dead-letter JSON files written
}

// ─── Sanity ──────────────────────────────────────────────────────────────────

/** Minimal shape we write to Sanity – extend with your full schema fields. */
export interface SanityArticlePayload {
    _type: 'post';
  title: string;
  slug: { _type: 'slug'; current: string };
  metaDescription: string;
  body: string;           // Portable Text or Markdown depending on your schema
  tags: string[];
  category: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  relatedTickers: string[];
  sourceUrl: string;
  publishedAt: string;    // ISO-8601
  generatedBy: AIStageOutputs;
  pipelineRunId: string;
}

export interface SanityWriteResult {
  documentId: string;
  slug: string;
  publishedAt: string;
}

// ─── Newsletter / Telegram ───────────────────────────────────────────────────

export interface NewsletterPayload {
  subject: string;
  previewText: string;
  articleTitle: string;
  articleUrl: string;
  summary: string;
  tags: string[];
}

export interface TelegramPayload {
  chatId: string;
  text: string;           // Pre-formatted Markdown
  parseMode: 'Markdown' | 'HTML';
  disableWebPagePreview?: boolean;
}

// ─── Runtime type guards ─────────────────────────────────────────────────────

export function isRSSItem(v: unknown): v is RSSItem {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o['title'] === 'string' &&
    typeof o['link'] === 'string' &&
    typeof o['pubDate'] === 'string' &&
    typeof o['guid'] === 'string' &&
    typeof o['description'] === 'string'
  );
}

export function isGrokSummary(v: unknown): v is GrokSummary {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o['headline'] === 'string' &&
    typeof o['summary'] === 'string' &&
    Array.isArray(o['keyPoints']) &&
    typeof o['rawArticleUrl'] === 'string' &&
    typeof o['sourceTitle'] === 'string'
  );
}

export function isDeepSeekEnrichment(v: unknown): v is DeepSeekEnrichment {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o['expandedBody'] === 'string' &&
    Array.isArray(o['tags']) &&
    typeof o['category'] === 'string' &&
    (o['sentiment'] === 'bullish' || o['sentiment'] === 'bearish' || o['sentiment'] === 'neutral') &&
    Array.isArray(o['relatedTickers'])
  );
}

export function isGeminiPolish(v: unknown): v is GeminiPolish {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o['title'] === 'string' &&
    typeof o['metaDescription'] === 'string' &&
    typeof o['body'] === 'string' &&
    typeof o['slug'] === 'string'
  );
}
