'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client'; // Use our shared client
import Icon from '@/components/ui/AppIcon';

export default function AlphaGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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

  if (loading) return <div className="h-64 bg-card animate-pulse border border-border"></div>;

  // 1. IF USER IS LOGGED IN -> SHOW CONTENT
  if (session) {
    return <div className="relative">{children}</div>;
  }

  // 2. IF NOT LOGGED IN -> SHOW LOCK SCREEN
  return (
    <div className="relative overflow-hidden border border-border bg-card">
      {/* Blurred Content Background (The "Teaser") */}
      <div className="filter blur-md opacity-30 pointer-events-none select-none grayscale" aria-hidden="true">
        {children}
      </div>

      {/* Lock Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/60 p-6 text-center backdrop-blur-sm">
        <div className="bg-primary/10 border-2 border-primary p-4 rounded-full mb-6 shadow-[0_0_30px_rgba(250,191,44,0.3)]">
          <Icon name="LockClosedIcon" className="text-primary" size={40} />
        </div>
        
        <h3 className="text-3xl font-black font-heading text-white mb-3 uppercase tracking-tighter">
          Alpha Intelligence <span className="text-primary">Locked</span>
        </h3>
        
        <p className="text-gray-300 font-mono text-xs mb-8 max-w-md leading-relaxed">
          This tool utilizes institutional-grade on-chain data. Join 50,000+ traders accessing deep liquidity metrics and yield strategies.
        </p>
        
        <button 
          onClick={handleLogin}
          className="bg-primary text-black font-black px-8 py-4 hover:bg-white transition-all uppercase tracking-[0.2em] text-xs shadow-lg hover:scale-105"
        >
          Unlock Alpha Access
        </button>
      </div>
    </div>
  );
}
