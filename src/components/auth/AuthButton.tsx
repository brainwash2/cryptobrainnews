'use client';

import React, { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';
import Icon from '@/components/ui/AppIcon';
import type { User } from '@supabase/supabase-js';

export default function AuthButton() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [view, setView] = useState<'email' | 'verify'>('email');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/auth/callback' },
    });

    setLoading(false);
    if (error) {
      setMessage(error.message);
    } else {
      setView('verify');
      setMessage('CODE SENT');
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const supabase = getSupabase();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: token.replace(/\D/g, ''),
      type: 'email',
    });

    setLoading(false);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('');
      setView('email');
      setEmail('');
      setToken('');
    }
  };

  const handleLogout = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
  };

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] border border-primary/30 px-2 py-1">
          ALPHA
        </span>
        <button
          onClick={handleLogout}
          className="bg-white/10 text-white px-4 py-2 text-[10px] font-black hover:bg-white hover:text-black transition-all uppercase"
        >
          LOGOUT
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {view === 'email' ? (
        <form onSubmit={handleSendCode} className="flex gap-2">
          <input
            type="email"
            placeholder="ENTER EMAIL..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-black border border-[#222] px-4 py-2 text-[10px] text-white focus:border-primary outline-none w-48 font-black tracking-widest"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-black px-6 py-2 text-[10px] font-black hover:bg-white transition-all uppercase disabled:opacity-50"
          >
            {loading ? '...' : 'LOGIN'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="flex gap-2">
          <input
            type="text"
            placeholder="CODE"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="bg-black border border-primary px-4 py-2 text-[10px] text-white outline-none w-32 font-black tracking-[0.3em]"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black px-6 py-2 text-[10px] font-black hover:bg-primary transition-all uppercase disabled:opacity-50"
          >
            {loading ? '...' : 'CONFIRM'}
          </button>
          <button type="button" onClick={() => setView('email')} className="text-[#555] hover:text-white">
            <Icon name="XMarkIcon" size={16} />
          </button>
        </form>
      )}
      {message && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 text-[10px] font-black tracking-widest z-[2000]">
          {message.toUpperCase()}
        </div>
      )}
    </div>
  );
}
