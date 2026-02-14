'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

const SECTIONS = [
  {
    label: 'Market',
    icon: 'ChartBarIcon',
    children: [
      { label: 'Overview', href: '/data/market' },
      { label: 'Spot', href: '/data/market/spot' },
      { label: 'Futures', href: '/data/market/futures' },
      { label: 'Volumes', href: '/data/market/volumes' },
    ],
  },
  {
    label: 'ETFs',
    icon: 'BanknotesIcon',
    children: [
      { label: 'Overview', href: '/data/etfs' },
      { label: 'Bitcoin ETFs', href: '/data/etfs/bitcoin' },
      { label: 'Ethereum ETFs', href: '/data/etfs/ethereum' },
    ],
  },
  {
    label: 'DeFi',
    icon: 'CircleStackIcon',
    children: [
      { label: 'Overview', href: '/data/defi' },
      { label: 'TVL', href: '/data/defi/tvl' },
      { label: 'Yields', href: '/data/defi/yields' },
      { label: 'Stablecoins', href: '/data/defi/stablecoins' },
      { label: '🐋 Whale Watch', href: '/data/defi/whale-watch' },
    ],
  },
  {
    label: 'On‑Chain',
    icon: 'CubeTransparentIcon',
    children: [
      { label: 'Overview', href: '/data/onchain' },
      { label: 'Gas Tracker', href: '/data/onchain/gas' },
      { label: 'Active Addresses', href: '/data/onchain/addresses' },
    ],
  },
];

export function DataSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 shrink-0 border-r border-[#222] bg-black min-h-screen sticky top-16 self-start hidden lg:block">
      <div className="p-4">
        <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 font-mono">Data Terminal</div>
        <nav className="space-y-1">
          {SECTIONS.map((section) => (
            <SectionGroup key={section.label} section={section} pathname={pathname} />
          ))}
        </nav>
      </div>
    </aside>
  );
}

function SectionGroup({ section, pathname }: { section: typeof SECTIONS[0]; pathname: string }) {
  const isActive = section.children.some(c => pathname === c.href || pathname.startsWith(c.href + '/'));
  const [open, setOpen] = useState(isActive);
  return (
    <div className="mb-2">
      <button onClick={() => setOpen(!open)} className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 rounded transition-colors uppercase tracking-wide ${isActive ? 'bg-white/10 text-white' : ''}`}>
        <span className="flex items-center gap-2">
          <Icon name={section.icon as any} size={14} className="text-primary" />
          {section.label}
        </span>
        <Icon name={open ? 'ChevronDownIcon' : 'ChevronRightIcon'} size={12} />
      </button>
      {open && (
        <div className="ml-4 mt-1 space-y-0.5 border-l border-[#333] pl-3">
          {section.children.map((item) => {
            const isItemActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`block px-3 py-1.5 text-[11px] font-medium rounded transition-colors ${
                isItemActive ? 'text-primary bg-primary/10 border-r-2 border-primary' : 'text-gray-500 hover:text-white'
              }`}>
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
