"use client";
import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import type { BtcChartRow } from "../page";

interface Props {
  addrData:    BtcChartRow[];
  txData:      BtcChartRow[];
  hashData:    BtcChartRow[];
  feeData:     BtcChartRow[];
  mempoolData: BtcChartRow[];
}

const AXIS = { stroke: "#444", fontSize: 9, fontFamily: "monospace", tickLine: false, axisLine: false } as const;

export default function BitcoinChartsClient({ addrData, txData, hashData, feeData, mempoolData }: Props) {
  const [mounted, setMounted] = useState(false);
  const [days, setDays] = useState<7 | 30 | 90>(30);
  useEffect(() => { setMounted(true); }, []);

  const slice = (data: BtcChartRow[]) => {
    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.slice(-days);
  };

  const addrSlice    = slice(addrData);
  const txSlice      = slice(txData);
  const hashSlice    = slice(hashData);
  const feeSlice     = slice(feeData);
  const mempoolSlice = slice(mempoolData);
  const hasData      = addrSlice.length > 0 || txSlice.length > 0 || hashSlice.length > 0;

  if (!hasData) {
    return (
      <div className="border border-dashed border-[#1a1a1a] p-6 text-center">
        <p className="text-[10px] text-[#333] font-mono uppercase tracking-widest">
          Chart data unavailable - blockchain.info rate limited
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-1">
        {([7, 30, 90] as const).map((d) => (
          <button key={d} onClick={() => setDays(d)}
            className={"px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all " +
              (days === d ? "bg-[#FABF2C] text-black border-[#FABF2C]" : "text-[#555] border-[#1a1a1a] hover:border-[#FABF2C]/60")}>
            {d}D
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {addrSlice.length > 0 && (
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#f97316] pl-3 mb-4">
              Active Addresses ({days}D)
            </h3>
            <div style={{ height: 200 }}>
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={addrSlice} margin={{ top: 5, right: 0, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradAddr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#f97316" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                    <XAxis dataKey="date" {...AXIS} minTickGap={25} />
                    <YAxis {...AXIS} width={52}
                      tickFormatter={(v: number) => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : `${(v/1e3).toFixed(0)}K`} />
                    <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #1a1a1a", fontFamily: "monospace", fontSize: 11 }}
                      formatter={(v: any) => [`${Number(v).toLocaleString()}`, "Addresses"]} />
                    <Area type="monotone" dataKey="value" stroke="#f97316" fill="url(#gradAddr)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            <p className="text-[9px] text-[#333] font-mono mt-2">Source: blockchain.info/charts/n-unique-addresses</p>
          </div>
        )}
        {txSlice.length > 0 && (
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3 mb-4">
              Daily Transactions ({days}D)
            </h3>
            <div style={{ height: 200 }}>
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={txSlice} margin={{ top: 5, right: 0, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                    <XAxis dataKey="date" {...AXIS} minTickGap={25} />
                    <YAxis {...AXIS} width={52}
                      tickFormatter={(v: number) => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : `${(v/1e3).toFixed(0)}K`} />
                    <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #1a1a1a", fontFamily: "monospace", fontSize: 11 }}
                      formatter={(v: any) => [`${Number(v).toLocaleString()}`, "Txns"]} />
                    <Bar dataKey="value" fill="#FABF2C" fillOpacity={0.8} radius={[1, 1, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <p className="text-[9px] text-[#333] font-mono mt-2">Source: blockchain.info/charts/n-transactions</p>
          </div>
        )}
      </div>

      {/* Row 2: Hash Rate + Fees + Mempool */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {hashSlice.length > 0 && (
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#00d672] pl-3 mb-4">
              Hash Rate ({days}D)
            </h3>
            <div style={{ height: 180 }}>
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hashSlice} margin={{ top: 5, right: 0, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradHash" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#00d672" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#00d672" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                    <XAxis dataKey="date" {...AXIS} minTickGap={25} />
                    <YAxis {...AXIS} width={52}
                      tickFormatter={(v: number) => v >= 1e9 ? `${(v/1e9).toFixed(0)}G` : v >= 1e6 ? `${(v/1e6).toFixed(0)}M` : `${(v/1e3).toFixed(0)}K`} />
                    <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #1a1a1a", fontFamily: "monospace", fontSize: 11 }}
                      formatter={(v: any) => [`${Number(v).toLocaleString()} H/s`, "Hash Rate"]} />
                    <Area type="monotone" dataKey="value" stroke="#00d672" fill="url(#gradHash)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            <p className="text-[9px] text-[#333] font-mono mt-2">Source: blockchain.info/charts/hash-rate</p>
          </div>
        )}

        {feeSlice.length > 0 && (
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#ff4757] pl-3 mb-4">
              Avg Tx Fee USD ({days}D)
            </h3>
            <div style={{ height: 180 }}>
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={feeSlice} margin={{ top: 5, right: 0, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradFee" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#ff4757" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#ff4757" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                    <XAxis dataKey="date" {...AXIS} minTickGap={25} />
                    <YAxis {...AXIS} width={52}
                      tickFormatter={(v: number) => `$${v >= 1e3 ? (v/1e3).toFixed(1) + 'K' : v.toFixed(2)}`} />
                    <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #1a1a1a", fontFamily: "monospace", fontSize: 11 }}
                      formatter={(v: any) => [`$${Number(v).toFixed(2)}`, "Avg Fee"]} />
                    <Area type="monotone" dataKey="value" stroke="#ff4757" fill="url(#gradFee)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            <p className="text-[9px] text-[#333] font-mono mt-2">Source: blockchain.info/charts/transaction-fees-usd</p>
          </div>
        )}

        {mempoolSlice.length > 0 && (
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#3b82f6] pl-3 mb-4">
              Mempool Size ({days}D)
            </h3>
            <div style={{ height: 180 }}>
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mempoolSlice} margin={{ top: 5, right: 0, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradMem" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                    <XAxis dataKey="date" {...AXIS} minTickGap={25} />
                    <YAxis {...AXIS} width={52}
                      tickFormatter={(v: number) => v >= 1e6 ? `${(v/1e6).toFixed(1)}MB` : `${(v/1e3).toFixed(0)}KB`} />
                    <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #1a1a1a", fontFamily: "monospace", fontSize: 11 }}
                      formatter={(v: any) => [`${(Number(v) / 1e6).toFixed(2)} MB`, "Mempool"]} />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#gradMem)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            <p className="text-[9px] text-[#333] font-mono mt-2">Source: blockchain.info/charts/mempool-size</p>
          </div>
        )}
      </div>
    </div>
  );
}
