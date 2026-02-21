'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-bold text-[#FABF2C] opacity-20">404</h1>
        <h2 className="text-2xl font-black text-white uppercase mb-2">Page Not Found</h2>
        <p className="text-[#555] font-mono text-xs uppercase tracking-widest mb-8">
          The page you're looking for doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 border border-[#1a1a1a] text-white px-6 py-3 text-xs font-black uppercase tracking-widest hover:border-[#FABF2C] transition-all"
          >
            <Icon name="ArrowLeftIcon" size={16} />
            Go Back
          </button>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center justify-center gap-2 bg-[#FABF2C] text-black px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-white transition-all"
          >
            <Icon name="HomeIcon" size={16} />
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
