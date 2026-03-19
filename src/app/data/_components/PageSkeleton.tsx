import React from 'react';

interface Props {
  rows?:    number;
  charts?:  number;
  kpis?:    number;
}

export function PageSkeleton({ rows = 5, charts = 1, kpis = 4 }: Props) {
  return (
    <div className="space-y-8 pb-20 animate-pulse">
      {/* Header */}
      <div className="border-b border-[#1a1a1a] pb-6">
        <div className="h-3 w-32 bg-[#1a1a1a] rounded mb-3" />
        <div className="h-8 w-72 bg-[#1a1a1a] rounded mb-2" />
        <div className="h-3 w-96 bg-[#0f0f0f] rounded" />
      </div>

      {/* KPI Strip */}
      <div className={`grid grid-cols-2 lg:grid-cols-${kpis} gap-4`}>
        {Array.from({ length: kpis }).map((_, i) => (
          <div key={i} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <div className="h-2 w-24 bg-[#1a1a1a] rounded mb-4" />
            <div className="h-8 w-28 bg-[#1a1a1a] rounded" />
          </div>
        ))}
      </div>

      {/* Charts */}
      {Array.from({ length: charts }).map((_, i) => (
        <div key={i} className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
          <div className="h-3 w-48 bg-[#1a1a1a] rounded mb-6" />
          <div className="h-56 bg-[#0f0f0f] rounded" />
        </div>
      ))}

      {/* Table */}
      <div className="border border-[#1a1a1a] bg-[#0a0a0a]">
        <div className="border-b border-[#1a1a1a] bg-[#080808] px-4 py-3 flex gap-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-2 w-16 bg-[#1a1a1a] rounded" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className={`flex gap-8 px-4 py-3 border-b border-[#111] ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'}`}>
            <div className="h-3 w-4 bg-[#1a1a1a] rounded" />
            <div className="h-3 w-32 bg-[#1a1a1a] rounded" />
            <div className="h-3 w-16 bg-[#0f0f0f] rounded" />
            <div className="h-3 w-20 bg-[#1a1a1a] rounded" />
            <div className="h-3 w-14 bg-[#0f0f0f] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default PageSkeleton;
