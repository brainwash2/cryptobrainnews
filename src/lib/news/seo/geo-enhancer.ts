/**
 * lib/news/seo/geo-enhancer.ts
 * Generative Engine Optimisation (GEO) post-processor.
 *
 * Applied IN the daily-article.ts pipeline after Gemini polish,
 * before Sanity write. Enhances articles to be citation-friendly
 * by AI overviews (Google SGE, Perplexity, ChatGPT Browse).
 *
 * Transformations:
 *   1. FAQ extraction  — derives 3–5 Q&A pairs from article body
 *                        → stored in Sanity `faqs` field
 *                        → rendered as FAQPage JSON-LD on article page
 *                        → rendered as visible accordion (helps AI parsers)
 *
 *   2. Key stats block — extracts numerical claims (prices, percentages,
 *                        on-chain metrics) into a structured table
 *                        → stored in Sanity `keyStats` field
 *                        → rendered as embeddable <table> with schema markup
 *
 *   3. TL;DR summary   — 2-sentence executive summary
 *                        → placed at top of article body
 *                        → AI crawlers tend to lift the first substantive block
 *
 *   4. Chart embed metadata — if article references a chart/metric,
 *                              stores embed-ready data for the frontend chart component
 *
 * All calls use the same Gemini API pattern established in daily-article.ts.
 */

import type { GeminiPolish }       from '../types';
import type { FAQItem }            from './schema';

// ─── Output types ─────────────────────────────────────────────────────────────

export interface KeyStat {
  metric:    string;   // e.g. 'Bitcoin SOPR'
  value:     string;   // e.g. '1.03'
  context:   string;   // e.g. 'Above 1 = profit on spent outputs'
  source:    string;   // e.g. 'Glassnode'
  direction: 'up' | 'down' | 'neutral';
}

export interface ChartEmbed {
  title:      string;
  metric:     string;
  value:      string;
  unit:       string;
  sparkline?: number[]; // last 7 data points for mini chart
  embedUrl?:  string;   // External chart iframe URL if available
}

export interface GEOEnhancement {
  tldr:       string;
  faqs:       FAQItem[];
  keyStats:   KeyStat[];
  chartEmbed: ChartEmbed | null;
  enhancedBody: string; // Original body with TL;DR prepended
}

// ─── Prompt builders ──────────────────────────────────────────────────────────

function buildFAQPrompt(body: string, title: string): string {
  return `You are a crypto editorial assistant. Extract 3–5 FAQ pairs that a reader would ask about this article.
Each question must be specific, answerable from the article, and useful for Google's FAQ rich results.
Respond ONLY with valid JSON array: [{"question":"...","answer":"..."}]
No markdown fences. Answers must be 1–3 sentences.

Article title: ${title}
Article body (first 3000 chars): ${body.slice(0, 3000)}`;
}

function buildKeyStatsPrompt(body: string): string {
  return `Extract all specific numerical claims, metrics, prices, percentages, and on-chain data points from this crypto article.
For each, identify: the metric name, its value, brief context (1 sentence), data source if mentioned, and whether the direction is up/down/neutral.
Respond ONLY with valid JSON array: [{"metric":"...","value":"...","context":"...","source":"...","direction":"up"|"down"|"neutral"}]
No markdown fences. Return empty array [] if no statistics found.

Article body: ${body.slice(0, 4000)}`;
}

function buildTLDRPrompt(body: string, title: string): string {
  return `Write a 2-sentence TL;DR executive summary of this crypto article.
Lead with the single most important data point or market implication.
Be concrete — avoid vague phrases like "experts say" or "markets are uncertain".
Respond with plain text only, no JSON, no markdown.

Title: ${title}
Body: ${body.slice(0, 2000)}`;
}

// ─── Runtime type guards ──────────────────────────────────────────────────────

function isFAQArray(v: unknown): v is FAQItem[] {
  return (
    Array.isArray(v) &&
    v.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Record<string, unknown>)['question'] === 'string' &&
        typeof (item as Record<string, unknown>)['answer'] === 'string',
    )
  );
}

function isKeyStatArray(v: unknown): v is KeyStat[] {
  return (
    Array.isArray(v) &&
    v.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Record<string, unknown>)['metric'] === 'string' &&
        typeof (item as Record<string, unknown>)['value'] === 'string',
    )
  );
}

// ─── Gemini caller (lightweight — reuses env vars from daily-article.ts) ──────

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY ?? '';
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method:  'POST',
      signal:  AbortSignal.timeout(30_000),
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    },
  );
  if (!res.ok) throw new Error(`Gemini GEO ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as {
    candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
  };
  return data.candidates[0].content.parts[0].text.trim();
}

// ─── Main enhancer ────────────────────────────────────────────────────────────

/**
 * Enhances a polished article with GEO signals.
 * Designed to be called after runGemini() in daily-article.ts.
 * Graceful degradation: each sub-call is independent; failures return empty defaults.
 *
 * @param polish  Output from the Gemini polish stage
 * @returns GEOEnhancement with FAQ, key stats, TL;DR, and chart embed
 */
export async function enhanceForGEO(polish: GeminiPolish): Promise<GEOEnhancement> {
  const [faqRaw, statsRaw, tldr] = await Promise.allSettled([
    callGemini(buildFAQPrompt(polish.body, polish.title)),
    callGemini(buildKeyStatsPrompt(polish.body)),
    callGemini(buildTLDRPrompt(polish.body, polish.title)),
  ]);

  // Parse FAQs
  let faqs: FAQItem[] = [];
  if (faqRaw.status === 'fulfilled') {
    try {
      const parsed: unknown = JSON.parse(faqRaw.value);
      if (isFAQArray(parsed)) faqs = parsed.slice(0, 5);
    } catch { /* degraded — empty faqs */ }
  }

  // Parse key stats
  let keyStats: KeyStat[] = [];
  if (statsRaw.status === 'fulfilled') {
    try {
      const parsed: unknown = JSON.parse(statsRaw.value);
      if (isKeyStatArray(parsed)) keyStats = parsed.slice(0, 8);
    } catch { /* degraded — empty stats */ }
  }

  // TL;DR plain text
  const tldrText = tldr.status === 'fulfilled' ? tldr.value.slice(0, 300) : '';

  // Chart embed: derive from first key stat if available
  const chartEmbed: ChartEmbed | null =
    keyStats.length > 0
      ? {
          title:  keyStats[0].metric,
          metric: keyStats[0].metric,
          value:  keyStats[0].value,
          unit:   '',
        }
      : null;

  // Prepend TL;DR block to body (AI crawlers lift first substantive block)
  const enhancedBody = tldrText
    ? `> **TL;DR:** ${tldrText}\n\n${polish.body}`
    : polish.body;

  return { tldr: tldrText, faqs, keyStats, chartEmbed, enhancedBody };
}
