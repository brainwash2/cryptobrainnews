'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { NEWS_CATEGORIES } from '@/lib/news-categories';

interface Props {
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

export default function NewsDropdown({ onClose, buttonRef }: Props) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (buttonRef.current) {
      const r = buttonRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + window.scrollY, left: r.left + window.scrollX });
    }
    const onScroll = () => onClose();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [buttonRef, onClose]);

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Full-page dim */}
      <div className="fixed inset-0 bg-black/70" style={{ zIndex: 9998 }} onClick={onClose} />
      {/* Dropdown — portaled to body, escapes ALL stacking contexts */}
      <div
        className="absolute bg-black border border-[#333] shadow-2xl w-52"
        style={{ top: pos.top + 8, left: pos.left, zIndex: 9999 }}
      >
        <Link href="/news" onClick={onClose}
          className="block px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#FABF2C] hover:bg-[#111] border-b border-[#222] transition-colors">
          All News
        </Link>
        {NEWS_CATEGORIES.map(cat => (
          <Link key={cat.slug} href={`/news/category/${cat.slug}`} onClick={onClose}
            className="block px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#888] hover:text-[#FABF2C] hover:bg-[#111] transition-colors">
            {cat.label}
          </Link>
        ))}
        <div className="border-t border-[#222]">
          <Link href="/bookmarks" onClick={onClose}
            className="block px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#555] hover:text-[#FABF2C] hover:bg-[#111] transition-colors">
            🔖 Saved Articles
          </Link>
        </div>
      </div>
    </>,
    document.body
  );
}
