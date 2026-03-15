import React, { Suspense }                                    from 'react';
import { ChartSkeleton }                                       from '../../_components/ChartSkeleton';
import { DataHeader }                                          from '../../_components/DataHeader';
import { getBitcoinTreasuries, getEthereumTreasuries }        from '@/lib/treasury-data';

export const metadata = { title: 'Corporate Crypto Holdings | CryptoBrainNews' };
export const revalidate = 21600;

function fmtUsd(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

async function CryptoTreasuryData() {
  const [btcData, ethData] = await Promise.all([
    getBitcoinTreasuries(),
    getEthereumTreasuries(),
  ]);

  const btcCompanies = btcData?.companies ?? [];
  const ethCompanies = ethData?.companies ?? [];

  // Build a unified company view (some companies hold both)
  const companyMap = new Map<string, {
    name: string; symbol: string; country: string;
    btcHoldings: number; btcValueUsd: number;
    ethHoldings: number; ethValueUsd: number;
  }>();

  btcCompanies.forEach((c) => {
    companyMap.set(c.name, {
      name: c.name, symbol: c.symbol ?? '', country: c.country ?? '',
      btcHoldings: c.total_holdings, btcValueUsd: c.total_current_value_usd,
      ethHoldings: 0, ethValueUsd: 0,
    });
  });

  ethCompanies.forEach((c) => {
    const existing = companyMap.get(c.name);
    if (existing) {
      existing.ethHoldings = c.total_holdings;
      existing.ethValueUsd = c.total_current_value_usd;
    } else {
      companyMap.set(c.name, {
        name: c.name, symbol: c.symbol ?? '', country: c.country ?? '',
        btcHoldings: 0, btcValueUsd: 0,
        ethHoldings: c.total_holdings, ethValueUsd: c.total_current_value_usd,
      });
    }
  });

  const companies = [...companyMap.values()]
    .sort((a, b) => (b.btcValueUsd + b.ethValueUsd) - (a.btcValueUsd + a.ethValueUsd));

  const totalBtcValue = btcData?.total_value_usd ?? 0;
  const totalEthValue = ethData?.total_value_usd ?? 0;
  const totalCombined = totalBtcValue + totalEthValue;

  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Corporate Crypto Holdings"
        description="Aggregated digital asset treasury holdings across all tracked public companies."
      />

      {/* ── KPI Strip ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Combined Value', value: fmtUsd(totalCombined),  color: '#FABF2C' },
          { label: 'BTC Treasury Value',   value: fmtUsd(totalBtcValue),  color: '#FABF2C' },
          { label: 'ETH Treasury Value',   value: fmtUsd(totalEthValue),  color: '#3b82f6' },
          { label: 'Companies Tracked',    value: String(companies.length), color: '#888' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-[10px] font-black text-[#555] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Combined Table ─────────────────────────────────────────── */}
      <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#1a1a1a] bg-[#080808]">
              {['#', 'Company', 'Symbol', 'Country', 'BTC Holdings', 'BTC Value', 'ETH Holdings', 'ETH Value', 'Total Value'].map((h) => (
                <th
                  key={h}
                  className={`px-4 py-3 font-black text-[#555] uppercase tracking-widest whitespace-nowrap ${
                    ['#', 'Company', 'Symbol', 'Country'].includes(h) ? 'text-left' : 'text-right'
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {companies.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-[#555] font-mono text-xs">
                  Syncing treasury data...
                </td>
              </tr>
            )}
            {companies.map((c, i) => (
              <tr
                key={c.name}
                className={`border-b border-[#111] hover:bg-[#0f0f0f] transition-colors ${
                  i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'
                }`}
              >
                <td className="px-4 py-3 text-[#555]">{i + 1}</td>
                <td className="px-4 py-3 font-bold text-white whitespace-nowrap">{c.name}</td>
                <td className="px-4 py-3 font-mono text-[#888]">{c.symbol || '—'}</td>
                <td className="px-4 py-3 text-[#888]">{c.country || '—'}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-[#FABF2C]">
                  {c.btcHoldings > 0 ? `${c.btcHoldings.toLocaleString()} BTC` : '—'}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                  {c.btcValueUsd > 0 ? fmtUsd(c.btcValueUsd) : '—'}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-[#3b82f6]">
                  {c.ethHoldings > 0 ? `${c.ethHoldings.toLocaleString()} ETH` : '—'}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-[#888]">
                  {c.ethValueUsd > 0 ? fmtUsd(c.ethValueUsd) : '—'}
                </td>
                <td className="px-4 py-3 text-right font-mono font-black tabular-nums text-white">
                  {fmtUsd(c.btcValueUsd + c.ethValueUsd)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-[#333] font-mono mt-2 text-right">
        Source: CoinGecko public treasury API · Cached 6 hours
      </p>
    </div>
  );
}

export default function CryptoTreasuriesPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <CryptoTreasuryData />
      </Suspense>
    </main>
  );
}
