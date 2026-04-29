// src/app/data/defi/token-unlocks/page.tsx
import React, { Suspense } from "react";
import { DataHeader }       from "../../_components/DataHeader";
import { ChartSkeleton }    from "../../_components/ChartSkeleton";
import { getNextUnlocks }   from "@/lib/defi-data";
import type { TokenUnlock } from "@/lib/defi-data";

export const metadata = {
  title: "Token Unlocks | CryptoBrainNews",
  description: "Upcoming token unlock schedules — amount, % of supply, and date for all tracked protocols.",
};
export const revalidate = 86400;

// Module-level timestamp — evaluated once at import time, never during render.
// The page ISR revalidates every 24 hours, so a new import runs once per day.
const NOW_MS = Date.now();
const THIRTY_DAYS_MS = 30 * 86400_000;
const THRESHOLD_MS = NOW_MS + THIRTY_DAYS_MS;

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtToken(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toLocaleString();
}

async function TokenUnlocksData() {
  const unlocks = await getNextUnlocks().catch(() => []);
  const sorted  = [...unlocks].sort(
    (a, b) => new Date(a.unlockDate).getTime() - new Date(b.unlockDate).getTime()
  );

  const next30d   = sorted.filter(
    (u) => new Date(u.unlockDate).getTime() <= THRESHOLD_MS
  );
  const total30d  = next30d.reduce((s, u) => s + u.amountUsd, 0);
  const isLive    = unlocks.length > 0;

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Token Unlocks"
        description="Upcoming token unlock events — amount, percentage of circulating supply, and date."
      />

      <div className="flex items-center gap-3 flex-wrap">
        <span className={`border font-mono text-[10px] px-3 py-1 uppercase tracking-widest ${
          isLive
            ? "border-[#00d672]/40 text-[#00d672]"
            : "border-[#FABF2C]/40 text-[#FABF2C]"
        }`}>
          {isLive ? "● Live — DefiLlama /unlocks" : "◌ No data"}
        </span>
        <span className="text-[#333] font-mono text-[10px] uppercase tracking-widest">
          Free API — no key required · Cached 24h
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Next 30D Unlocks</p>
          <p className="text-2xl font-black text-[#FABF2C] tabular-nums">{fmtUsd(total30d)}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Events in 30 Days</p>
          <p className="text-2xl font-black text-white tabular-nums">{next30d.length}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Total Tracked</p>
          <p className="text-2xl font-black text-[#888] tabular-nums">{unlocks.length}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">Source</p>
          <p className="text-sm font-black text-[#00d672]">DefiLlama</p>
          <p className="text-[9px] font-mono text-[#555] mt-1">api.llama.fi/unlocks</p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#ff4757] rounded-full animate-pulse" />
          Next 30 Days
        </h3>
        <div className="border border-[#1a1a1a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {["#", "Token", "Amount", "% of Supply", "Value (USD)", "Date"].map((h) => (
                  <th key={h} className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest ${
                    ["#", "Token"].includes(h) ? "text-left" : "text-right"
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {next30d.map((u: TokenUnlock, i: number) => {
                const pctOfSupply = u.pctOfSupply ?? 0;
                const isLarge = pctOfSupply >= 1;
                return (
                  <tr key={`${u.token}-${u.unlockDate}-${i}`} className={`border-b border-[#111] hover:bg-[#0f0f0f] ${
                    i % 2 === 0 ? "bg-[#080808]" : "bg-[#050505]"
                  }`}>
                    <td className="px-4 py-3 text-[#555] tabular-nums">{i + 1}</td>
                    <td className="px-4 py-3 font-bold text-white">{u.token}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#FABF2C]">
                      {fmtToken(u.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-mono font-black tabular-nums text-xs px-2 py-0.5 border ${
                        isLarge
                          ? "text-[#ff4757] border-[#ff4757]/30 bg-[#ff4757]/10"
                          : "text-[#888] border-[#1a1a1a]"
                      }`}>
                        {pctOfSupply.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                      {u.amountUsd > 0 ? fmtUsd(u.amountUsd) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[#888] tabular-nums">
                      {new Date(u.unlockDate).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })}
              {next30d.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[#555] font-mono text-xs">
                    {isLive ? "No unlocks in the next 30 days." : "Set up DefiLlama /unlocks endpoint to see data."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {sorted.length > 0 && (
        <div>
          <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
            <span className="w-2 h-2 bg-[#888] rounded-full" />
            All Upcoming Unlocks
          </h3>
          <div className="border border-[#1a1a1a] overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 z-10 bg-[#050505]">
                <tr className="border-b border-[#1a1a1a]">
                  <th className="px-4 py-3 text-left font-black text-[#555] uppercase">Token</th>
                  <th className="px-4 py-3 text-right font-black text-[#555] uppercase">Amount</th>
                  <th className="px-4 py-3 text-right font-black text-[#555] uppercase">% Supply</th>
                  <th className="px-4 py-3 text-right font-black text-[#555] uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((u: TokenUnlock, i: number) => (
                  <tr key={`all-${u.token}-${u.unlockDate}-${i}`} className={`border-b border-[#111] ${
                    i % 2 === 0 ? "bg-[#080808]" : "bg-[#050505]"
                  }`}>
                    <td className="px-4 py-3 font-bold text-white">{u.token}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#FABF2C]">
                      {fmtToken(u.amount)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                      {(u.pctOfSupply ?? 0).toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[#888]">
                      {new Date(u.unlockDate).toLocaleDateString("en-US", {
                        month: "short", day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-[10px] text-[#333] font-mono text-right">
        Source: DefiLlama /unlocks · Free API · Cached 24h · Data may not reflect all vesting schedules
      </p>
    </div>
  );
}

export default function TokenUnlocksPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <TokenUnlocksData />
      </Suspense>
    </main>
  );
}
