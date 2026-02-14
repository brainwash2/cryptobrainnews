export default function MarketsLoading() {
  return (
    <div className="flex max-w-[2000px] mx-auto">
      <div className="w-64 shrink-0 hidden lg:block" />
      <main className="flex-1 p-6 md:p-8">
        <div className="h-10 w-60 bg-white/5 animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 bg-white/5 animate-pulse border border-white/5" />
          ))}
        </div>
      </main>
    </div>
  );
}
