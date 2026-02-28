'use client';
import React from 'react';

export default function AdUnit({ width = 728, height = 90 }: { width?: number; height?: number }) {
  const adUrl = `https://ad.a-ads.com/YOUR_AD_UNIT_ID?size=${width}x${height}&background=0a0a0a&title=ffffff&text=888888&link=FABF2C&border=1a1a1a`;

  return (
    <div className="flex flex-col items-center my-8 w-full">
      <span className="text-[8px] text-[#555] font-mono uppercase tracking-widest mb-2">Advertisement</span>
      <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden" style={{ width: `${width}px`, height: `${height}px` }}>
        <iframe data-aa='YOUR_AD_UNIT_ID' src={adUrl} style={{ width: '100%', height: '100%', border: 0, padding: 0 }} allowTransparency={true} />
      </div>
    </div>
  );
}
