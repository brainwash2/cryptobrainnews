import React, { Suspense }     from 'react';
import { DataHeader }           from '../../_components/DataHeader';
import { ChartSkeleton }        from '../../_components/ChartSkeleton';
import { Clock }                from 'lucide-react';

export const metadata = {
  title: 'Data Availability | CryptoBrainNews',
  description: 'Celestia, EigenDA, Avail – modular data availability layers for blockchain scaling.',
};
export const revalidate = 3600;

const DA_LAYERS = [
  {
    name:        'Celestia',
    token:       'TIA',
    color:       '#7c3aed',
    type:        'Modular DA',
    description: 'First modular DA network. Decouples data availability from execution and consensus. Uses DAS (Data Availability Sampling) so light nodes can verify DA without downloading all data.',
    users:       ['Manta Pacific', 'Caldera chains', 'Astria', 'Rollkit rollups'],
    status:      'Live (Mainnet)',
    throughput:  '8 MB/block (~2 MB/s)',
    links:       ['https://celestia.org', 'https://docs.celestia.org'],
  },
  {
    name:        'EigenDA',
    token:       'EIGEN',
    color:       '#6366f1',
    type:        'Restaked DA',
    description: 'Built on EigenLayer restaking. Uses Ethereum validators restaking ETH to secure DA. Horizontal scalability — throughput grows as more operators join.',
    users:       ['Mantle', 'Celo', 'Movement Labs', 'Polymer'],
    status:      'Live (Mainnet)',
    throughput:  '10 MB/s (target: 1 GB/s)',
    links:       ['https://eigenda.xyz'],
  },
  {
    name:        'Avail',
    token:       'AVAIL',
    color:       '#0ea5e9',
    type:        'Modular DA',
    description: 'Spun out from Polygon. Focuses on data availability with KZG polynomial commitments and DAS. Designed for high throughput sovereign rollups.',
    users:       ['Dymension', 'Madara (StarkNet)'],
    status:      'Live (Mainnet)',
    throughput:  '128 MB/block',
    links:       ['https://availproject.org'],
  },
  {
    name:        'Ethereum Blobs (EIP-4844)',
    token:       'ETH',
    color:       '#3b82f6',
    type:        'L1 DA (Dencun)',
    description: 'Post-Dencun upgrade DA via blob-carrying transactions. ~128KB per blob, max 6 blobs/block (~768KB/block). Stored for 18 days then pruned. The cheapest DA for Ethereum rollups.',
    users:       ['All Ethereum rollups (Arbitrum, OP, Base, zkSync, Starknet)'],
    status:      'Live (Ethereum Mainnet)',
    throughput:  '~1 MB/block (6 blobs × 128KB)',
    links:       ['https://eips.ethereum.org/EIPS/eip-4844'],
  },
];

const COMPARE_ROWS = [
  { metric: 'Trust model',          celestia: 'DAS + BFT',         eigenda: 'Restaked ETH',       avail: 'DAS + KZG',          ethBlobs: 'Full L1 security' },
  { metric: 'Token',                celestia: 'TIA',               eigenda: 'EIGEN',              avail: 'AVAIL',              ethBlobs: 'ETH (gas)' },
  { metric: 'Pruning',              celestia: 'Never (archival)',  eigenda: '14 days',            avail: 'Never',              ethBlobs: '18 days' },
  { metric: 'Light client DA',      celestia: 'Yes (DAS)',         eigenda: 'Partial',            avail: 'Yes (DAS)',          ethBlobs: 'No' },
  { metric: 'Cost vs ETH calldata', celestia: '99% cheaper',      eigenda: '99% cheaper',        avail: '99% cheaper',        ethBlobs: '95–99% cheaper' },
  { metric: 'EVM settlement',       celestia: 'Via Ethereum',      eigenda: 'Via Ethereum',       avail: 'Via Ethereum',       ethBlobs: 'Native' },
];

async function DataAvailabilityContent() {
  return (
    <div className="space-y-10 pb-20">
      <DataHeader
        title="Data Availability Layers"
        description="Modular DA networks – Celestia, EigenDA, Avail, and Ethereum blobs. The infrastructure layer enabling cheap rollup data posting."
      />

      {/* ── Status Note ────────────────────────────────────────────── */}
      <div className="border border-[#FABF2C]/20 bg-[#FABF2C]/[0.02] p-5 flex gap-4 items-start">
        <Clock className="text-[#FABF2C] shrink-0 mt-0.5" size={18} />
        <p className="text-[10px] font-mono text-[#888] leading-relaxed">
          <span className="text-[#FABF2C] font-black">Live metrics status:</span>{' '}
          Real-time blob metrics (blobs/block, data posted per namespace, fees) require the Celestia node API
          or a third-party indexer. On-chain data will populate automatically once integrated.
          Current page shows protocol-level reference data.
        </p>
      </div>

      {/* ── DA Layer Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {DA_LAYERS.map((da) => (
          <div
            key={da.name}
            className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 hover:border-opacity-80 transition-all"
            style={{ borderColor: `${da.color}30` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: da.color }} />
                  {da.name}
                </h3>
                <span className="font-mono text-[10px] mt-1 px-2 py-0.5 border inline-block"
                      style={{ color: da.color, borderColor: `${da.color}40`, background: `${da.color}10` }}>
                  {da.type}
                </span>
              </div>
              <div className="text-right">
                <p className="font-black text-[10px] uppercase tracking-widest" style={{ color: da.color }}>{da.token}</p>
                <p className="text-[10px] font-mono text-[#00d672] mt-1">{da.status}</p>
              </div>
            </div>

            <p className="text-[10px] font-mono text-[#888] leading-relaxed mb-4">{da.description}</p>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-[#555] uppercase tracking-widest">Throughput</span>
                <span className="font-mono text-[10px]" style={{ color: da.color }}>{da.throughput}</span>
              </div>
              <div>
                <span className="text-[10px] font-black text-[#555] uppercase tracking-widest">Key Users:</span>
                <p className="text-[10px] font-mono text-[#888] mt-1">{da.users.join(' · ')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Comparison Table ───────────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-4 flex items-center gap-3">
          <span className="w-2 h-2 bg-[#7c3aed] rounded-full" />
          Feature Comparison
        </h3>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                <th className="px-4 py-3 text-left font-black text-[#555] uppercase tracking-widest">Metric</th>
                <th className="px-4 py-3 text-left font-black uppercase tracking-widest" style={{ color: '#7c3aed' }}>Celestia</th>
                <th className="px-4 py-3 text-left font-black uppercase tracking-widest" style={{ color: '#6366f1' }}>EigenDA</th>
                <th className="px-4 py-3 text-left font-black uppercase tracking-widest" style={{ color: '#0ea5e9' }}>Avail</th>
                <th className="px-4 py-3 text-left font-black uppercase tracking-widest" style={{ color: '#3b82f6' }}>ETH Blobs</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((r, i) => (
                <tr key={r.metric} className={`border-b border-[#111] ${i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'}`}>
                  <td className="px-4 py-3 font-bold text-white">{r.metric}</td>
                  <td className="px-4 py-3 font-mono text-[#888]">{r.celestia}</td>
                  <td className="px-4 py-3 font-mono text-[#888]">{r.eigenda}</td>
                  <td className="px-4 py-3 font-mono text-[#888]">{r.avail}</td>
                  <td className="px-4 py-3 font-mono text-[#888]">{r.ethBlobs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Blob metrics note ──────────────────────────────────────── */}
      <div className="border border-[#1a1a1a] bg-[#080808] p-5">
        <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">Ethereum Blob Metrics (EIP-4844)</h3>
        <p className="text-[10px] text-[#555] font-mono leading-relaxed">
          Since the Dencun upgrade (March 2024), Ethereum supports blob-carrying transactions (type 0x03).
          Blobs have a separate fee market (blob base fee) that resets independently of execution gas.
          Rollups posting calldata to Ethereum saw 90–99% fee reductions post-Dencun.
          Real-time blob count per block, blob base fee, and per-chain blob usage metrics
          will be integrated via Etherscan API in a future update.
        </p>
      </div>
    </div>
  );
}

export default function DataAvailabilityPage() {
  return (
    <main>
      <Suspense fallback={<ChartSkeleton />}>
        <DataAvailabilityContent />
      </Suspense>
    </main>
  );
}
