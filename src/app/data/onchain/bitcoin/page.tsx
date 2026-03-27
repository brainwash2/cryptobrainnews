import React, { Suspense } from "react";
import { DataHeader }       from "../../_components/DataHeader";
import { ChartSkeleton }    from "../../_components/ChartSkeleton";
import { getBitcoinStats }  from "@/lib/onchain-data";
import BitcoinChartsClient  from "./_components/BitcoinChartsClient";

export const metadata = {
  title: "Bitcoin On-Chain | CryptoBrainNews",
  description: "Bitcoin network health - hash rate, mempool, fees, transactions, and active addresses.",
};
export const revalidate = 1800;

export interface BtcChartRow { date: string; value: number; }

function StatCard({ label, value, sub, color = "#FABF2C" }: {
  label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
      <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{label}</p>
      <p className="text-2xl font-black tabular-nums" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] font-mono text-[#555] mt-1">{sub}</p>}
    </div>
  );
}

function fmtNum(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toString();
}

async function fetchBtcChart(chart: string, days: number): Promise<BtcChartRow[]> {
  try {
    const url =
      `https://blockchain.info/charts/${chart}` +
      `?format=json&timespan=${days}days&sampled=true&cors=true`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return [];
    const d = await res.json() as { values?: Array<{ x: number; y: number }> };
    return (d.values ?? []).map((p) => ({
      date:  new Date(p.x * 1000).toISOString().slice(0, 10),
      value: p.y,
    }));
  } catch { return []; }
}

async function BitcoinData() {
  const [btcStats, addrData, txData] = await Promise.all([
    getBitcoinStats().catch(() => null),
    fetchBtcChart("n-unique-addresses", 90),
    fetchBtcChart("n-transactions",     90),
  ]);

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Bitcoin On-Chain"
        description="Real-time Bitcoin network health - hash rate, mempool, fees, and transaction activity."
      />

      <div className="flex items-center gap-3">
        <span className="border border-[#00d672]/40 text-[#00d672] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
          Live - blockchain.info + mempool.space
        </span>
      </div>

      {btcStats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Hash Rate"        value={`${btcStats.hashRate} EH/s`}      sub="blockchain.info" />
          <StatCard label="Mempool Tx Count" value={fmtNum(btcStats.mempoolTxCount)}  sub="mempool.space"   color="#fff" />
          <StatCard label="Avg Fee (30 min)" value={`${btcStats.avgFeeRate} sat/vB`}  sub="mempool.space"
            color={btcStats.avgFeeRate > 50 ? "#ff4757" : "#00d672"} />
          <StatCard label="Total Txns"       value={fmtNum(btcStats.totalTransactions)} sub="blockchain.info" color="#888" />
          <StatCard label="Difficulty"       value={fmtNum(btcStats.difficulty)}      sub="current epoch"   color="#888" />
          <StatCard label="Block Height"     value={fmtNum(btcStats.blockHeight)}     sub="blockchain.info" color="#fff" />
          <StatCard label="Unconfirmed"      value={fmtNum(btcStats.unconfirmedCount)} sub="real-time"
            color={btcStats.unconfirmedCount > 50000 ? "#ff4757" : "#FABF2C"} />
          <StatCard label="Mempool Size"     value={`${(btcStats.mempoolSizeBytes / 1e6).toFixed(1)} MB`} sub="vbytes" color="#888" />
        </div>
      ) : (
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-8 text-center">
          <p className="text-[#555] font-mono text-xs uppercase">Ne
            twork stats temporarily unavailable</p>
        </div>
      )}

      {/* Charts client component — handles timeframe selector + rendering */}
      <BitcoinChartsClient addrData={addrData} txData={txData} />

      <div className="border border-[#1a1a1a] bg-[#080808] p-5">
        <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">About These Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] font-mono text-[#555] leading-relaxed">
          {[
            ["Hash Rate (EH/s)", "Total computational power securing the Bitcoin network. Higher = more secure."],
            ["Mempool Tx Count",  "Transactions waiting to be confirmed. Spike = network congestion."],
            ["Avg Fee Rate",      "Estimated fee in sat/vB for confirmation within 30 minutes."],
            ["Difficulty",        "Auto-adjusts every 2016 blocks (~2 weeks) to maintain 10-min block times."],
          ].map(([k, v]) => (
            <div key={k}><span className="text-[#888] font-black">{k}:</span> {v}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BitcoinOnChainPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <BitcoinData />
      </Suspense>
    </main>
  );
}
