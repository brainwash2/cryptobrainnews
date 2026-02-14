// src/components/auth/AuthButton.tsx
'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
// FIX: Use single shared Supabase client
import { supabase } from '@/lib/supabase';

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [view, setView] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('INVALID EMAIL FORMAT');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) setMessage(error.message);
    else setView('code');
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Sanitize token: only digits, max 6
    const cleanToken = token.replace(/\D/g, '').slice(0, 6);
    if (cleanToken.length !== 6) {
      setMessage('CODE MUST BE 6 DIGITS');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: cleanToken,
      type: 'email',
    });
    setLoading(false);
    if (error) setMessage(error.message);
  };

  const handleLogout = async () => await supabase.auth.signOut();

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
            autoComplete="email"
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
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="6-DIGIT CODE"
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
            className="bg-black border border-primary px-4 py-2 text-[10px] text-white outline-none w-32 font-black tracking-[0.3em]"
            required
            autoComplete="one-time-code"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black px-6 py-2 text-[10px] font-black hover:bg-primary transition-all uppercase disabled:opacity-50"
          >
            {loading ? '...' : 'CONFIRM'}
          </button>
          <button
            type="button"
            onClick={() => setView('email')}
            className="text-[#555] hover:text-white p-2"
          >
            <Icon name="XMarkIcon" size={16} />
          </button>
        </form>
      )}
      {message && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 text-[10px] font-black tracking-widest shadow-2xl z-[2000]">
          {message.toUpperCase()}
        </div>
      )}
    </div>
  );
}
