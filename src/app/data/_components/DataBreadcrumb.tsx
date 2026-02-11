'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function DataBreadcrumb() {
  const pathname = usePathname();
  // Simple mapping for demo
  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500 font-mono mb-6">
      <Link href="/" className="hover:text-white transition-colors">TERMINAL</Link>
      {segments.map((segment, idx) => (
        <span key={segment} className="flex items-center gap-2">
          <span>/</span>
          <span className={idx === segments.length - 1 ? 'text-primary' : 'hover:text-white'}>
            {segment.replace('-', ' ')}
          </span>
        </span>
      ))}
    </nav>
  );
}
