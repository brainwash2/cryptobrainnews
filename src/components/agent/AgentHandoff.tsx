'use client';

import React, { useState } from 'react';
import { Copy, CheckCircle, Terminal } from 'lucide-react';

interface Props {
  protocol: string;
}

export default function AgentHandoff({ protocol }: Props) {
  const [copied, setCopied] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cryptobrainnews.vercel.app';
  const payload = {
    action: 'execute_arbitrage_swap',
    target_protocol: protocol,
    network: 'arbitrum',
    amount_usd: 500
  };

  const curlCommand = `curl -X POST ${baseUrl}/api/execute \\
  -H "Content-Type: application/json" \\
  -H "Authorization: L402 <your_paid_macaroon>" \\
  -d '${JSON.stringify(payload)}'`;

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative z-10">
      <div className="bg-black border border-[#222] p-4 rounded font-mono text-xs text-[#00d672] mb-4 overflow-x-auto whitespace-pre-wrap">
        {curlCommand}
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className="bg-[#1a1a1a] border border-[#00d672]/30 text-[#00d672] hover:bg-[#00d672] hover:text-black px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors rounded flex items-center gap-2"
        >
          {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy Command'}
        </button>
        <a
          href="/pricing"
          className="bg-[#111] border border-[#333] text-white hover:bg-white hover:text-black px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors rounded flex items-center gap-2"
        >
          <Terminal size={14} /> Get L402 Token
        </a>
      </div>
      <p className="text-[10px] text-[#555] font-mono mt-4">
        ⚡ Pay-per-compute via Lightning / L2. See <Link href="/pricing" className="text-[#FABF2C] underline">pricing</Link> for details.
      </p>
    </div>
  );
}
