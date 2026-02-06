'use client';
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true }
    });
    setLoading(false);
    if (error) setMessage(error.message);
    else setView('code');
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });
    setLoading(false);
    if (error) setMessage(error.message);
  };

  const handleLogout = async () => await supabase.auth.signOut();

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] border border-primary/30 px-2 py-1">Alpha Member</span>
        <button onClick={handleLogout} className="bg-white/10 text-white px-4 py-2 text-[10px] font-black hover:bg-white hover:text-black transition-all uppercase">
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
            className="bg-black border border-gray-800 px-4 py-2 text-[10px] text-white focus:border-primary outline-none w-48 font-black tracking-widest"
            required
          />
          <button type="submit" disabled={loading} className="bg-primary text-black px-6 py-2 text-[10px] font-black hover:bg-white transition-all uppercase">
            {loading ? 'SENDING...' : 'LOGIN'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="flex gap-2 animate-in fade-in zoom-in duration-300">
          <input 
            type="text" 
            placeholder="6-DIGIT CODE" 
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="bg-black border border-primary px-4 py-2 text-[10px] text-white focus:ring-2 focus:ring-primary outline-none w-32 font-black tracking-[0.3em]"
            required
          />
          <button type="submit" disabled={loading} className="bg-white text-black px-6 py-2 text-[10px] font-black hover:bg-primary transition-all uppercase">
            {loading ? 'VERIFYING...' : 'CONFIRM'}
          </button>
          <button onClick={() => setView('email')} className="text-gray-500 hover:text-white p-2">
            <Icon name="XMarkIcon" size={16} />
          </button>
        </form>
      )}
      {message && <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 text-[10px] font-black tracking-widest shadow-2xl z-[2000]">{message.toUpperCase()}</div>}
    </div>
  );
}
