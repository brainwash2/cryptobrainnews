// src/components/auth/AlphaGate.tsx
'use client';

import React, { useEffect, useState } from 'react';
// FIX: Use single shared Supabase client
import { supabase } from '@/lib/supabase';
import Icon from '@/components/ui/AppIcon';

export default function AlphaGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  if (loading) {
    return (
      <div className="h-64 bg-[#080808] animate-pulse border border-[#1a1a1a]" />
    );
  }

  if (session) {
    return <div className="relative">{children}</div>;
  }

  return (
    <div className="relative overflow-hidden border border-[#1a1a1a] bg-[#080808]">
      <div
        className="filter blur-md opacity-20 pointer-events-none select-none grayscale"
        aria-hidden="true"
      >
        {children}
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/70 p-6 text-center backdrop-blur-sm">
        <div className="bg-primary/10 border-2 border-primary p-4 rounded-full mb-6 shadow-[0_0_30px_rgba(250,191,44,0.2)]">
          <Icon name="LockClosedIcon" className="text-primary" size={36} />
        </div>

        <h3 className="text-2xl font-black font-heading text-white mb-3 uppercase tracking-tighter">
          Alpha Intel <span className="text-primary">Locked</span>
        </h3>

        <p className="text-[#666] font-mono text-[10px] mb-8 max-w-sm leading-relaxed uppercase tracking-wider">
          Institutional-grade on-chain data. Join 50,000+ traders.
        </p>

        <button
          onClick={handleLogin}
          className="bg-primary text-black font-black px-8 py-3 hover:bg-white transition-all uppercase tracking-[0.2em] text-xs shadow-lg hover:scale-105"
        >
          Unlock Alpha Access
        </button>
      </div>
    </div>
  );
}
