'use client';

import React, { useState } from 'react';
import { ShoppingCart, User, ShieldCheck, Zap } from 'lucide-react';

interface Playbook {
  _id: string;
  title: string;
  protocol: string;
  tier: string;
  isThirdParty: boolean;
  authorName?: string;
  priceUsd?: number;
}

export default function MarketplaceClient({ playbooks }: { playbooks: Playbook[] }) {
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  const handleCheckout = async (playbook: Playbook) => {
    setCheckoutId(playbook._id);
    setTimeout(() => {
      alert(`Redirecting to Stripe Checkout for ${playbook.title}...\nFunds will be split with connected account.`);
      setCheckoutId(null);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {playbooks.length === 0 && (
        <div className="col-span-full py-20 text-center border border-dashed border-[#1a1a1a]">
          <p className="text-[#555] font-mono text-xs uppercase tracking-widest">No playbooks listed.</p>
        </div>
      )}

      {playbooks.map((pb) => (
        <div key={pb._id} className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 flex flex-col hover:border-[#FABF2C]/50 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <span className="bg-[#111] text-[#FABF2C] px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded">
              {pb.protocol}
            </span>
            {pb.isThirdParty ? (
              <span className="text-[#00d672] text-[9px] font-mono uppercase tracking-widest flex items-center gap-1 bg-[#00d672]/10 px-2 py-1 rounded">
                <User size={10} /> Creator
              </span>
            ) : (
              <span className="text-[#3b82f6] text-[9px] font-mono uppercase tracking-widest flex items-center gap-1 bg-[#3b82f6]/10 px-2 py-1 rounded">
                <ShieldCheck size={10} /> Official
              </span>
            )}
          </div>
          
          <h3 className="text-xl font-black text-white uppercase mb-2 leading-snug group-hover:text-[#FABF2C] transition-colors">
            {pb.title}
          </h3>
          
          {pb.isThirdParty && (
            <p className="text-xs text-[#888] font-mono mb-6">
              By: {pb.authorName || 'Anonymous'}
            </p>
          )}

          <div className="mt-auto pt-6 border-t border-[#1a1a1a]">
            {pb.isThirdParty && pb.priceUsd ? (
              <button 
                onClick={() => handleCheckout(pb)}
                disabled={checkoutId === pb._id}
                className="w-full flex items-center justify-center gap-2 bg-[#FABF2C] text-black hover:bg-white py-3 text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-50"
              >
                {checkoutId === pb._id ? (
                  'Generating Checkout...'
                ) : (
                  <>
                    <ShoppingCart size={14} /> Buy Now — ${pb.priceUsd}
                  </>
                )}
              </button>
            ) : (
              <a 
                href="/alpha-guides"
                className="w-full flex items-center justify-center gap-2 bg-[#111] border border-[#333] text-white hover:bg-white hover:text-black py-3 text-xs font-black uppercase tracking-widest transition-colors"
              >
                <Zap size={14} /> Available in Alpha
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
