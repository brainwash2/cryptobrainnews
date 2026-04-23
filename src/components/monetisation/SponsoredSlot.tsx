/**
 * components/monetisation/SponsoredSlot.tsx
 * Server component that fetches and renders a sponsored content slot.
 */

import Image                    from 'next/image';
import { SponsoredContentStore } from '../../lib/monetisation/sponsored';
import type { SponsorSlot }      from '../../lib/monetisation/sponsored';

interface Props {
  slot:      SponsorSlot;
  category?: string;
  variant:   'sidebar' | 'banner' | 'footer';
}

export default async function SponsoredSlot({ slot, category, variant }: Props) {
  const store   = new SponsoredContentStore();
  const display = await store.getForSlot(slot, category);

  if (!display) return null;

  await store.recordImpression(display.record.id);

  const { record } = display;
  const trackUrl   = `/api/monetisation/analytics/track?partner=${encodeURIComponent(record.id)}&slug=sponsored&position=${variant}`;

  if (variant === 'sidebar') {
    return (
      <aside
        className="rounded-xl border border-[#1a1a2e] bg-[#0d0d1a] overflow-hidden"
        aria-label={`Sponsored content from ${record.advertiser}`}
        data-sponsored="true"
      >
        {record.imageUrl && (
          <div className="relative w-full h-32">
            <Image src={record.imageUrl} alt={record.advertiser} fill className="object-cover" />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-[#555] uppercase tracking-widest">
              Sponsored
            </span>
            {record.logoUrl && (
              <Image
                src={record.logoUrl}
                alt={`${record.advertiser} logo`}
                width={60}
                height={20}
                className="object-contain opacity-70"
              />
            )}
          </div>
          <h3 className="text-sm font-bold text-white leading-snug mb-2">{record.headline}</h3>
          <p className="text-xs text-[#94a3b8] leading-relaxed mb-4">{record.body}</p>
          <a
            href={trackUrl}
            rel="nofollow noopener sponsored"
            target="_blank"
            data-sponsored="true"
            data-advertiser={record.advertiser}
            className="block w-full text-center text-xs font-bold py-2.5 px-4 rounded-lg bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30 hover:bg-[#00d4ff]/20 transition-colors"
          >
            {record.ctaText}
          </a>
        </div>
      </aside>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        className="w-full rounded-xl border border-[#1a1a2e] bg-[#0d0d1a] p-5 flex items-center gap-6"
        aria-label={`Sponsored by ${record.advertiser}`}
        data-sponsored="true"
      >
        {record.logoUrl && (
          <Image
            src={record.logoUrl}
            alt={`${record.advertiser} logo`}
            width={80}
            height={32}
            className="object-contain shrink-0 opacity-80"
          />
        )}
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold text-[#555] uppercase tracking-widest block mb-1">
            Sponsored
          </span>
          <p className="text-sm font-semibold text-white truncate">{record.headline}</p>
          <p className="text-xs text-[#94a3b8] truncate">{record.body}</p>
        </div>
        <a
          href={trackUrl}
          rel="nofollow noopener sponsored"
          target="_blank"
          data-sponsored="true"
          data-advertiser={record.advertiser}
          className="shrink-0 text-xs font-bold py-2 px-5 rounded-lg bg-[#00d4ff] text-[#0d0d1a] hover:opacity-90 transition-opacity"
        >
          {record.ctaText}
        </a>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-3 py-3 px-4 rounded-lg border border-[#1a1a2e] bg-[#0a0a18]"
      aria-label={`Sponsored by ${record.advertiser}`}
      data-sponsored="true"
    >
      <span className="text-[10px] text-[#555] uppercase tracking-widest shrink-0">Sponsored</span>
      <p className="text-xs text-[#94a3b8] flex-1 truncate">
        <strong className="text-white">{record.advertiser}:</strong> {record.headline}
      </p>
      <a
        href={trackUrl}
        rel="nofollow noopener sponsored"
        target="_blank"
        data-sponsored="true"
        className="shrink-0 text-xs text-[#00d4ff] hover:underline font-medium"
      >
        {record.ctaText}
      </a>
    </div>
  );
}
