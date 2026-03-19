'use client';

import React, { useState } from 'react';
import Link                  from 'next/link';
import { usePathname }       from 'next/navigation';
import { DATA_SECTIONS }     from '@/lib/sidebar-config';
import { ChevronDown, ChevronRight, Terminal } from 'lucide-react';
import type { SidebarSection } from '@/lib/types';

function NavSection({
  section,
  currentPath,
}: {
  section: SidebarSection;
  currentPath: string;
}) {
  const isActive = currentPath.startsWith(section.basePath);
  const [open, setOpen]   = useState(isActive);

  return (
    <div>
      {/* Section header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
          isActive ? 'text-[#FABF2C]' : 'text-[#555] hover:text-[#888]'
        }`}
      >
        <span>{section.label}</span>
        {open
          ? <ChevronDown size={12} className="shrink-0" />
          : <ChevronRight size={12} className="shrink-0" />
        }
      </button>

      {/* Children */}
      {open && section.children && (
        <div className="ml-3 border-l border-[#1a1a1a] pl-3 mb-1">
          {section.children.map((child) => {
            const childActive = currentPath === child.href ||
              currentPath.startsWith(child.href + '/');
            return (
              <Link
                key={child.href}
                href={child.href}
                className={`block py-1.5 px-2 text-[10px] font-mono transition-colors rounded-sm ${
                  childActive
                    ? 'text-[#FABF2C] bg-[#FABF2C]/5'
                    : 'text-[#666] hover:text-[#ccc] hover:bg-[#0f0f0f]'
                }`}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DataSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={[
        'hidden lg:flex flex-col',
        'w-72 shrink-0 bg-[#0a0a0a] border-r border-[#1a1a1a]',
        'fixed top-0 left-0 h-screen z-40 overflow-y-auto',
        'pt-14', // below main header
      ].join(' ')}
    >
      {/* Terminal brand header */}
      <div className="px-4 py-5 border-b border-[#1a1a1a] flex items-center gap-2 shrink-0">
        <Terminal size={16} className="text-[#FABF2C] shrink-0" />
        <div>
          <p className="text-[10px] font-black text-[#FABF2C] uppercase tracking-[0.3em]">Data Terminal</p>
          <p className="text-[9px] font-mono text-[#333] mt-0.5">Real-time · No paywall</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {DATA_SECTIONS.map((section) => (
          <NavSection
            key={section.basePath}
            section={section}
            currentPath={pathname}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[#1a1a1a] shrink-0">
        <p className="text-[9px] font-mono text-[#333] leading-relaxed">
          Data: DefiLlama · CoinGecko · Dune · Binance · Deribit
        </p>
        <p className="text-[9px] font-mono text-[#222] mt-1">
          © 2026 CryptoBrainNews
        </p>
      </div>
    </aside>
  );
}
