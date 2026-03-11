'use client';

import React, { useEffect, useState } from 'react';
import { useWeb3 } from '@/components/providers/Web3Provider';
import ConnectWallet from '@/components/wallet/ConnectWallet';
import { Shield, Cpu, Zap, Activity } from 'lucide-react';
import Link from 'next/link';

export default function OperatorDashboard() {
  const { address } = useWeb3();
  const [data, setData] = useState<{ agents: any[], stats: { total_execs: number, total_sats: number } } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setData(null);
      return;
    }

    const fetchEcosystem = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/operator/agents?pubkey=${address}`);
        const json = await res.json();
        if (res.ok) setData(json);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEcosystem();
  }, [address]);

  if (!address) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-8 font-sans">
        <Shield size={64} className="text-[#333] mb-6" />
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">Operator Dashboard</h1>
        <p className="text-[#888] font-mono mb-8 text-center max-w-md">
          Connect your cryptographic identity to manage your registered AI agents, view execution logs, and access your referral codes.
        </p>
        <ConnectWallet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#222] pb-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-[#00d672]">Operator Dashboard</h1>
            <p className="text-[#888] font-mono text-sm mt-2">Manage your autonomous ecosystem.</p>
          </div>
          <ConnectWallet />
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-[#555] font-mono animate-pulse">Synchronizing ecosystem data...</div>
        ) : data ? (
          <>
            {/* KPI Cards */}
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

            {/* Agent List */}
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
                  <Link href="/agent-registry" className="inline-block bg-white text-black px-6 py-3 rounded text-xs font-black uppercase tracking-widest hover:bg-[#FABF2C] transition-colors">
                    Initialize KYA Handshake
                  </Link>
                </div>
              ) : (
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
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
