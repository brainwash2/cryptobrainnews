'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function LazyChart({ src, title }: { src: string; title: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only load the iframe when it gets within 800px of the viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing once loaded
        }
      },
      { rootMargin: '800px' }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref} 
      className="w-full h-[420px] bg-[#111113] rounded-lg overflow-hidden border border-[#27272a] shadow-lg relative transition-colors duration-300 hover:border-[#444]"
    >
      {!isVisible && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <span className="w-6 h-6 border-2 border-[#FABF2C] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#555] font-mono text-[10px] uppercase tracking-widest text-center px-4">
            Mounting {title}...
          </span>
        </div>
      )}
      {isVisible && (
        <iframe
          width="100%"
          height="420"
          frameBorder="0"
          src={src}
          title={title}
          className="w-full h-full bg-transparent border-0"
        ></iframe>
      )}
    </div>
  );
}
