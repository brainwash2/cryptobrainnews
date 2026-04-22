/**
 * components/news/GEOBlocks.tsx
 * Renders the GEO-enhanced blocks on article pages:
 *
 *   <TLDRBlock>    — sticky highlight box at article top
 *   <KeyStatsTable>— embeddable metrics table with schema.org markup
 *   <FAQAccordion> — expandable FAQ with FAQPage JSON-LD
 *   <ChartEmbed>   — lightweight chart widget for embeddable data
 *
 * These blocks serve dual purpose:
 *   1. Reader UX — scannable, high-information-density content
 *   2. GEO signal — structured, quotable content that AI crawlers lift
 *      into summaries and citations (Google SGE, Perplexity, ChatGPT Browse)
 */

'use client';

import { useState }                          from 'react';
import { buildFAQSchema, toJSONLDScript }    from '../../lib/news/seo/schema';
import type { FAQItem }                      from '../../lib/news/seo/schema';
import type { KeyStat, ChartEmbed }          from '../../lib/news/seo/geo-enhancer';

// ─── TL;DR Block ──────────────────────────────────────────────────────────────

export function TLDRBlock({ tldr }: { tldr: string }) {
  if (!tldr) return null;
  return (
    <div
      className="my-6 p-4 rounded-xl border-l-4 border-[#00d4ff] bg-[#00d4ff]/5"
      aria-label="Article summary"
    >
      <p className="text-xs font-bold text-[#00d4ff] uppercase tracking-widest mb-2">TL;DR</p>
      <p className="text-[#e0e0e0] text-sm leading-relaxed">{tldr}</p>
    </div>
  );
}

// ─── Key Stats Table ──────────────────────────────────────────────────────────

const DIRECTION_STYLES: Record<KeyStat['direction'], string> = {
  up:      'text-green-400',
  down:    'text-red-400',
  neutral: 'text-[#94a3b8]',
};

const DIRECTION_ARROW: Record<KeyStat['direction'], string> = {
  up: '▲', down: '▼', neutral: '—',
};

export function KeyStatsTable({ stats }: { stats: KeyStat[] }) {
  if (stats.length === 0) return null;

  return (
    <div className="my-8 overflow-x-auto rounded-xl border border-[#1a1a2e]" aria-label="Key metrics">
      <table className="w-full text-sm">
        <caption className="sr-only">Key statistics from this article</caption>
        <thead>
          <tr className="bg-[#0d0d1a] border-b border-[#1a1a2e]">
            <th scope="col" className="text-left px-4 py-3 text-[#94a3b8] font-medium">Metric</th>
            <th scope="col" className="text-right px-4 py-3 text-[#94a3b8] font-medium">Value</th>
            <th scope="col" className="text-left px-4 py-3 text-[#94a3b8] font-medium hidden sm:table-cell">Context</th>
            <th scope="col" className="text-left px-4 py-3 text-[#94a3b8] font-medium hidden md:table-cell">Source</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((stat, idx) => (
            <tr
              key={`${stat.metric}-${idx}`}
              className="border-b border-[#1a1a2e] last:border-0 hover:bg-[#0d0d1a]/60 transition-colors"
            >
              <td className="px-4 py-3 text-white font-medium">{stat.metric}</td>
              <td className={`px-4 py-3 text-right font-mono font-bold ${DIRECTION_STYLES[stat.direction]}`}>
                <span aria-hidden="true" className="mr-1 text-xs">
                  {DIRECTION_ARROW[stat.direction]}
                </span>
                {stat.value}
              </td>
              <td className="px-4 py-3 text-[#94a3b8] hidden sm:table-cell max-w-[220px]">
                {stat.context}
              </td>
              <td className="px-4 py-3 text-[#555] text-xs hidden md:table-cell">{stat.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────

export function FAQAccordion({ faqs }: { faqs: FAQItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  if (faqs.length === 0) return null;

  const faqSchema = buildFAQSchema(faqs);

  return (
    <>
      <div
        dangerouslySetInnerHTML={{ __html: toJSONLDScript(faqSchema) }}
        suppressHydrationWarning
      />

      <section className="my-8" aria-labelledby="faq-heading">
        <h2
          id="faq-heading"
          className="text-lg font-bold text-white mb-4 flex items-center gap-2"
        >
          <span className="text-[#00d4ff]" aria-hidden="true">?</span>
          Frequently Asked Questions
        </h2>

        <div className="rounded-xl border border-[#1a1a2e] divide-y divide-[#1a1a2e] overflow-hidden">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  id={`faq-question-${idx}`}
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full text-left px-5 py-4 flex justify-between items-center gap-4 hover:bg-[#0d0d1a]/60 transition-colors"
                >
                  <span className="text-[#e0e0e0] font-medium text-sm">{faq.question}</span>
                  <span
                    className={`text-[#00d4ff] text-lg shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-45' : ''
                    }`}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>

                <div
                  id={`faq-answer-${idx}`}
                  role="region"
                  aria-labelledby={`faq-question-${idx}`}
                  hidden={!isOpen}
                  className="px-5 pb-4"
                >
                  <p className="text-[#94a3b8] text-sm leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

// ─── Chart Embed ──────────────────────────────────────────────────────────────

export function ChartEmbedWidget({ chart }: { chart: ChartEmbed }) {
  if (!chart) return null;

  const hasSparkline = chart.sparkline && chart.sparkline.length > 1;
  const max          = hasSparkline ? Math.max(...chart.sparkline!) : 0;
  const min          = hasSparkline ? Math.min(...chart.sparkline!) : 0;
  const range        = max - min || 1;

  return (
    <div
      className="my-8 p-5 rounded-xl border border-[#1a1a2e] bg-[#0d0d1a]"
      aria-label={`Chart: ${chart.title}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-[#555] uppercase tracking-widest mb-1">{chart.metric}</p>
          <p className="text-2xl font-bold font-mono text-white">
            {chart.value}
            {chart.unit && <span className="text-sm text-[#94a3b8] ml-1">{chart.unit}</span>}
          </p>
        </div>
        <span className="text-xs text-[#555] bg-[#1a1a2e] px-2 py-1 rounded">LIVE DATA</span>
      </div>

      {/* Inline sparkline SVG */}
      {hasSparkline && (
        <svg
          viewBox={`0 0 ${chart.sparkline!.length * 20} 40`}
          className="w-full h-10"
          aria-hidden="true"
          role="img"
        >
          <polyline
            fill="none"
            stroke="#00d4ff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={chart.sparkline!
              .map(
                (v, i) =>
                  `${i * 20},${40 - ((v - min) / range) * 36}`,
              )
              .join(' ')}
          />
        </svg>
      )}

      {chart.embedUrl && (
        <a
          href={chart.embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-xs text-[#00d4ff] hover:underline"
        >
          View full chart →
        </a>
      )}
    </div>
  );
}
