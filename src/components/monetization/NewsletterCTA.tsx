'use client';
import React, { useState } from 'react';
 
interface Props {
  variant?: 'inline' | 'banner';
  category?: string;
}
 
export default function NewsletterCTA({ variant = 'inline', category }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
 
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setStatus('loading');
    try {
      // Replace with your email provider endpoint (Mailchimp, ConvertKit, Resend, etc.)
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, category }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch { setStatus('error'); }
  }
 
  if (variant === 'banner') {
    return (
      <div className="w-full bg-[#FABF2C] py-3 px-4">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-black font-black text-xs uppercase tracking-widest">
            📡 Get daily alpha in your inbox — free
          </p>
          {status === 'success' ? (
            <p className="text-black font-black text-xs uppercase">✓ You're in. Check your inbox.</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" required
                className="bg-black text-white placeholder-[#555] px-3 py-1.5 text-xs font-mono w-48 focus:outline-none"
              />
              <button type="submit" disabled={status === 'loading'}
                className="bg-black text-[#FABF2C] px-4 py-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50">
                {status === 'loading' ? '…' : 'Subscribe'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }
 
  return (
    <div className="my-12 bg-[#0a0a0a] border border-[#1a1a1a] p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="bg-[#FABF2C] text-black text-[10px] font-black px-2 py-1 uppercase tracking-widest shrink-0">
          FREE
        </div>
        <div>
          <h3 className="text-white font-black uppercase tracking-tight text-lg mb-1">
            The CryptoBrain Daily Brief
          </h3>
          <p className="text-[#888] text-xs font-mono">
            Institutional-grade intel delivered every morning.{category ? ` Curated for ${category} traders.` : ''}
          </p>
        </div>
      </div>
 
      {status === 'success' ? (
        <p className="text-[#00d672] font-black text-sm uppercase tracking-widest">
          ✓ Confirmed. First brief arrives tomorrow at 08:00 UTC.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com" required
            className="flex-1 bg-[#111] border border-[#333] text-white placeholder-[#444] px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#FABF2C] transition-colors"
          />
          <button type="submit" disabled={status === 'loading'}
            className="bg-[#FABF2C] text-black px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 shrink-0">
            {status === 'loading' ? 'Subscribing…' : 'Get the Brief →'}
          </button>
        </form>
      )}
      {status === 'error' && (
        <p className="text-red-400 text-xs font-mono mt-2">Something went wrong. Try again.</p>
      )}
    </div>
  );
}
