import { Skeleton, CardSkeleton } from '@/components/ui/Skeleton';
 
export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20 isolate">
      <main className="container mx-auto px-4 lg:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-16">
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="w-full aspect-[21/9]" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </section>
          </div>
          <aside className="lg:col-span-4 space-y-8">
            <Skeleton className="h-96 w-full" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-4 w-6 shrink-0" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
