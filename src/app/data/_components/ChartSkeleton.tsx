import React from 'react';

interface ChartSkeletonProps {
  height?: number;
  rows?: number;
  charts?: number;
  kpis?: number;
}

export function ChartSkeleton({ height = 260, rows = 4, charts = 1, kpis = 4 }: ChartSkeletonProps) {
  return (
    <div className="space-y-8">
      {kpis > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: kpis }).map((_, i) => (
            <div key={`kpi-${i}`} className="rounded-3xl bg-[#161616] p-6 animate-shimmer">
              <div className="h-3 w-20 bg-[#27272a] rounded mb-3" />
              <div className="h-7 w-28 bg-[#27272a] rounded" />
            </div>
          ))}
        </div>
      )}
      {Array.from({ length: charts }).map((_, i) => (
        <div key={`chart-${i}`} className="rounded-3xl bg-[#161616] p-6 animate-shimmer relative overflow-hidden">
          <div className="h-3 w-40 bg-[#27272a] rounded mb-5" />
          <div
            className="relative"
            style={{ height }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, #27272a, #27272a 1px, transparent 1px, transparent 20px)',
              }}
            />
          </div>
        </div>
      ))}
      {rows > 0 && (
        <div className="rounded-3xl bg-[#161616] overflow-hidden">
          <div className="px-4 py-3 flex gap-8 border-b border-[#27272a] bg-[#161616]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`th-${i}`} className="h-3 w-16 bg-[#27272a] rounded" />
            ))}
          </div>
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={`row-${i}`}
              className={`flex gap-8 px-4 py-3 border-b border-[#27272a] ${i % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#161616]'}`}
            >
              <div className="h-3 w-4 bg-[#27272a] rounded" />
              <div className="h-3 w-32 bg-[#27272a] rounded" />
              <div className="h-3 w-16 bg-[#1a1a1a] rounded" />
              <div className="h-3 w-20 bg-[#27272a] rounded" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ChartSkeleton;