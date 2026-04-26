'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function QuickLink({ href, label, color }: { href: string; label: string; color: string }) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      href={href}
      className="px-4 py-2 border text-[10px] font-black uppercase tracking-widest transition-all"
      style={{
        borderColor: color,
        color: hover ? '#000' : color,
        background: hover ? color : 'transparent',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {label}
    </Link>
  );
}
