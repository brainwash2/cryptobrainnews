import { ArticleGridSkeleton } from '@/components/ui/Skeleton';
 
export default function NewsLoading() {
  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-10 border-b border-[#1a1a1a] pb-6">
          <div className="animate-pulse h-12 w-64 bg-[#1a1a1a] mb-2" />
          <div className="animate-pulse h-3 w-80 bg-[#111]" />
        </div>
        <div className="flex gap-2 mb-10 flex-wrap">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="animate-pulse h-7 w-20 bg-[#1a1a1a]" />
          ))}
        </div>
        <ArticleGridSkeleton count={12} />
      </div>
    </main>
  );
}
