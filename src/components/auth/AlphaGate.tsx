'use client';

import React, { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import Icon from '@/components/ui/AppIcon';

export default function AlphaGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  if (!session) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-primary/20">
        <Icon name="LockClosedIcon" size={48} className="text-primary mb-4 opacity-20" />
        <h2 className="text-2xl font-black text-white uppercase mb-2">Alpha Access Required</h2>
        <p className="text-gray-500 font-mono text-xs uppercase mb-6 tracking-widest">
          Connect your wallet or sign in to view institutional data
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
