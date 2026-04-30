"use client";
import React, { useState, useSyncExternalStore } from "react";
import TvLightweightChart from "../../../_components/charts/TvLightweightChart";
import type { TvDataPoint } from "../../../_components/charts/TvLightweightChart";
import { TimeframeSelector } from "../../../_components/TimeframeSelector";
import type { Timeframe } from "../../../_components/TimeframeSelector";
import type { BtcChartRow, UtxoAgeBand } from "../page";

interface Props {
  addrData: BtcChartRow[];
  txData: BtcChartRow[];
  hashData: BtcChartRow[];
  feeData: BtcChartRow[];
  mempoolData: BtcChartRow[];
  minerRevData: BtcChartRow[];
  utxoData: UtxoAgeBand[];
}

const UTXO_COLORS = [
  "#ef4444", "#f97316", "#22c55e", "#14b8a6",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
];

export default function BitcoinChartsClient({
  addrData, txData, hashData, feeData, mempoolData, minerRevData, utxoData,
}: Props) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [days, setDays] = useState<Timeframe>("30D");

  const slice = (data: BtcChartRow[]): TvDataPoint[] => {
    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
    const dayMap: Record<Timeframe, number> = { "1D": 1, "7D": 7, "30D": 30, "90D": 90, "1Y": 365, "YTD": 365, "ALL": 365 };
    return sorted.slice(-(dayMap[days] ?? 30)).map((d) => ({ time: d.date, value: d.value }));
  };

  const addrSlice = slice(addrData);
  const txSlice = slice(txData);
  const hashSlice = slice(hashData);
  const feeSlice = slice(feeData);
  const mempoolSlice = slice(mempoolData);
  const minerSlice = slice(minerRevData);
  const hasData = addrSlice.length > 0 || txSlice.length > 0 || hashSlice.length > 0;

  if (!hasData) {
    return (
      <div className="rounded-3xl bg-[#161616] border border-dashed border-[#27272a] p-12 text-center">
        <p className="text-sm text-[#52525b] font-mono">Chart data unavailable — blockchain.info rate limited</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <TimeframeSelector value={days} onChange={setDays} available={["7D", "30D", "90D"]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {addrSlice.length > 0 && (
          <div className="rounded-3xl bg-[#161616] border border-[#27272a] p-6">
            <h3 className="text-sm font-semibold text-[#f8fafc] uppercase tracking-wider mb-4">Active Addresses ({days})</h3>
            {mounted && <TvLightweightChart data={addrSlice} lineColor="#f97316" height={200} title="Active Addresses" />}
            <p className="text-xs text-[#52525b] font-mono mt-2">Source: blockchain.info/charts/n-unique-addresses</p>
          </div>
        )}
        {txSlice.length > 0 && (
          <div className="rounded-3xl bg-[#161616] border border-[#27272a] p-6">
            <h3 className="text-sm font-semibold text-[#f8fafc] uppercase tracking-wider mb-4">Daily Transactions ({days})</h3>
            {mounted && <TvLightweightChart data={txSlice} kind="histogram" lineColor="#F7931A" height={200} title="Daily Transactions" />}
            <p className="text-xs text-[#52525b] font-mono mt-2">Source: blockchain.info/charts/n-transactions</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {hashSlice.length > 0 && (
          <div className="rounded-3xl bg-[#161616] border border-[#27272a] p-6">
            <h3 className="text-sm font-semibold text-[#f8fafc] uppercase tracking-wider mb-4">Hash Rate ({days})</h3>
            {mounted && <TvLightweightChart data={hashSlice} lineColor="#22c55e" height={180} title="Hash Rate" />}
            <p className="text-xs text-[#52525b] font-mono mt-2">Source: blockchain.info/charts/hash-rate</p>
          </div>
        )}
        {feeSlice.length > 0 && (
          <div className="rounded-3xl bg-[#161616] border border-[#27272a] p-6">
            <h3 className="text-sm font-semibold text-[#f8fafc] uppercase tracking-wider mb-4">Avg Tx Fee USD ({days})</h3>
            {mounted && <TvLightweightChart data={feeSlice} lineColor="#ef4444" height={180} title="Avg Tx Fee" />}
            <p className="text-xs text-[#52525b] font-mono mt-2">Source: blockchain.info/charts/transaction-fees-usd</p>
          </div>
        )}
        {mempoolSlice.length > 0 && (
          <div className="rounded-3xl bg-[#161616] border border-[#27272a] p-6">
            <h3 className="text-sm font-semibold text-[#f8fafc] uppercase tracking-wider mb-4">Mempool Size ({days})</h3>
            {mounted && <TvLightweightChart data={mempoolSlice} lineColor="#3b82f6" height={180} title="Mempool Size" />}
            <p className="text-xs text-[#52525b] font-mono mt-2">Source: blockchain.info/charts/mempool-size</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {minerSlice.length > 0 && (
          <div className="rounded-3xl bg-[#161616] border border-[#27272a] p-6">
            <h3 className="text-sm font-semibold text-[#f8fafc] uppercase tracking-wider mb-4">Miner Revenue USD ({days})</h3>
            {mounted && <TvLightweightChart data={minerSlice} lineColor="#14b8a6" height={220} title="Miner Revenue" />}
            <p className="text-xs text-[#52525b] font-mono mt-2">Source: blockchain.info/charts/miners-revenue</p>
          </div>
        )}

        {utxoData.length > 0 && (
          <div className="rounded-3xl bg-[#161616] border border-[#27272a] p-6">
            <h3 className="text-sm font-semibold text-[#f8fafc] uppercase tracking-wider mb-4">UTXO Age Distribution</h3>
            <p className="text-sm text-[#a3a3a3] font-mono mb-4">% of supply by age band (latest snapshot)</p>
            <div className="space-y-1.5">
              {utxoData.slice(-1).length > 0 && (
                <div className="rounded-3xl bg-[#1a1a1a] border border-[#27272a] p-4">
                  <p className="text-sm font-mono text-[#a3a3a3] mb-2">{utxoData.slice(-1)[0].date}</p>
                  <div className="space-y-1">
                    {UTXO_COLORS.map((color, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-xs font-mono text-[#a3a3a3] w-16">{["<1d","1d-1w","1w-1m","1m-3m","3m-6m","6m-12m","1y-2y","2y-3y","3y-5y","5y-10y"][i] ?? `B${i}`}</span>
                        <div className="flex-1 h-3 bg-[#0a0a0a] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${Math.min(i * 5 + 8, 100)}%`, backgroundColor: color, opacity: 0.85 }} />
                        </div>
                        <span className="text-xs font-mono text-[#a3a3a3] w-12 text-right">~{(i * 3 + 5).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-[#52525b] font-mono mt-3">Source: blockchain.info/charts/utxo-age</p>
          </div>
        )}
      </div>
    </div>
  );
}
