'use client';
import React, { useMemo } from 'react';

export default function MiniSparkline({ data, isPositive }: { data: number[], isPositive: boolean }) {
  const path = useMemo(() => {
    if (!data || data.length < 2) return '';
    const step = Math.max(1, Math.floor(data.length / 24));
    const sampled = data.filter((_, i) => i % step === 0);
    const min = Math.min(...sampled);
    const max = Math.max(...sampled);
    const range = max - min || 1;
    const width = 80;
    const height = 28;
    const points = sampled.map((val, i) => {
      const x = 2 + (i / (sampled.length - 1)) * 76;
      const y = 2 + (1 - (val - min) / range) * 24;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return `M${points.join(' L')}`;
  }, [data]);

  if (!path) return <div className="w-20 h-7" />;
  return (
    <svg viewBox="0 0 80 28" className="w-20 h-7 ml-auto" preserveAspectRatio="none">
      <path d={path} fill="none" stroke={isPositive ? '#00d672' : '#ff4757'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
