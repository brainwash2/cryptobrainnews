'use client';
import React, { useState, useRef, useCallback } from 'react';

interface Props {
  term: string;
  definition: string;
  children: React.ReactNode;
}

export default function GlossaryTooltip({ term, definition, children }: Props) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const spanRef = useRef<HTMLSpanElement>(null);
  const tooltipId = `tooltip-${term.replace(/\s+/g, '-').toLowerCase()}`;

  const updatePosition = useCallback(() => {
    if (!spanRef.current) return;
    const rect = spanRef.current.getBoundingClientRect();
    // If less than 120px above, show below
    setPosition(rect.top < 120 ? 'bottom' : 'top');
  }, []);

  function open() {
    updatePosition();
    setShow(true);
  }

  return (
    <span
      ref={spanRef}
      className="relative inline-block border-b border-dashed border-[#FABF2C] cursor-help"
      onMouseEnter={open}
      onMouseLeave={() => setShow(false)}
      onFocus={open}
      onBlur={() => setShow(false)}
      // Touch: toggle on tap
      onTouchEnd={(e) => {
        e.preventDefault();
        show ? setShow(false) : open();
      }}
      tabIndex={0}
      role="button"
      aria-describedby={show ? tooltipId : undefined}
    >
      {children}
      {show && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`absolute ${
            position === 'top'
              ? 'bottom-full mb-2'
              : 'top-full mt-2'
          } left-1/2 -translate-x-1/2 w-64 p-3 bg-[#111] border border-[#333] text-white text-xs shadow-2xl z-50 pointer-events-none`}
          style={{ maxWidth: 'min(16rem, 90vw)' }}
        >
          <strong className="block text-[#FABF2C] mb-1 font-black uppercase tracking-widest">{term}</strong>
          <span className="font-mono text-gray-400 leading-relaxed">{definition}</span>
        </div>
      )}
    </span>
  );
}
