'use client';
import React, { useEffect, useRef } from 'react';

export default function TradingViewChart({ symbol }: { symbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear previous charts if the symbol changes
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof window !== 'undefined' && (window as any).TradingView) {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: `BINANCE:${symbol.toUpperCase()}USDT`,
          interval: 'D',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          enable_publishing: false,
          backgroundColor: '#0a0a0a',
          gridColor: '#1a1a1a',
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: containerRef.current?.id,
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [symbol]);

  return <div id={`tv_${symbol}`} ref={containerRef} className="w-full h-[500px] border border-[#1a1a1a] rounded-lg overflow-hidden" />;
}
