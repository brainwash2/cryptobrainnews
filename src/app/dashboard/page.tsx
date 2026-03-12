'use client';

import React, { useEffect, useState } from 'react';
import { useWeb3 } from '@/components/providers/Web3Provider';
import ConnectWallet from '@/components/wallet/ConnectWallet';
import { Shield, Cpu, Zap, Activity, Users, Copy, CheckCircle, Lock } from 'lucide-react';
import Link from 'next/link';

export default function OperatorDashboard() {
  const { address, signature, siweMessage } = useWeb3();
  const [data, setData] = useState<any>(null);
  const [refData, setRefData] = useState({ total_referrals: 0, total_sats: 0 });
  const[isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // We now require both the address and the cryptographically signed message
    if (!address || !signature || !siweMessage) return;

    const fetchEcosystem = async () => {
      setIsLoading(true);
      try {
        const headers = {
          'x-siwe-signature': signature,
          'x-siwe-message': siweMessage
        };

        const[agentsRes, refsRes] = await Promise.all([
          fetch(`/api/operator/agents?pubkey=${address}`, { headers }),
          fetch(`/api/referrals?pubkey=${address}`, { headers })
        ]);
        
        if (agentsRes.ok) setData(await agentsRes.json());
        if (refsRes.ok) setRefData(await refsRes.json());
      } catch (err) {
        console.error('Failed to fetch authenticated dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEcosystem();
  }, [address, signature, siweMessage]);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/agent-registry?ref=${address}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // If the user has a wallet connected but hasn't signed the message yet, they wait here.
  if (!address || !signature) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-8 font-sans">
        <Shield size={64} className="text-[#333] mb-6" />
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">Operator Dashboard</h1>
        <p className="text-[#888] font-mono mb-8 text-center max-w-md">
          Connect your cryptographic identity and sign the authentication message to manage your AI agents securely.
        </p>
        <div className="flex items-center gap-4"><Link href="/dashboard/playbooks" className="text-[#FABF2C] hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Playbook Builder</Link><ConnectWallet /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8 pb-24">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#222] pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black uppercase tracking-tighter text-[#00d672]">Operator Dashboard</h1>
              <span className="bg-[#00d672]/20 text-[#00d672] text-[10px] uppercase font-black px-2 py-1 rounded flex items-center gap-1">
                <Lock size={10} /> Verified
              </span>
            </div>
            <p className="text-[#888] font-mono text-sm mt-2">Manage your autonomous ecosystem.</p>
          </div>
          <div className="flex items-center gap-4"><Link href="/dashboard/playbooks" className="text-[#FABF2C] hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Playbook Builder</Link><ConnectWallet /></div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-[#555] font-mono animate-pulse">Decrypting and synchronizing ecosystem data...</div>
        ) : data ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0a0a0a] border border-[#222] p-6 rounded">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#555]">Active Agents</p>
                  <Cpu size={16} className="text-[#FABF2C]" />
                </div>
                <p className="text-4xl font-black text-white">{data.agents.length}</p>
              </div>

              <div className="bg-[#0a0a0a] border border-[#222] p-6 rounded">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#555]">Total Executions</p>
                  <Activity size={16} className="text-[#00d672]" />
                </div>
                <p className="text-4xl font-black text-white">{data.stats.total_execs.toLocaleString()}</p>
              </div>

              <div className="bg-[#0a0a0a] border border-[#222] p-6 rounded">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#555]">Sats Spent</p>
                  <Zap size={16} className="text-[#ff9900]" />
                </div>
                <p className="text-4xl font-black text-white">{data.stats.total_sats.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#0a0a0a] to-[#111] border border-[#FABF2C]/30 rounded overflow-hidden p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="text-[#FABF2C]" size={24} />
                  <h2 className="text-xl font-black uppercase tracking-widest">Referral Hub</h2>
                </div>
                <p className="text-sm font-mono text-[#888] leading-relaxed max-w-xl">
                  Earn <strong className="text-white">5,000 sats</strong> for every verified human developer you refer. Sybil resistance is enforced via Gitcoin Passport (Score ≥ 20).
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <div className="bg-black border border-[#222] px-4 py-3 rounded font-mono text-xs text-[#00d672] flex-1 truncate">
                    .../agent-registry?ref={address.substring(0,6)}...{address.substring(address.length-4)}
                  </div>
                  <button 
                    onClick={handleCopyLink}
                    className="bg-[#FABF2C] text-black px-6 py-3 rounded text-xs font-black uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2 shrink-0"
                  >
                    {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied Link' : 'Copy Link'}
                  </button>
                </div>
              </div>

              <div className="flex gap-6 shrink-0 border-t md:border-t-0 md:border-l border-[#222] pt-6 md:pt-0 md:pl-8 w-full md:w-auto">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#555] mb-2">Verified Humans</p>
                  <p className="text-3xl font-black text-white">{refData.total_referrals}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#555] mb-2">Sats Earned</p>
                  <p className="text-3xl font-black text-[#FABF2C]">{refData.total_sats.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-[#222] rounded overflow-hidden">
              <div className="p-6 border-b border-[#222] flex justify-between items-center">
                <h2 className="text-lg font-black uppercase tracking-widest">Registered Identities</h2>
                <Link href="/agent-registry" className="text-xs font-black uppercase tracking-widest text-[#FABF2C] hover:text-white transition-colors">
                  + Register New Agent
                </Link>
              </div>
              
              {data.agents.length === 0 ? (
                <div className="p-12 text-center border-t border-[#222]">
                  <p className="text-[#555] font-mono text-sm mb-4">No agents found for this wallet address.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#111]">
                      <tr>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[#555]">Agent Name</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[#555]">ID (UUID)</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[#555]">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.agents.map((agent: any) => (
                        <tr key={agent.id} className="border-b border-[#222] hover:bg-[#111] transition-colors">
                          <td className="p-4 text-sm font-black text-[#00d672]">{agent.agent_name}</td>
                          <td className="p-4 text-xs font-mono text-[#888]">{agent.id}</td>
                          <td className="p-4 text-xs font-mono text-[#555]">
                            {new Date(agent.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
