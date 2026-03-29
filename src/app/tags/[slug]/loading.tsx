export default function TagLoading() {
  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-12 border-b border-[#1a1a1a] pb-6">
          <div className="animate-pulse h-3 w-10 bg-[#111] mb-2" />
          <div className="animate-pulse h-12 w-48 bg-[#1a1a1a]" />
        </div>
        <div className="divide-y divide-[#1a1a1a]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-5 py-6">
              <div className="animate-pulse w-24 h-16 bg-[#1a1a1a] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="animate-pulse h-3 w-16 bg-[#111]" />
                <div className="animate-pulse h-4 w-full bg-[#1a1a1a]" />
                <div className="animate-pulse h-4 w-2/3 bg-[#1a1a1a]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
