"use client";
import React, { useState } from "react";
import type { DexVolumeRow } from "@/lib/defi-data";

interface Props { dexes: DexVolumeRow[]; }

function fmtVol(n: number | null | undefined): string {
  if (!n) return "-";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

function PctCell({ v }: { v: number | null }) {
  if (v === null || v === undefined) return <span className="text-[#555]">-</span>;
  const pos = v >= 0;
  return (
    <span className={`font-mono font-bold tabular-nums ${pos ? "text-[#00d672]" : "text-[#ff4757]"}`}>
      {pos ? "+" : ""}{v.toFixed(2)}%
    </span>
  );
}

type TF = "24h" | "7d";

export default function ExchangesClient({ dexes }: Props) {
  const [tf, setTf] = useState<TF>("24h");

  const sorted = [...dexes].sort((a, b) => {
    const av = tf === "24h" ? (a.total24h ?? 0) : (a.total7d ?? 0);
    const bv = tf === "24h" ? (b.total24h ?? 0) : (b.total7d ?? 0);
    return bv - av;
  });

  const totalVol = sorted.reduce(
    (s, d) => s + (tf === "24h" ? (d.total24h ?? 0) : (d.total7d ?? 0)),
    0
  );

  return (
    <div className="space-y-8">

      {/* Source badge */}
      <div className="flex items-center gap-3">
        <span className="border border-[#00d672]/40 text-[#00d672] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
          Live - DefiLlama
        </span>
        <span className="text-[#333] font-mono text-[10px] uppercase tracking-widest">
          {dexes.length} protocols - refreshed every 30 min
        </span>
      </div>

      {/* Timeframe selector + total */}
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex gap-1">
          {(["24h", "7d"] as TF[]).map((t) => (
            <button
              key={t}
              onClick={() => setTf(t)}
              className={[
                "px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all",
                tf === t
                  ? "bg-[#FABF2C] text-black border-[#FABF2C]"
                  : "text-[#555] border-[#1a1a1a] hover:border-[#FABF2C]/60 hover:text-[#FABF2C]",
              ].join(" ")}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] px-5 py-3">
          <span className="text-[#555] text-[10px] font-black tracking-widest uppercase mr-3">
            Total {tf} Volume
          </span>
          <span className="text-xl font-black text-[#FABF2C] tabular-nums">
            {fmtVol(totalVol)}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="border border-[#1a1a1a] overflow-hidden">
        <table className="w-full text-xs">
          <thead className="border-b border-[#1a1a1a] bg-[#050505]">
            <tr>
              <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest w-8">#</th>
              <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest">Protocol</th>
              <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest">Chains</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">24h Volume</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">7d Volume</th>
              <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">24h Change</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((dex, i) => (
              <tr
                key={`${dex.name}-${i}`}
                className={[
                  "border-b border-[#111] hover:bg-[#0f0f0f] transition-colors",
                  i % 2 === 0 ? "bg-[#0a0a0a]" : "bg-[#080808]",
                ].join(" ")}
              >
                <td className="px-4 py-4 text-[#333] font-mono">{i + 1}</td>
                <td className="px-4 py-4 text-white font-bold">{dex.name}</td>
                <td className="px-4 py-4 text-[#555] font-mono text-[10px]">
                  {dex.chains.slice(0, 3).join(", ")}
                  {dex.chains.length > 3 && (
                    <span className="text-[#333]"> +{dex.chains.length - 3}</span>
                  )}
                </td>
                <td className="px-4 py-4 text-right font-mono font-black text-[#FABF2C] tabular-nums">
                  {fmtVol(dex.total24h)}
                </td>
                <td className="px-4 py-4 text-right font-mono text-[#888] tabular-nums">
                  {fmtVol(dex.total7d)}
                </td>
                <td className="px-4 py-4 text-right">
                  <PctCell v={dex.change_1d} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {dexes.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-[#555] font-mono text-xs uppercase tracking-widest">
              Syncing DEX data from DefiLlama...
            </p>
          </div>
        )}
      </div>

      <p className="text-[10px] text-[#333] font-mono text-right">
        Source: DefiLlama /overview/dexs - Cached 30 min
      </p>
    </div>
  );
}