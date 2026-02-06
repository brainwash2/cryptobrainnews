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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    });
    setLoading(false);
    if (error) setMessage(error.message);
    else setMessage('Check your email for the magic link!');
  };

  const handleLogout = async () => await supabase.auth.signOut();

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-xs font-mono text-primary hidden md:block">ALPHA MEMBER</span>
        <button onClick={handleLogout} className="border border-border px-4 py-2 text-xs font-bold hover:bg-white hover:text-black transition-colors">
          LOGOUT
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin} className="flex gap-2">
      <input 
        type="email" 
        placeholder="Enter email..." 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-black border border-gray-700 px-3 py-1 text-xs text-white focus:border-primary outline-none w-32 md:w-auto"
        required
      />
      <button 
        type="submit" 
        disabled={loading}
        className="bg-primary text-black px-4 py-2 text-xs font-black hover:bg-white transition-colors flex items-center gap-2 whitespace-nowrap"
      >
        {loading ? 'SENDING...' : 'LOGIN'}
      </button>
      {message && <span className="absolute top-16 right-4 bg-green-500 text-black text-xs p-2 font-bold">{message}</span>}
    </form>
  );
}