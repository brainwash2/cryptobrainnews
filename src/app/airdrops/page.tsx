export const dynamic = 'force-dynamic';

import React from 'react';
import { getDeFiProtocols } from '@/lib/api';
import { ExternalLink, ShieldCheck, Droplets } from 'lucide-react';

export const metadata = { title: 'Airdrop Radar | CryptoBrainNews' };

function getAffiliateLink(chain: string, protocolUrl: string) {
  const BYBIT_REF = "YOUR_BYBIT_REF";
  const ORBITER_REF = "YOUR_ORBITER_REF";
  const PORTAL_REF = "YOUR_PORTAL_REF";
  const chainLower = (chain || '').toLowerCase();
  
  if (chainLower.includes('solana')) return { url: `https://portalbridge.com/?ref=${PORTAL_REF}`, label: 'Bridge to SOL', affiliate: true };
  if (chainLower.includes('base') || chainLower.includes('arbitrum') || chainLower.includes('optimism')) return { url: `https://orbiter.finance/?invite=${ORBITER_REF}`, label: 'Bridge to L2', affiliate: true };
  if (chainLower.includes('multi')) return { url: `https://www.bybit.com/register?affiliate_id=${BYBIT_REF}`, label: 'Get Gas (Bybit)', affiliate: true };
  
  return { url: protocolUrl || '#', label: 'Investigate', affiliate: false };
}

export default async function AirdropsPage() {
  const protocols = await getDeFiProtocols();
  
  // FIX: Explicitly exclude CEXs, Bridges (often already have tokens), and native Chains
  const airdrops = protocols
    .filter((p: any) => 
      (!p.symbol || p.symbol === '-' || p.symbol.toLowerCase() === 'none') && 
      p.tvl > 500000 &&
      p.category !== 'CEX' &&
      p.category !== 'Chain' &&
      p.category !== 'Bridge'
    )
    .sort((a: any, b: any) => b.tvl - a.tvl)
    .slice(0, 50);

  const formatUsd = (val: number) => {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return `$${val.toLocaleString()}`;
  };

  const getProbability = (tvl: number) => {
    if (tvl > 100_000_000) return { label: 'High', color: 'text-[#00d672] bg-[#00d672]/10 border-[#00d672]/30' };
    if (tvl > 10_000_000) return { label: 'Medium', color: 'text-[#FABF2C] bg-[#FABF2C]/10 border-[#FABF2C]/30' };
    return { label: 'Speculative', color: 'text-[#ff4757] bg-[#ff4757]/10 border-[#ff4757]/30' };
  };

  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">
          Airdrop <span className="text-[#FABF2C]">Radar</span>
        </h1>
        <p className="text-[#555] font-mono text-[10px] uppercase tracking-[0.3em] mb-10">
          Algorithmic Detection of Tokenless Protocols (Excluding CEXs)
        </p>

        <div className="bg-[#0a0a0a] overflow-x-auto rounded-lg border border-[#1a1a1a]">
          <table className="w-full border-collapse whitespace-nowrap">
            <thead className="bg-[#111] border-b border-[#222]">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-black text-[#888] uppercase">Protocol</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-[#888] uppercase">Probability</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-[#888] uppercase">Category</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-[#888] uppercase">Chain</th>
                <th className="px-6 py-4 text-right text-[11px] font-black text-[#888] uppercase">Locked Value (TVL)</th>
                <th className="px-6 py-4 text-center text-[11px] font-black text-[#888] uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {airdrops.map((protocol: any, idx: number) => {
                const prob = getProbability(protocol.tvl);
                const action = getAffiliateLink(protocol.chain, protocol.url || `https://twitter.com/${protocol.twitter}`);
                
                return (
                  <tr key={protocol.name || idx} className="hover:bg-[#111] transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {protocol.logo ? (
                          <img src={protocol.logo} alt={protocol.name} className="w-8 h-8 rounded-full shadow-lg bg-[#222]" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center text-[10px] font-bold text-white">
                            {protocol.name?.charAt(0)}
                          </div>
                        )}
                        <div>
                           <span className="text-[14px] font-bold text-white flex items-center gap-2">
                             {protocol.name} {prob.label === 'High' && <ShieldCheck size={14} className="text-[#00d672]" />}
                           </span>
                           <span className="text-[10px] text-[#555] font-mono uppercase tracking-widest mt-1 inline-block">Tokenless</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border rounded-full ${prob.color}`}>
                        {prob.label}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-[13px] text-[#ccc] font-medium">{protocol.category || 'DeFi'}</td>
                    <td className="px-6 py-5 text-[13px] text-[#ccc] font-medium">{protocol.chain || 'Multi'}</td>
                    <td className="px-6 py-5 text-right text-[15px] font-mono font-bold text-white">
                      {formatUsd(protocol.tvl)}
                    </td>
                    <td className="px-6 py-5 text-center">
                       <a href={action.url} target="_blank" rel="noopener noreferrer" 
                          className={`inline-flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-colors ${
                            action.affiliate ? 'bg-[#FABF2C]/10 text-[#FABF2C] hover:bg-[#FABF2C] hover:text-black border border-[#FABF2C]/30' : 'bg-[#1a1a1a] text-[#ccc] hover:bg-white hover:text-black border border-[#333]'
                          }`}>
                         {action.label} {action.affiliate ? <Droplets size={12} /> : <ExternalLink size={12} />}
                       </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
