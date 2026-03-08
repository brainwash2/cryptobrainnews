'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GitcoinPassport() {
  const[address, setAddress] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/verify-passport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        
        body: JSON.stringify({ address })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Verification failed');

      if (data.isHuman) {
        setStatus('success');
        // Redirect to unlocked state
        router.push('/alpha-guides?unlocked=true');
      } else {
        setStatus('error');
        setErrorMsg(`Score too low (${data.score}). Must be >= 20.`);
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="mt-6 border-t border-[#1a1a1a] pt-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 bg-[#00d672] rounded-full animate-pulse" />
        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#00d672]">Human Verification</h4>
      </div>
      <p className="text-xs text-[#888] mb-4 text-left leading-relaxed">
        Sybil-resistant bypass. Enter your wallet address. If your Gitcoin Passport score is &gt; 20, access is granted for free.
      </p>
      
      <form onSubmit={handleVerify} className="flex gap-2">
        <input 
          type="text" 
          placeholder="0x..." 
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="bg-black border border-[#222] px-3 py-2 text-xs text-white font-mono outline-none focus:border-[#00d672] flex-1"
          required
        />
        <button 
          type="submit"
          disabled={status === 'loading'}
          className="bg-[#1a1a1a] border border-[#333] text-[#00d672] hover:bg-[#00d672] hover:text-black px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
        >
          {status === 'loading' ? 'VERIFYING...' : 'VERIFY'}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-[#ff4757] font-mono text-[10px] mt-2 text-left">{errorMsg}</p>
      )}
    </div>
  );
}
