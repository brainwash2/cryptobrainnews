import { ArticleGridSkeleton } from '@/components/ui/Skeleton';
 
export default function SearchLoading() {
  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-10 border-b border-[#1a1a1a] pb-6">
          <div className="animate-pulse h-12 w-72 bg-[#1a1a1a]" />
        </div>
        <div className="animate-pulse h-12 w-full max-w-xl bg-[#111] mb-10" />
        <ArticleGridSkeleton count={8} />
      </div>
    </main>
  );
}
