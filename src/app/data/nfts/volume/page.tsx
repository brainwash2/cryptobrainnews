import React, { Suspense }                        from "react";
import { DataHeader }                               from "../../_components/DataHeader";
import { ChartSkeleton }                            from "../../_components/ChartSkeleton";
import { getNftChainVolumes, getTopCollections }    from "@/lib/nft-data";

export const metadata = {
  title: "NFT Trade Volume | CryptoBrainNews",
  description: "NFT trade volume by chain, daily sales, and marketplace activity.",
};
export const revalidate = 3600;

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

async function NftVolumeData() {
  const [chainVolumes, collections] = await Promise.all([
    getNftChainVolumes().catch(() => []),
    getTopCollections().catch(() => []),
  ]);

  const total24h = chainVolumes.reduce((s, c) => s + c.volume24h, 0);
  const total7d  = chainVolumes.reduce((s, c) => s + c.volume7d,  0);
  const maxVol   = chainVolumes[0]?.volume24h ?? 1;

  // Unit 5: aggregate 24h volume from live collection data
  const collVol24h   = collections.reduce((s, c) => s + (c.volume24hUsd ?? 0), 0);
  const collVol7dAvg = collections.reduce((s, c) => s + (c.volume7dUsd  ?? 0), 0) / 7;
  const collTrend    = collVol7dAvg > 0 ? ((collVol24h - collVol7dAvg) / collVol7dAvg) * 100 : null;
  const liveCount    = collections.filter((c) => c.source === "live").length;
  const hasLive      = liveCount > 0;

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="NFT Trade Volume"
        description="NFT trading activity by blockchain - 24h and 7d volume, trade counts, and chain market share."
      />

      {/* Source badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`border font-mono text-[10px] px-3 py-1 uppercase tracking-widest ${
          hasLive
            ? "border-[#00d672]/40 text-[#00d672]"
            : "border-[#FABF2C]/40 text-[#FABF2C]"
        }`}>
          {hasLive ? `● ${liveCount} Live Collections` : "◌ Seed Data — Mar 2026"}
        </span>
        {!hasLive && (
          <span className="text-[#333] font-mono text-[10px] uppercase tracking-widest">
            Set ALCHEMY_API_KEY for live floor prices
          </span>
        )}
      </div>

      {/* Unit 5 — Aggregate NFT 24h Volume KPI */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3 mb-5">
          Total NFT Market — 24h Volume
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#080808] border border-[#1a1a1a] p-4">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">24h Volume (Collections)</p>
            <p className="text-2xl font-black text-[#FABF2C] tabular-nums">{fmtUsd(collVol24h)}</p>
            <p className="text-[10px] font-mono text-[#555] mt-1">{collections.length} collections tracked</p>
          </div>
          <div className="bg-[#080808] border border-[#1a1a1a] p-4">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">vs 7D Daily Avg</p>
            <p className="text-2xl font-black tabular-nums" style={{
              color: collTrend === null ? "#888" : collTrend >= 0 ? "#00d672" : "#ff4d4f"
            }}>
              {collTrend === null ? "—" : `${collTrend >= 0 ? "▲" : "▼"} ${Math.abs(collTrend).toFixed(1)}%`}
            </p>
            <p className="text-[10px] font-mono text-[#555] mt-1">vs 7-day daily average</p>
          </div>
          <div className="bg-[#080808] border border-[#1a1a1a] p-4">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">24h Volume (Chains)</p>
            <p className="text-2xl font-black text-[#888] tabular-nums">{fmtUsd(total24h)}</p>
            <p className="text-[10px] font-mono text-[#555] mt-1">by blockchain</p>
          </div>
          <div className="bg-[#080808] border border-[#1a1a1a] p-4">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">7D Volume</p>
            <p className="text-2xl font-black text-[#888] tabular-nums">{fmtUsd(total7d)}</p>
            <p className="text-[10px] font-mono text-[#555] mt-1">all chains</p>
          </div>
        </div>
        <p className="text-[9px] text-[#333] font-mono mt-4">
          Source: Alchemy + Magic Eden public APIs · Cached 1 h
        </p>
      </div>

      {/* Chain Volume Bars */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3 mb-6">
          24h Volume by Chain
        </h3>
        <div className="space-y-3">
          {chainVolumes.map((c) => {
            const share = total24h > 0 ? (c.volume24h / total24h) * 100 : 0;
            return (
              <div key={c.chain} className="flex items-center gap-3">
                <span className="w-20 text-right text-[10px] font-bold text-white shrink-0">
                  {c.chain}
                </span>
                <div className="flex-1 h-5 bg-[#111]">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${(c.volume24h / maxVol) * 100}%`,
                      background: c.color,
                      opacity: 0.8,
                    }}
                  />
                </div>
                <span
                  className="w-20 text-right font-mono text-[10px] tabular-nums shrink-0"
                  style={{ color: c.color }}
                >
                  {fmtUsd(c.volume24h)}
                </span>
                <span className="w-12 text-right font-mono text-[10px] text-[#555] shrink-0">
                  {share.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chain Detail Table */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
          Volume by Blockchain
        </h3>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                {["Chain", "24h Volume", "7d Volume", "24h Trades", "24h Share"].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest ${
                      h === "Chain" ? "text-left" : "text-right"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chainVolumes.map((c, i) => {
                const share = total24h > 0 ? (c.volume24h / total24h) * 100 : 0;
                return (
                  <tr
                    key={c.chain}
                    className={`border-b border-[#111] hover:bg-[#0f0f0f] ${
                      i % 2 === 0 ? "bg-[#080808]" : "bg-[#050505]"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                        <span className="font-bold text-white">{c.chain}</span>
                      </div>
                    </td>
                    <td
                      className="px-4 py-3 text-right font-mono font-black tabular-nums"
                      style={{ color: c.color }}
                    >
                      {fmtUsd(c.volume24h)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                      {fmtUsd(c.volume7d)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                      {c.tradeCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#555]">
                      {share.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-[#333] font-mono mt-2 text-right">
          Reference data snapshot Mar 2026 - Set RESERVOIR_API_KEY for live NFT collection data
        </p>
      </div>
    </div>
  );
}

export default function NftVolumePage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <NftVolumeData />
      </Suspense>
    </main>
  );
}
