'use client';
import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'cbn:newsletter-dismissed';
declare global {
  interface Window {
    __cbnPopupShown?: boolean;
  }
}

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Check global flag (per session)
    if (window.__cbnPopupShown) return;

    // Check localStorage (24h)
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed && Date.now() - parseInt(dismissed) < 24 * 60 * 60 * 1000) return;

    window.__cbnPopupShown = true;

    // Show after 8 seconds
    timerRef.current = setTimeout(() => setVisible(true), 8000);

    // Exit intent
    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY <= 0) {
        clearTimeout(timerRef.current);
        setVisible(true);
      }
    }
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timerRef.current);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    window.__cbnPopupShown = true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? 'success' : 'error');
      if (res.ok) setTimeout(dismiss, 3000);
    } catch { setStatus('error'); }
  };

  if (!visible) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-[500] backdrop-blur-sm" onClick={dismiss} />
      <div className="fixed inset-x-4 bottom-4 md:inset-auto md:bottom-8 md:right-8 md:w-[420px] bg-[#0a0a0a] border border-[#FABF2C]/30 shadow-2xl z-[600] p-8">
        <button onClick={dismiss} className="absolute top-4 right-4 text-[#555] hover:text-white">
          <X size={16} />
        </button>
        <div className="inline-block bg-[#FABF2C] text-black text-[9px] font-black px-2 py-1 uppercase tracking-widest mb-4">Free Intel</div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-tight mb-2">
          The CryptoBrain<br /><span className="text-[#FABF2C]">Daily Brief</span>
        </h2>
        <p className="text-[#888] text-xs font-mono mb-6 leading-relaxed">
          Institutional-grade crypto intelligence every morning. No noise, no spam — just alpha.
        </p>
        {status === 'success' ? (
          <div className="text-center py-4">
            <p className="text-[#00d672] font-black text-sm uppercase tracking-widest mb-1">✓ You&apos;re in.</p>
            <p className="text-[#555] font-mono text-xs">First brief arrives tomorrow at 08:00 UTC.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoFocus
              className="w-full bg-[#111] border border-[#333] text-white placeholder-[#444] px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#FABF2C]"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-[#FABF2C] text-black py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white disabled:opacity-50"
            >
              {status === 'loading' ? 'Subscribing…' : 'Get the Daily Brief →'}
            </button>
            {status === 'error' && (
              <p className="text-red-400 text-xs font-mono text-center">Something went wrong. Try again.</p>
            )}
          </form>
        )}
        <p className="text-[#333] text-[10px] font-mono text-center mt-4">Unsubscribe anytime. No credit card required.</p>
      </div>
    </>
  );
}
