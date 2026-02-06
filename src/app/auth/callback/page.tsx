'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Supabase client automatically detects the #access_token hash in the URL
    // We listen for the SIGNED_IN event to know when it's safe to redirect
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || session) {
        // Successful login! Redirect to the DeFi page to see the unlocked charts
        router.push('/de-fi-analytics');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
      <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mb-6"></div>
      <h1 className="text-2xl font-bold font-heading mb-2">VERIFYING CREDENTIALS</h1>
      <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Establishing Secure Session...</p>
    </div>
  );
}
