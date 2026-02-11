'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface NavSection {
  label: string;
  icon: string;
  children: { label: string; href: string }[];
}

const SECTIONS: NavSection[] = [
  {
    label: 'Market',
    icon: 'ChartBarIcon',
    children: [
      { label: 'Overview', href: '/markets-overview' }, // Mapping to existing
      { label: 'Spot', href: '/markets-overview?tab=spot' },
      { label: 'Futures', href: '/markets-overview?tab=futures' },
      { label: 'Volumes', href: '/markets-overview' },
    ],
  },
  {
    label: 'DeFi',
    icon: 'CircleStackIcon',
    children: [
      { label: 'Overview', href: '/de-fi-analytics' }, // Mapping to existing
      { label: 'TVL Rankings', href: '/de-fi-analytics' },
      { label: 'Yields', href: '/de-fi-analytics' },
      { label: 'Whale Watch', href: '/de-fi-analytics' },
    ],
  },
  {
    label: 'Price Indexes',
    icon: 'CurrencyDollarIcon',
    children: [
      { label: 'Top 100', href: '/price-indexes' },
      { label: 'Gainers/Losers', href: '/price-indexes' },
    ],
  },
  {
    label: 'On-Chain',
    icon: 'CubeTransparentIcon',
    children: [
      { label: 'Gas Tracker', href: '#' }, // Placeholders for future
      { label: 'Active Addresses', href: '#' },
    ],
  },
];

export function DataSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-[#222] bg-black min-h-screen sticky top-0 self-start hidden lg:block">
      <div className="p-4">
        <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 font-mono">
          Terminal Nav
        </div>
        <nav className="space-y-1">
          {SECTIONS.map((section) => (
            <SectionGroup key={section.label} section={section} pathname={pathname} />
          ))}
        </nav>
      </div>
    </aside>
  );
}

function SectionGroup({ section, pathname }: { section: NavSection; pathname: string }) {
  const isActive = section.children.some((c) => pathname.includes(c.href));
  const [open, setOpen] = useState(true); // Default open for visibility

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 rounded transition-colors uppercase tracking-wide"
      >
        <span className="flex items-center gap-2">
          <Icon name={section.icon as any} size={14} className="text-primary" />
          {section.label}
        </span>
        <Icon name={open ? 'ChevronDownIcon' : 'ChevronRightIcon'} size={12} />
      </button>

      {open && (
        <div className="ml-4 mt-1 space-y-0.5 border-l border-[#333] pl-3">
          {section.children.map((item) => {
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`block px-3 py-1.5 text-[11px] font-medium rounded transition-colors ${
                   pathname === item.href
                    ? 'text-primary bg-primary/10 border-r-2 border-primary'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
