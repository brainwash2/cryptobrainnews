export function ChartSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 h-24">
            <div className="h-3 bg-[#222] w-1/2 mb-2 rounded" />
            <div className="h-6 bg-[#333] w-3/4 rounded" />
          </div>
        ))}
      </div>
      {/* Chart Area */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 h-[400px]">
        <div className="flex justify-between mb-8">
           <div className="h-4 bg-[#333] w-48 rounded" />
           <div className="h-3 bg-[#222] w-24 rounded" />
        </div>
        <div className="h-full bg-[#111] rounded" />
      </div>
    </div>
  );
}
