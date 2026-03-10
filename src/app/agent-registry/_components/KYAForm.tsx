'use client';

import React, { useState } from 'react';
import { Copy, CheckCircle, Terminal } from 'lucide-react';

export default function KYAForm() {
  const [form, setForm] = useState({ agentName: '', pubkey: '', webhook: '' });
  const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const[apiKey, setApiKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const[copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('generating');
    setErrorMsg('');
    
    try {
      const res = await fetch('/api/agent-registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      setApiKey(data.apiKey);
      setStatus('success');
    } catch (err: any) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputCls = "w-full bg-[#050505] border border-[#222] px-4 py-3 text-xs text-white font-mono outline-none focus:border-[#FABF2C] placeholder:text-[#333]";

  if (status === 'success') {
    return (
      <div className="bg-[#0a0a0a] border border-[#00d672]/30 p-8 text-center rounded">
        <CheckCircle className="text-[#00d672] w-12 h-12 mx-auto mb-4" />
        <h3 className="text-xl font-black text-white uppercase mb-2">Agent Registered</h3>
        <p className="text-xs text-[#888] font-mono mb-6">
          Identity verified. Your Oracle API key is ready for deployment. This key will not be shown again.
        </p>
        <div className="bg-black border border-[#222] p-4 flex items-center justify-between gap-4 rounded mb-6">
          <code className="text-[#00d672] text-xs font-mono break-all text-left">{apiKey}</code>
          <button onClick={handleCopy} className="text-[#555] hover:text-white shrink-0">
            {copied ? <CheckCircle size={16} className="text-[#00d672]" /> : <Copy size={16} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded">
      <div>
        <label className="block text-[10px] font-black uppercase text-[#555] tracking-widest mb-2">Agent Identifier</label>
        <input required type="text" placeholder="e.g. OpenClaw-Alpha-01" value={form.agentName} onChange={(e) => setForm({ ...form, agentName: e.target.value })} className={inputCls} />
      </div>
      <div>
        <label className="block text-[10px] font-black uppercase text-[#555] tracking-widest mb-2">Cryptographic Pubkey (ERC-8004)</label>
        <input required type="text" placeholder="0x..." value={form.pubkey} onChange={(e) => setForm({ ...form, pubkey: e.target.value })} className={inputCls} />
      </div>
      <button type="submit" disabled={status === 'generating'} className="w-full bg-[#FABF2C] text-black py-4 text-xs font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 mt-4">
        {status === 'generating' ? 'INITIALIZING KYA HANDSHAKE...' : 'REGISTER AGENT'}
      </button>
      {status === 'error' && <p className="text-red-500 text-[10px] font-mono mt-2 uppercase">{errorMsg}</p>}
    </form>
  );
}
