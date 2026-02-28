'use client';
import React, { useEffect, useState } from 'react';

export default function SwapWidget() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); },[]);

  if (!isMounted) {
    return (
      <div className="w-full h-[360px] bg-[#0a0a0a] border border-[#1a1a1a] rounded flex items-center justify-center">
        <span className="text-[10px] font-mono text-[#555] uppercase animate-pulse">Loading Swap Engine...</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded overflow-hidden">
      <div className="bg-[#111] p-3 border-b border-[#1a1a1a] flex justify-between items-center">
        <span className="text-[10px] font-black text-[#FABF2C] uppercase tracking-widest">Quick Swap</span>
        <span className="w-1.5 h-1.5 bg-[#00d672] rounded-full animate-pulse" />
      </div>
      <iframe id="iframe-widget" src="https://changenow.io/embeds/exchange-widget/v2/widget.html?FAQ=true&amount=0.1&amountFiat=1500&backgroundColor=0a0a0a&darkMode=true&from=eth&fromFiat=usd&horizontal=false&isFiat&lang=en-US&link_id=YOUR_AFFILIATE_ID&locales=true&logo=false&primaryColor=FABF2C&to=btc&toFiat=btc&toTheMoon=true" style={{ height: '360px', width: '100%', border: 'none' }} />
    </div>
  );
}
