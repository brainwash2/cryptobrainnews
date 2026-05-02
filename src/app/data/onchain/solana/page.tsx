import React, { Suspense } from "react";
import { DataHeader }       from "../../_components/DataHeader";
import { ChartSkeleton }    from "../../_components/ChartSkeleton";
import { cached }           from "@/lib/cache";
import SolanaChartsClient   from "./_components/SolanaChartsClient";
import type { TpsPoint }    from "./_components/SolanaChartsClient";

export const metadata = { title: "Solana On-Chain | CryptoBrainNews" };
export const revalidate = 300;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ft(url: string, opts?: any): Promise<Response | null> {
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), 6_000);
  try { return await fetch(url, { signal: ac.signal, cache: "no-store", ...opts }); }
  catch { return null; }
  finally { clearTimeout(id); }
}

function Card({ label, value, sub, color = "#9945ff" }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
      <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{label}</p>
      <p className="text-2xl font-black tabular-nums" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] font-mono text-[#555] mt-1">{sub}</p>}
    </div>
  );
}

// ── Unit 3: Solana Validator Count & Nakamoto Coefficient ─────────────────────

interface SolVoteAccount {
  activatedStake: number;
  votePubkey:     string;
  commission:     number;
}

interface SolValidatorStats {
  activeCount:  number;
  totalStake:   number;
  nakamoto33:   number;
}

async function fetchSolValidators(): Promise<SolValidatorStats | null> {
  return cached("sol:validators:v1", async () => {
    try {
      const res = await fetch("https://api.mainnet-beta.solana.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getVoteAccounts", params: [] }),
        next: { revalidate: 300 },
      });
      if (!res.ok) return null;
      const json = await res.json() as {
        result?: { current?: SolVoteAccount[]; delinquent?: SolVoteAccount[] };
      };
      const current = json.result?.current ?? [];
      if (current.length === 0) return null;

      const totalStake = current.reduce((s, v) => s + v.activatedStake, 0);
      const sorted     = [...current].sort((a, b) => b.activatedStake - a.activatedStake);

      // Nakamoto coefficient: min validators to control >33.3% of stake
      let cumStake = 0;
      let nakamoto = 0;
      const threshold = totalStake * 0.333;
      for (const v of sorted) {
        cumStake += v.activatedStake;
        nakamoto++;
        if (cumStake > threshold) break;
      }

      return { activeCount: current.length, totalStake, nakamoto33: nakamoto };
    } catch {
      return null;
    }
  }, 300);
}

async function SolData() {
  const priceR = await ft("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
  const tvlR   = await ft("https://api.llama.fi/v2/historicalChainTvl/Solana");
  const tpsR   = await ft("https://api.mainnet-beta.solana.com", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getRecentPerformanceSamples", params: [60] }),
  });

  const [priceJ, tvlJ, tpsJ, validatorStats] = await Promise.allSettled([
    priceR?.ok ? priceR.json() : Promise.resolve(null),
    tvlR?.ok   ? tvlR.json()  : Promise.resolve(null),
    tpsR?.ok   ? tpsR.json()  : Promise.resolve(null),
    fetchSolValidators(),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const solPrice = priceJ.status === "fulfilled" ? (priceJ.value as any)?.solana?.usd as number ?? 0 : 0;
  const tvlRaw   = tvlJ.status   === "fulfilled" ? (tvlJ.value as Array<{date:number;tvl:number}>) ?? [] : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tpsSamples = tpsJ.status  === "fulfilled" ? (tpsJ.value as any)?.result as Array<{
    numTransactions: number;
    samplePeriodSecs: number;
    slot: number;
  }> ?? [] : [];

  // Compute TPS from each sample (reversed so oldest first)
  const tpsData: TpsPoint[] = [...tpsSamples]
    .reverse()
    .map((s, i) => ({
      label: String(i + 1),
      tps: s.samplePeriodSecs > 0 ? Math.round(s.numTransactions / s.samplePeriodSecs) : 0,
    }))
    .filter((p) => p.tps > 0);

  const liveTps = tpsSamples.length > 0 && tpsSamples[0]?.samplePeriodSecs > 0
    ? Math.round(tpsSamples[0].numTransactions / tpsSamples[0].samplePeriodSecs) : 0;

  const latestTvl   = Array.isArray(tvlRaw) && tvlRaw.length ? tvlRaw[tvlRaw.length - 1]?.tvl ?? 0 : 0;
  const valStats    = validatorStats.status === "fulfilled" ? validatorStats.value : null;
  const tvlChart  = Array.isArray(tvlRaw) ? tvlRaw.slice(-90).map((p) => ({
    date: new Date(p.date * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    tvl:  p.tvl,
  })) : [];

  return (
    <div className="space-y-10 pb-20">
      <DataHeader title="Solana On-Chain"
        description="Solana network health — TVL, live TPS, and staking APR." />
      <div className="flex items-center gap-3">
        <span className="border border-[#00d672]/40 text-[#00d672] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
          Live — Solana RPC + DefiLlama + CoinGecko
        </span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card label="SOL Price"    value={solPrice > 0 ? `$${solPrice.toFixed(2)}` : "—"} sub="CoinGecko" />
        <Card label="DeFi TVL"     value={latestTvl > 0 ? `$${(latestTvl/1e9).toFixed(2)}B` : "—"} sub="DefiLlama" />
        <Card label="Live TPS"     value={liveTps > 0 ? liveTps.toLocaleString() : "~2,500"} sub="getRecentPerformanceSamples" color="#fff" />
        <Card label="Staking APR"  value="~6.5%" sub="approximate network APY" color="#00d672" />
        <Card label="Block Time"   value="~400ms" sub="average slot time" color="#888" />
        <Card label="Consensus"    value="PoH + PoS" sub="Proof of History" color="#888" />
        <Card label="Source"       value="Mainnet RPC" sub="api.mainnet-beta.solana.com" color="#888" />
        <Card label="Network"      value="Solana" sub="High-performance L1" color="#9945ff" />
      </div>

      {/* ── Unit 3 (Batch 8): Solana Validator Count & Nakamoto Coefficient ──── */}
      {valStats && (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#9945ff] pl-3 mb-5">
            Validator Decentralization
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card
              label="Active Validators"
              value={valStats.activeCount.toLocaleString()}
              sub="non-delinquent vote accounts"
              color="#9945ff"
            />
            <Card
              label="Nakamoto Coefficient"
              value={String(valStats.nakamoto33)}
              sub="validators to control >33% stake"
              color={valStats.nakamoto33 >= 30 ? "#00d672" : valStats.nakamoto33 >= 15 ? "#FABF2C" : "#ff4757"}
            />
            <Card
              label="Total Stake"
              value={`${(valStats.totalStake / 1e9).toFixed(1)}B`}
              sub="lamports of activated stake"
              color="#888"
            />
            <Card
              label="Decentralization"
              value={valStats.nakamoto33 >= 30 ? "High" : valStats.nakamoto33 >= 15 ? "Medium" : "Low"}
              sub={`N=${valStats.nakamoto33} for 33% threshold`}
              color={valStats.nakamoto33 >= 30 ? "#00d672" : valStats.nakamoto33 >= 15 ? "#FABF2C" : "#ff4757"}
            />
          </div>
          <p className="text-[9px] text-[#333] font-mono mt-4">
            Source: Solana RPC getVoteAccounts · Nakamoto = min validators for 33.3% stake · Cached 5 min
          </p>
        </div>
      )}

      {/* Recharts charts — TPS history + TVL replaces the old CSS bar chart */}
      <SolanaChartsClient tpsData={tpsData} tvlChart={tvlChart} latestTvl={latestTvl} />
    </div>
  );
}

export default function SolanaPage() {
  return <main><Suspense fallback={<ChartSkeleton />}><SolData /></Suspense></main>;
}