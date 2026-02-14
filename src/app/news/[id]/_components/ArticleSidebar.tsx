import { getRealNews } from '@/lib/api';
import Link from 'next/link';

export async function ArticleSidebar() {
  const trending = await getRealNews();
  return (
    <aside className="hidden xl:block w-[320px] shrink-0 space-y-8">
      <div className="bg-card border border-border p-6">
        <h4 className="font-bold text-xs uppercase tracking-wider text-primary mb-2">Daily Alpha</h4>
        <p className="text-sm text-muted-foreground mb-4">Get institutional‑grade crypto intelligence.</p>
        <form className="space-y-3">
          <input type="email" placeholder="your@email.com"
                 className="w-full px-4 py-2.5 bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          <button className="w-full px-4 py-2.5 bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wider hover:opacity-90">
            Subscribe
          </button>
        </form>
      </div>
      <div className="bg-card border border-border p-6">
        <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-4">Trending Now</h4>
        <ul className="space-y-4">
          {trending.slice(0, 5).map((article: any, idx: number) => (
            <li key={article.id}>
              <Link href={`/news/${article.id}`} className="flex gap-3 group">
                <span className="text-2xl font-black text-border group-hover:text-primary transition-colors font-data leading-none mt-0.5">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="text-sm font-semibold text-foreground group-hover:text-primary line-clamp-2">
                  {article.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
