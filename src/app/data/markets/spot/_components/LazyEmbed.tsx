'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function LazyEmbed({ src, title }: { src: string; title: string }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load the iframe when it is 600px away from entering the screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoaded(true);
          observer.disconnect();
        }
      },
      { rootMargin: '600px' }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, []);

  return (
    // Fixed height of 460px ensures the footer buttons are never cut off
    <div ref={ref} className="w-full h-[460px] relative">
      {!isLoaded ? (
        <div className="absolute inset-0 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <span className="w-6 h-6 border-2 border-[#FABF2C] border-t-transparent rounded-full animate-spin" />
            <span className="text-[#555] font-mono text-[10px] uppercase tracking-widest">Loading Chart...</span>
          </div>
        </div>
      ) : (
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          src={src}
          title={title}
          className="w-full h-full border-0 bg-transparent"
        />
      )}
    </div>
  );
}
