import React from 'react';
import { sql } from '@/lib/neon';
import { Activity, Cpu, Zap, Terminal } from 'lucide-react';

// Cache the aggregations for 60 seconds to protect the Neon DB from high traffic
export const revalidate = 60;

export const metadata = {
  title: 'Agent Analytics | CryptoBrain',
  description: 'Live compute and L402 execution analytics for the CryptoBrain Agent Ecosystem.',
};

export default async function AnalyticsDashboard() {
  // Execute aggregation queries in parallel
  const[agentsRes, execsRes, satsRes, recentExecs] = await Promise.all([
    sql`SELECT COUNT(*)::int AS count FROM agent_identities`,
    sql`SELECT COUNT(*)::int AS count FROM execution_logs WHERE status = 'settled'`,
    sql`SELECT COALESCE(SUM(cost_sats), 0)::int AS total_sats FROM execution_logs WHERE status = 'settled'`,
    sql`
      SELECT 
        e.action, 
        e.target_protocol, 
        e.cost_sats, 
        e.execution_time_ms, 
        e.created_at, 
        a.agent_name 
      FROM execution_logs e 
      JOIN agent_identities a ON e.agent_id = a.id 
      ORDER BY e.created_at DESC 
      LIMIT 15
    `
  ]);

  const totalAgents = agentsRes[0]?.count || 0;
  const totalExecs = execsRes[0]?.count || 0;
  const totalSats = satsRes[0]?.total_sats || 0;

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-[#222] pb-6">
          <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
            <Activity className="text-[#00d672]" /> Live Agent Ecosystem
          </h1>
          <p className="text-[#888] font-mono text-sm mt-2">
            Real-time observability of L402 micro-transactions and AI agent compute cycles.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0a0a0a] border border-[#222] p-6 rounded relative overflow-hidden group hover:border-[#FABF2C] transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Cpu size={64} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#555] mb-2">Registered Agents</p>
            <p className="text-4xl font-black text-white">{totalAgents.toLocaleString()}</p>
          </div>

          <div className="bg-[#0a0a0a] border border-[#222] p-6 rounded relative overflow-hidden group hover:border-[#00d672] transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Terminal size={64} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#555] mb-2">Total Executions</p>
            <p className="text-4xl font-black text-[#00d672]">{totalExecs.toLocaleString()}</p>
          </div>

          <div className="bg-[#0a0a0a] border border-[#222] p-6 rounded relative overflow-hidden group hover:border-[#FABF2C] transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap size={64} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#555] mb-2">Compute Revenue (Sats)</p>
            <p className="text-4xl font-black text-[#FABF2C]">{totalSats.toLocaleString()}</p>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-[#0a0a0a] border border-[#222] rounded overflow-hidden">
          <div className="p-6 border-b border-[#222]">
            <h2 className="text-lg font-black uppercase tracking-widest">Recent Executions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#111]">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[#555]">Timestamp</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[#555]">Agent</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[#555]">Action</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[#555]">Target Protocol</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[#555]">Cost</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[#555]">Latency</th>
                </tr>
              </thead>
              <tbody>
                {recentExecs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#555] font-mono text-sm">
                      No executions recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentExecs.map((log, i) => (
                    <tr key={i} className="border-b border-[#222] hover:bg-[#111] transition-colors">
                      <td className="p-4 text-xs font-mono text-[#888]">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="p-4 text-xs font-mono text-[#00d672]">
                        {log.agent_name}
                      </td>
                      <td className="p-4 text-xs font-mono text-white">
                        {log.action}
                      </td>
                      <td className="p-4 text-xs font-mono text-[#FABF2C]">
                        {log.target_protocol}
                      </td>
                      <td className="p-4 text-xs font-mono text-[#888]">
                        {log.cost_sats} sats
                      </td>
                      <td className="p-4 text-xs font-mono text-[#888]">
                        {log.execution_time_ms} ms
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
