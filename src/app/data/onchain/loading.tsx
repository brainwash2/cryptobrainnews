export default function OnChainLoading() {
  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="h-10 w-48 bg-[#1a1a1a] rounded mb-4 animate-pulse" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-[#0a0a0a] border border-[#1a1a1a] rounded animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  );
}
