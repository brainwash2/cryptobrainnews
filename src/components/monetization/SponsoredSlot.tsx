import React from 'react';
import Link from 'next/link';
 
interface Props {
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  logoUrl?: string;
  label?: string;
}
 
export default function SponsoredSlot({
  title, description, ctaText, ctaHref,
  logoUrl, label = 'Sponsored',
}: Props) {
  return (
    <div className="my-10 border border-[#FABF2C]/20 bg-[#0a0a0a] p-6 relative">
      <span className="absolute top-3 right-3 text-[9px] font-mono text-[#333] uppercase tracking-widest">
        {label}
      </span>
 
      <div className="flex items-start gap-4">
        {logoUrl && (
          <img src={logoUrl} alt={title} className="w-10 h-10 object-contain shrink-0" />
        )}
        <div className="flex-1">
          <h4 className="text-white font-black uppercase text-sm mb-1">{title}</h4>
          <p className="text-[#888] text-xs font-mono mb-4">{description}</p>
          <Link
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-block bg-[#FABF2C] text-black px-5 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors"
          >
            {ctaText} ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
