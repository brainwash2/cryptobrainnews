import { Skeleton } from '@/components/ui/Skeleton';
 
export default function ArticleLoading() {
  return (
    <main className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
      <div className="flex gap-10">
        <article className="flex-1 min-w-0 max-w-[800px] space-y-6">
          <div className="flex gap-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-3/4" />
          <div className="flex gap-3 items-center pb-6 border-b border-[#1a1a1a]">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2 w-16" />
            </div>
          </div>
          <Skeleton className="w-full aspect-video" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className={`h-4 ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`} />
          ))}
        </article>
        <aside className="hidden xl:block w-[320px] shrink-0 space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </aside>
      </div>
    </main>
  );
}
