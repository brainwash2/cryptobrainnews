import React from 'react';

export function ChartSkeleton({ rows = 4, charts = 1 }: { rows?: number; charts?: number }) {
  return (
    <div className="space-y-6 animate-pulse">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <div className="h-2 w-24 bg-[#1a1a1a] rounded mb-4" />
            <div className="h-7 w-28 bg-[#1a1a1a] rounded" />
          </div>
        ))}
      </div>
      {/* Charts */}
      {Array.from({ length: charts }).map((_, i) => (
        <div key={i} className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
          <div className="h-2 w-40 bg-[#1a1a1a] rounded mb-6" />
          <div className="h-52 bg-[#0f0f0f] rounded" />
        </div>
      ))}
      {/* Table */}
      <div className="border border-[#1a1a1a] bg-[#0a0a0a]">
        <div className="border-b border-[#1a1a1a] bg-[#080808] px-4 py-3 flex gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-2 w-16 bg-[#1a1a1a] rounded" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={`flex gap-6 px-4 py-3 border-b border-[#111] ${
              i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'
            }`}
          >
            <div className="h-3 w-4 bg-[#1a1a1a] rounded" />
            <div className="h-3 w-32 bg-[#1a1a1a] rounded" />
            <div className="h-3 w-16 bg-[#0f0f0f] rounded" />
            <div className="h-3 w-20 bg-[#1a1a1a] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChartSkeleton;
