import React, { Suspense }                        from 'react';
import { ChartSkeleton }                           from '../../_components/ChartSkeleton';
import { DataHeader }                              from '../../_components/DataHeader';
import { getBtcEtfOverview, getEthEtfOverview }   from '@/lib/etf-data';
import { getWeeklyFlows }                          from '@/lib/coinshares';

export const metadata = {
  title: 'ETF Comparison | CryptoBrainNews',
  description: 'Side-by-side comparison of Bitcoin and Ethereum spot ETF markets – AUM, holdings, and fees.',
};
export const revalidate = 300;

function fmtUsd(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

function BarCell({ pct, color }: { pct: number; color: string }) {
  return (
    <td className="px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-3 bg-[#111]">
          <div className="h-full" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
        </div>
        <span className="text-[10px] font-mono tabular-nums text-[#888] w-12 text-right shrink-0">
          {pct.toFixed(1)}%
        </span>
      </div>
    </td>
  );
}

async function ComparisonData() {
  const [btc, eth, flows] = await Promise.all([
    getBtcEtfOverview(),
    getEthEtfOverview(),
    getWeeklyFlows().catch(() => null),
  ]);

  const totalCombinedAum = btc.totalAumUsd + eth.totalAumUsd;
  const btcShare = totalCombinedAum > 0 ? (btc.totalAumUsd / totalCombinedAum) * 100 : 0;
  const ethShare = totalCombinedAum > 0 ? (eth.totalAumUsd / totalCombinedAum) * 100 : 0;

  const allProducts = [
    ...btc.products.map((p) => ({ ...p, coin: 'BTC' as const, coinPrice: btc.coinPrice })),
    ...eth.products.map((p) => ({ ...p, coin: 'ETH' as const, coinPrice: eth.coinPrice })),
  ].sort((a, b) => b.aumUsd - a.aumUsd);

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="ETF Market Comparison"
        description="Side-by-side BTC vs ETH spot ETF market – combined AUM, holdings, and product-level rankings."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Combined AUM',  value: fmtUsd(totalCombinedAum), color: '#FABF2C' },
          { label: 'BTC ETF AUM',         value: fmtUsd(btc.totalAumUsd),  color: '#FABF2C' },
          { label: 'ETH ETF AUM',         value: fmtUsd(eth.totalAumUsd),  color: '#3b82f6' },
          { label: 'Total Products',      value: String(btc.products.length + eth.products.length), color: '#888' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-white mb-6 border-l-2 border-[#FABF2C] pl-3">
          BTC vs ETH ETF Market Share of Combined AUM
        </h3>
        <div className="flex h-10 rounded overflow-hidden mb-4">
          <div
            className="flex items-center justify-center text-[10px] font-black text-black transition-all"
            style={{ width: `${btcShare}%`, background: '#FABF2C' }}
          >
            {btcShare > 10 ? `BTC ${btcShare.toFixed(1)}%` : ''}
          </div>
          <div
            className="flex items-center justify-center text-[10px] font-black text-white transition-all"
            style={{ width: `${ethShare}%`, background: '#3b82f6' }}
          >
            {ethShare > 10 ? `ETH ${ethShare.toFixed(1)}%` : ''}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {[
            { coin: 'BTC', share: btcShare, aum: btc.totalAumUsd, pctSupply: btc.pctOfSupply, color: '#FABF2C' },
            { coin: 'ETH', share: ethShare, aum: eth.totalAumUsd, pctSupply: eth.pctOfSupply, color: '#3b82f6' },
          ].map((s) => (
            <div key={s.coin} className="border border-[#1a1a1a] p-4">
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: s.color }}>{s.coin} ETFs</p>
              <div className="space-y-2 text-xs font-mono text-[#888]">
                <div className="flex justify-between">
                  <span>Total AUM</span>
                  <span className="font-black" style={{ color: s.color }}>{fmtUsd(s.aum)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Market Share</span>
                  <span className="text-white font-black">{s.share.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>% of Supply</span>
                  <span className="text-[#00d672] font-black">{s.pctSupply.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {flows && flows.latestWeek && (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-[#FABF2C] pl-3">
                ETF Weekly Flows — CoinShares
              </h3>
              <p className="text-[10px] text-[#555] font-mono mt-1 pl-3">
                Data updated weekly — manual entry · Source: coinshares.com/research
              </p>
            </div>
            <span className="border border-[#FABF2C]/40 text-[#FABF2C] font-mono text-[10px] px-3 py-1 uppercase tracking-widest">
              Week ending {new Date(flows.latestWeek.weekEnding).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'BTC Flow',     value: flows.latestWeek.btcFlowUsd,   color: '#FABF2C' },
              { label: 'ETH Flow',     value: flows.latestWeek.ethFlowUsd,   color: '#3b82f6' },
              { label: 'SOL Flow',     value: flows.latestWeek.solFlowUsd,   color: '#9945ff' },
              { label: 'Total Net',    value: flows.latestWeek.totalFlowUsd, color: '#00d672' },
              { label: 'Total AUM',    value: flows.latestWeek.aumUsd,       color: '#fff' },
            ].map((s) => {
              const isNegative = s.value < 0;
              return (
                <div key={s.label} className="border border-[#1a1a1a] bg-[#080808] p-4">
                  <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-1">{s.label}</p>
                  <p className={`text-xl font-black tabular-nums ${
                    s.label !== 'Total AUM' ? (isNegative ? 'text-[#ff4757]' : 'text-[#00d672]') : ''
                  }`} style={s.label === 'Total AUM' ? { color: s.color } : undefined}>
                    {s.label === 'Total AUM'
                      ? fmtUsd(s.value)
                      : `${isNegative ? '-' : '+'}$${(Math.abs(s.value) / 1e6).toFixed(1)}M`}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 border border-[#1a1a1a] overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                  {['Week Ending', 'BTC Flow', 'ETH Flow', 'SOL Flow', 'Total Net', 'AUM'].map((h) => (
                    <th key={h} className={`px-3 py-2 font-black text-[#555] uppercase tracking-widest ${h === 'Week Ending' ? 'text-left' : 'text-right'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {flows.weeks.slice(0, 12).map((w, i) => (
                  <tr key={w.weekEnding} className={`border-b border-[#111] hover:bg-[#0f0f0f] ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'}`}>
                    <td className="px-3 py-2 font-mono text-[#888]">{w.weekEnding}</td>
                    <td className={`px-3 py-2 text-right font-mono tabular-nums ${w.btcFlowUsd >= 0 ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
                      {w.btcFlowUsd >= 0 ? '+' : ''}${(w.btcFlowUsd / 1e6).toFixed(1)}M
                    </td>
                    <td className={`px-3 py-2 text-right font-mono tabular-nums ${w.ethFlowUsd >= 0 ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
                      {w.ethFlowUsd >= 0 ? '+' : ''}${(w.ethFlowUsd / 1e6).toFixed(1)}M
                    </td>
                    <td className={`px-3 py-2 text-right font-mono tabular-nums ${w.solFlowUsd >= 0 ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
                      {w.solFlowUsd >= 0 ? '+' : ''}${(w.solFlowUsd / 1e6).toFixed(1)}M
                    </td>
                    <td className={`px-3 py-2 text-right font-mono font-black tabular-nums ${w.totalFlowUsd >= 0 ? 'text-[#00d672]' : 'text-[#ff4757]'}`}>
                      {w.totalFlowUsd >= 0 ? '+' : ''}${(w.totalFlowUsd / 1e6).toFixed(1)}M
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-[#888]">${(w.aumUsd / 1e9).toFixed(1)}B</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#FABF2C] rounded-full" />
          All Products – Ranked by AUM
        </h3>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest">#</th>
                <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest">Ticker</th>
                <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest">Issuer</th>
                <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest">Asset</th>
                <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">AUM</th>
                <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest w-40">Market Share</th>
                <th className="px-4 py-3 text-right font-black text-[#555] uppercase tracking-widest">Fee</th>
              </tr>
            </thead>
            <tbody>
              {allProducts.map((p, i) => {
                const color = p.coin === 'BTC' ? '#FABF2C' : '#3b82f6';
                return (
                  <tr
                    key={`${p.coin}-${p.ticker}`}
                    className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${
                      i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'
                    }`}
                  >
                    <td className="px-4 py-3 text-[#555] tabular-nums">{i + 1}</td>
                    <td className="px-4 py-3 font-black text-white">{p.ticker}</td>
                    <td className="px-4 py-3 font-bold text-[#ccc]">{p.issuer}</td>
                    <td className="px-4 py-3">
                      <span className="font-black text-[10px] px-2 py-0.5 border"
                            style={{ color, borderColor: color, background: `${color}15` }}>
                        {p.coin}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-black tabular-nums"
                        style={{ color }}>
                      {fmtUsd(p.aumUsd)}
                    </td>
                    <BarCell pct={p.marketShare} color={color} />
                    <td className={`px-4 py-3 text-right font-mono tabular-nums ${
                      p.feeNum <= 0.002 ? 'text-[#00d672]' : p.feeNum >= 0.015 ? 'text-[#ff4757]' : 'text-[#FABF2C]'
                    }`}>
                      {p.fee}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-[#333] font-mono mt-2 text-right">
          AUM = on-chain holdings × live CoinGecko price · Cached 5 min
        </p>
      </div>
    </div>
  );
}

export default function EtfComparisonPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <ComparisonData />
      </Suspense>
    </main>
  );
}
