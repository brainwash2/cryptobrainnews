'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { DATA_SECTIONS } from '@/lib/sidebar-config';
import type { SidebarSection } from '@/lib/types';

export function DataSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 w-12 h-12 bg-primary text-black flex items-center justify-center shadow-xl"
        aria-label="Toggle sidebar"
      >
        <Icon name={mobileOpen ? 'XMarkIcon' : 'Bars3Icon'} size={20} />
      </button>

      {/* Sidebar */}
      <aside
        className={`
          w-64 shrink-0 border-r border-[#1a1a1a] bg-black min-h-screen sticky top-[6.5rem] self-start
          ${mobileOpen ? 'fixed inset-0 z-40 block' : 'hidden lg:block'}
        `}
      >
        <div className="p-4 h-[calc(100vh-6.5rem)] overflow-y-auto">
          <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 font-mono">
            Data Terminal
          </div>
          <nav className="space-y-1">
            {DATA_SECTIONS.map((section) => (
              <SectionGroup
                key={section.label}
                section={section}
                pathname={pathname}
              />
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}

function SectionGroup({
  section,
  pathname,
}: {
  section: SidebarSection;
  pathname: string;
}) {
  const isActive = section.children.some(
    (c) => pathname === c.href || pathname.startsWith(c.href + '/')
  );
  const [open, setOpen] = useState(isActive);

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen(!open)}
        className={`
          w-full flex items-center justify-between px-3 py-2 text-xs font-bold
          text-gray-300 hover:text-white hover:bg-white/5 rounded transition-colors
          uppercase tracking-wide
          ${isActive ? 'bg-white/10 text-white' : ''}
        `}
      >
        <span className="flex items-center gap-2">
          <Icon name={section.icon} size={14} className="text-primary" />
          {section.label}
        </span>
        <Icon
          name={open ? 'ChevronDownIcon' : 'ChevronRightIcon'}
          size={12}
        />
      </button>
      {open && (
        <div className="ml-4 mt-1 space-y-0.5 border-l border-[#333] pl-3">
          {section.children.map((item) => {
            const isItemActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  block px-3 py-1.5 text-[11px] font-medium rounded transition-colors
                  ${
                    isItemActive
                      ? 'text-primary bg-primary/10 border-r-2 border-primary'
                      : 'text-gray-500 hover:text-white'
                  }
                `}
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
