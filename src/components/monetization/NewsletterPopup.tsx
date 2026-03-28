'use client';
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const LS_KEY = 'cbn:nl';
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Runs outside React — checks both localStorage AND sessionStorage
// sessionStorage guards against StrictMode double-invoke in dev
function shouldShow(): boolean {
  if (typeof window === 'undefined') return false;
  // Session guard — once per browser session, no re-triggers
  if (sessionStorage.getItem(LS_KEY)) return false;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return true;
    const { ts, subscribed } = JSON.parse(raw);
    if (subscribed) return false;
    return Date.now() - ts > COOLDOWN_MS;
  } catch { return true; }
}

function record(subscribed = false) {
  try {
    sessionStorage.setItem(LS_KEY, '1'); // prevent re-show this session
    localStorage.setItem(LS_KEY, JSON.stringify({ ts: Date.now(), subscribed }));
  } catch {}
}

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');

  useEffect(() => {
    if (!shouldShow()) return;

    // Mark session immediately so StrictMode double-invoke won't show twice
    sessionStorage.setItem(LS_KEY, 'pending');

    let timer: ReturnType<typeof setTimeout>;
    let shown = false;

    function show() {
      if (shown) return;
      shown = true;
      clearTimeout(timer);
      setVisible(true);
    }

    timer = setTimeout(show, 12000);

    function onLeave(e: MouseEvent) {
      if (e.clientY <= 0) show();
    }
    document.addEventListener('mouseleave', onLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []); // runs once

  function dismiss() {
    setVisible(false);
    record(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('success');
        record(true); // never show again
        setTimeout(() => setVisible(false), 3500);
      } else { setStatus('error'); }
    } catch { setStatus('error'); }
  }

  if (!visible) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[500]" onClick={dismiss} />
      <div className="fixed bottom-6 right-6 w-[340px] max-w-[calc(100vw-2rem)] bg-[#0a0a0a] border border-[#FABF2C]/40 shadow-2xl z-[600] p-6"
        onClick={e => e.stopPropagation()}>
        <button onClick={dismiss} className="absolute top-3 right-3 text-[#555] hover:text-white transition-colors">
          <X size={14} />
        </button>
        <span className="inline-block bg-[#FABF2C] text-black text-[9px] font-black px-2 py-0.5 uppercase tracking-widest mb-3">Free</span>
        <h2 className="text-lg font-black text-white uppercase tracking-tight mb-1">
          The CryptoBrain <span className="text-[#FABF2C]">Daily Brief</span>
        </h2>
        <p className="text-[#666] text-xs font-mono mb-4">Institutional alpha every morning. No spam.</p>
        {status === 'success' ? (
          <p className="text-[#00d672] font-black text-sm uppercase py-2">✓ Confirmed. See you tomorrow.</p>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-2">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com" required autoFocus
              className="bg-[#111] border border-[#333] text-white placeholder-[#444] px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[#FABF2C] transition-colors" />
            <button type="submit" disabled={status === 'loading'}
              className="bg-[#FABF2C] text-black py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50">
              {status === 'loading' ? '…' : 'Get the Brief →'}
            </button>
            {status === 'error' && <p className="text-red-400 text-xs font-mono text-center">Try again.</p>}
          </form>
        )}
        <p className="text-[#2a2a2a] text-[9px] font-mono mt-2 text-center">Won't show again for 7 days.</p>
      </div>
    </>
  );
}
