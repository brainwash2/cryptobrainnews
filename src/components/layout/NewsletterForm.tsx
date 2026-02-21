'use client';

import React, { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setStatus('loading');
    try {
      // TODO: Replace with your newsletter provider (Resend, Mailchimp, etc.)
      // For now, just log and show success to prevent silent failure
      console.log('[Newsletter] Signup:', email);
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <p className="text-[#00d672] font-mono text-xs uppercase tracking-widest">
        ✓ You&apos;re on the list.
      </p>
    );
  }

  return (
    <form className="flex" onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        required
        disabled={status === 'loading'}
        className="bg-[#0a0a0a] border border-[#1a1a1a] px-4 py-2 text-xs text-white focus:outline-none focus:border-primary flex-grow disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-primary text-black px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
      >
        {status === 'loading' ? '...' : 'Join'}
      </button>
      {status === 'error' && (
        <p className="text-[#ff4757] font-mono text-[10px] mt-1">Something went wrong.</p>
      )}
    </form>
  );
}
