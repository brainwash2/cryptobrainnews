import { getAllArticles } from '@/lib/articles';
import Link from 'next/link';

export async function ArticleSidebar() {
  const all = await getAllArticles();
  // Filter for high-quality items for the sidebar
  const trending = all.slice(0, 6);

  return (
    <aside className="hidden xl:block w-[320px] shrink-0 space-y-10">
      <div className="bg-[#0a0a0a] border border-white/5 p-6">
        <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-primary mb-2">Alpha Alerts</h4>
        <p className="text-xs text-gray-500 mb-6 font-body leading-relaxed">Institutional-grade intelligence delivered to your inbox daily.</p>
        <form className="space-y-3">
          <input type="email" placeholder="Terminal ID (Email)" className="w-full bg-black border border-white/10 px-4 py-2 text-xs font-mono focus:border-primary outline-none" />
          <button className="w-full bg-primary text-black font-black text-[10px] uppercase py-2 tracking-widest hover:bg-white transition-colors">Subscribe</button>
        </form>
      </div>

      <div>
        <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-8 flex items-center gap-4">
          Trending
          <div className="h-px flex-1 bg-white/5" />
        </h4>
        <div className="space-y-8">
          {trending.map((story, idx) => (
            <Link key={story.id} href={story.url.startsWith('http') ? story.url : `/news/${story.id}`} className="group block">
              <div className="flex gap-4">
                <span className="font-mono text-xs text-gray-700">{String(idx + 1).padStart(2, '0')}</span>
                <h5 className="text-[13px] font-bold text-gray-300 group-hover:text-primary transition-colors leading-snug uppercase">
                  {story.title}
                </h5>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
