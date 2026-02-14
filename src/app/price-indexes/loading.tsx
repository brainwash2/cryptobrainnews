// src/app/price-indexes/loading.tsx
export default function PriceIndexesLoading() {
  return (
    <main className="min-h-screen bg-[#050505]">
      <div className="max-w-[1800px] mx-auto px-4 lg:px-6 py-6">
        {/* Header skeleton */}
        <div className="mb-6">
          <div className="h-8 w-96 bg-white/5 animate-pulse mb-2" />
          <div className="h-4 w-64 bg-white/5 animate-pulse" />
        </div>

        {/* Highlight cards skeleton */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-white/5 animate-pulse border border-white/5" />
          ))}
        </div>

        {/* Table skeleton */}
        <div className="border border-[#1a1a1a]">
          <div className="h-10 bg-[#0a0a0a] border-b border-[#1a1a1a]" />
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="h-12 border-b border-[#0d0d0d] animate-pulse"
              style={{ opacity: 1 - i * 0.05 }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
