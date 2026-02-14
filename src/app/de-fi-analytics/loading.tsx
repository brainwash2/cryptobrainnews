// src/app/de-fi-analytics/loading.tsx
export default function DeFiLoading() {
  return (
    <div className="flex max-w-[2000px] mx-auto">
      <div className="w-64 shrink-0 hidden lg:block" />
      <main className="flex-1 p-6 md:p-8">
        <div className="h-10 w-80 bg-white/5 animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 h-96 bg-white/5 animate-pulse border border-white/5" />
          <div className="lg:col-span-4 h-96 bg-white/5 animate-pulse border border-white/5" />
        </div>
      </main>
    </div>
  );
}
