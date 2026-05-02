import React, { Suspense } from "react";
import { DataHeader }           from "../../_components/DataHeader";
import { ChartSkeleton }        from "../../_components/ChartSkeleton";
import { getBitcoinStats }      from "@/lib/onchain-data";
import { getFearGreedHistory }  from "@/lib/market-data";
import BitcoinChartsClient      from "./_components/BitcoinChartsClient";
import FearGreedWidget          from "./_components/FearGreedWidget";

export const metadata = {
  title: "Bitcoin On-Chain | CryptoBrainNews",
  description: "Bitcoin network health - hash rate, mempool, fees, transactions, miner revenue, and UTXO age bands.",
};
export const revalidate = 1800;

export interface BtcChartRow { date: string; value: number; }

export interface UtxoAgeBand {
  date: string;
  band:  string;
  value: number;
}

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

async function fetchUtxoAgeBands(): Promise<UtxoAgeBand[]> {
  try {
    const url = "https://blockchain.info/charts/utxo-age?format=json&timespan=90days&sampled=true&cors=true";
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return [];
    const d = await res.json() as { values?: Array<{ x: number; y: number }> };
    return (d.values ?? []).slice(-30).map((p) => ({
      date: new Date(p.x * 1000).toISOString().slice(0, 10),
      band: "UTXO",
      value: p.y,
    }));
  } catch { return []; }
}

async function BitcoinData() {
  const [btcStats, addrData, txData, hashData, feeData, mempoolData, minerRevData, utxoData, fngData] =
    await Promise.all([
      getBitcoinStats().catch(() => null),
      fetchBtcChart("n-unique-addresses",    90),
      fetchBtcChart("n-transactions",        90),
      fetchBtcChart("hash-rate",             90),
      fetchBtcChart("transaction-fees-usd",  90),
      fetchBtcChart("mempool-size",          90),
      fetchBtcChart("miners-revenue",        90),
      fetchUtxoAgeBands(),
      getFearGreedHistory().catch(() => []),
    ]);

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Bitcoin On-Chain"
        description="Real-time Bitcoin network health — hash rate, mempool, fees, miner revenue, transaction activity, and UTXO age bands."
      />

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
          <p className="text-[#555] font-mono text-xs uppercase">Network stats temporarily unavailable</p>
        </div>
      )}

      {/* ── Chart-derived metric KPIs ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Addresses (24h)"
          value={addrData.length > 0 ? fmtNum(addrData[addrData.length - 1]?.value ?? 0) : "—"}
          sub="blockchain.info · unique"
          color="#00d672"
        />
        <StatCard
          label="Miner Revenue (24h)"
          value={minerRevData.length > 0 ? `$${fmtNum(minerRevData[minerRevData.length - 1]?.value ?? 0)}` : "—"}
          sub="blockchain.info · USD"
          color="#FABF2C"
        />
        <StatCard
          label="Daily Transactions"
          value={txData.length > 0 ? fmtNum(txData[txData.length - 1]?.value ?? 0) : "—"}
          sub="blockchain.info · count"
          color="#fff"
        />
        <StatCard
          label="Tx Fees (24h)"
          value={feeData.length > 0 ? `$${fmtNum(feeData[feeData.length - 1]?.value ?? 0)}` : "—"}
          sub="blockchain.info · USD"
          color="#888"
        />
      </div>

      {fngData.length > 0 && <FearGreedWidget data={fngData} />}

      <BitcoinChartsClient
        addrData={addrData}
        txData={txData}
        hashData={hashData}
        feeData={feeData}
        mempoolData={mempoolData}
        minerRevData={minerRevData}
        utxoData={utxoData}
      />

      <div className="border border-[#1a1a1a] bg-[#080808] p-5">
        <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">About These Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] font-mono text-[#555] leading-relaxed">
          {[
            ["Hash Rate (EH/s)", "Total computational power securing the Bitcoin network. Higher = more secure."],
            ["Mempool Tx Count",  "Transactions waiting to be confirmed. Spike = network congestion."],
            ["Miner Revenue",     "Total USD value earned by miners per day (block subsidy + fees)."],
            ["UTXO Age Bands",    "Distribution of when coins last moved. Rising old coins = HODLing, falling = distribution."],
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
