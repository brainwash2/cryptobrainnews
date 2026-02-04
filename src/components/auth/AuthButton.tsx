'use client';
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

// Initialize Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check active session
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    // For MVP, we use OAuth (Google/Github) or Magic Link
    // Here we trigger the Google Login
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-xs font-mono text-primary hidden md:block">
          {user.email}
        </span>
        <button 
          onClick={handleLogout}
          className="border border-border px-4 py-2 text-xs font-bold hover:bg-white hover:text-black transition-colors"
        >
          LOGOUT
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={handleLogin}
      className="bg-primary text-black px-6 py-2 text-xs font-black hover:bg-white transition-colors flex items-center gap-2"
    >
      <Icon name="UserIcon" size={16} />
      LOGIN / JOIN
    </button>
  );
}
