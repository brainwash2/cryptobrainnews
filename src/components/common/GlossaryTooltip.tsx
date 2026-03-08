'use client';
import React, { useState } from 'react';

interface Props {
  term: string;
  definition: string;
  children: React.ReactNode;
}

export default function GlossaryTooltip({ term, definition, children }: Props) {
  const [show, setShow] = useState(false);

  return (
    <span 
      className="relative inline-block border-b border-dashed border-[#FABF2C] cursor-help"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#111] border border-[#333] text-white text-xs rounded shadow-2xl z-50 pointer-events-none">
          <strong className="block text-[#FABF2C] mb-1 font-black uppercase tracking-widest">{term}</strong>
          <span className="font-mono text-gray-400 leading-relaxed">{definition}</span>
        </div>
      )}
    </span>
  );
}
