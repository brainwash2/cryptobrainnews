'use client';
import React, { useSyncExternalStore } from 'react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip,
  AreaChart, Area,
} from 'recharts';
import type { DuneRow } from '@/lib/dune';

interface Props {
  rows: DuneRow[];
  source: 'live' | 'seed';
}

interface DAOStat {
  dao: string;
  proposals: number;
  votes: number;
}

function activityTier(votes: number): { label: string; color: string } {
  if (votes >= 5000) return { label: 'HOT', color: '#ff4d4f' };
  if (votes >= 1000) return { label: 'ACTIVE', color: '#FABF2C' };
  return { label: 'LOW', color: '#555' };
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

export default function GovernanceClient({ rows, source }: Props) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const daoMap = new Map<string, DAOStat>();
  for (const row of rows) {
    const dao = String(row.dao ?? '');
    if (!dao) continue;
    const proposals = Number(row.proposals_created ?? 0);
    const votes = Number(row.vote_count ?? 0);
    const existing = daoMap.get(dao);
    if (existing) {
      existing.proposals += proposals;
      existing.votes += votes;
    } else {
      daoMap.set(dao, { dao, proposals, votes });
    }
  }
  const daoStats: DAOStat[] = Array.from(daoMap.values()).sort((a, b) => b.votes - a.votes);

  const dayMap = new Map<string, number>();
  for (const row of rows) {
    const day = String(row.day ?? '').slice(0, 10);
    if (!day) continue;
    dayMap.set(day, (dayMap.get(day) ?? 0) + Number(row.vote_count ?? 0));
  }
  const trend = Array.from(dayMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, votes]) => ({ day: day.slice(5), votes }));

  const totalDAOs = daoStats.length;
  const totalProposals = daoStats.reduce((s, d) => s + d.proposals, 0);
  const totalVotes = daoStats.reduce((s, d) => s + d.votes, 0);
  const avgVotesPerProposal = totalProposals ? Math.round(totalVotes / totalProposals) : 0;

  const barData = daoStats.slice(0, 8);

  const KPIS = [
    { label: 'DAOs Tracked', value: totalDAOs.toString(), accent: '#FABF2C' },
    { label: 'Proposals (30d)', value: fmt(totalProposals), accent: '#3b82f6' },
    { label: 'Total Votes (30d)', value: fmt(totalVotes), accent: '#00d672' },
    { label: 'Avg Votes / Proposal', value: fmt(avgVotesPerProposal), accent: '#f97316' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 border ${
          source === 'live'
            ? 'border-[#00d672] text-[#00d672]'
            : 'border-[#333] text-[#555]'
        }`}>
          {source === 'live' ? '● LIVE — Dune Analytics' : '○ SEED DATA — Awaiting Live Query'}
        </span>
        <span className="text-[9px] font-mono text-[#333] uppercase tracking-widest">
          Updated every 24h
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map(kpi => (
          <div key={kpi.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <div className="text-2xl font-black tabular-nums" style={{ color: kpi.accent }}>
              {kpi.value}
            </div>
            <div className="text-[9px] font-black text-[#555] uppercase tracking-widest mt-2">
              {kpi.label}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
          <h3 className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-6">
            Top DAOs by Total Votes (30d)
          </h3>
          {mounted ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart layout="vertical" data={barData} margin={{ top: 0, right: 56, bottom: 0, left: 0 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="dao"
                  tick={{ fill: '#888', fontSize: 10, fontWeight: 700 }}
                  width={130}
                />
                <Tooltip
                  contentStyle={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 0, fontSize: 11 }}
                  formatter={(v: number) => [fmt(v), 'Votes']}
                  cursor={{ fill: '#ffffff08' }}
                />
                <Bar dataKey="votes" isAnimationActive={false} radius={0}>
                  {barData.map((entry, i) => {
                    const tier = activityTier(entry.votes);
                    return (
                      <Cell
                        key={entry.dao}
                        fill={tier.color}
                        fillOpacity={Math.max(0.35, 1 - i * 0.09)}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] bg-[#050505] animate-pulse" />
          )}
        </div>

        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
          <h3 className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-6">
            Vote Count Trend (30d)
          </h3>
          {mounted ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trend} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="govGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FABF2C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FABF2C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: '#555', fontSize: 9 }} />
                <YAxis tick={{ fill: '#555', fontSize: 9 }} tickFormatter={fmt} width={42} />
                <Tooltip
                  contentStyle={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 0, fontSize: 11 }}
                  formatter={(v: number) => [fmt(v), 'Total Votes']}
                  cursor={{ stroke: '#FABF2C', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Area
                  type="monotone"
                  dataKey="votes"
                  stroke="#FABF2C"
                  strokeWidth={2}
                  fill="url(#govGrad)"
                  isAnimationActive={false}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] bg-[#050505] animate-pulse" />
          )}
        </div>
      </div>

      <div className="border border-[#1a1a1a] overflow-x-auto">
        <table className="w-full text-xs min-w-[640px]">
          <thead className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
            <tr>
              <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest">#</th>
              <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest">DAO</th>
              <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest">Tier</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">Proposals</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">Total Votes</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">Avg / Proposal</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">Share</th>
            </tr>
          </thead>
          <tbody>
            {daoStats.map((dao, i) => {
              const tier = activityTier(dao.votes);
              const share = totalVotes ? ((dao.votes / totalVotes) * 100).toFixed(1) : '0.0';
              const avg = dao.proposals ? Math.round(dao.votes / dao.proposals) : 0;
              return (
                <tr key={dao.dao} className="border-b border-[#0d0d0d] hover:bg-[#0d0d0d] transition-colors">
                  <td className="px-4 py-4 text-[#333] font-mono tabular-nums">#{i + 1}</td>
                  <td className="px-4 py-4 font-black text-white uppercase tracking-tight">{dao.dao}</td>
                  <td className="px-4 py-4">
                    <span
                      className="text-[8px] font-black px-2 py-0.5 border uppercase tracking-widest"
                      style={{ color: tier.color, borderColor: tier.color }}
                    >
                      {tier.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-[#888] tabular-nums font-mono">{dao.proposals}</td>
                  <td className="px-4 py-4 text-right font-black tabular-nums" style={{ color: tier.color }}>
                    {fmt(dao.votes)}
                  </td>
                  <td className="px-4 py-4 text-right text-[#888] tabular-nums font-mono">{fmt(avg)}</td>
                  <td className="px-4 py-4 text-right text-[#555] tabular-nums font-mono">{share}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
