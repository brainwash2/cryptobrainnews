import React from 'react';
import L2Client from './_components/L2Client';

export const metadata = {
  title: 'Layer 2 Data | CryptoBrainNews',
  description: 'L2 scaling comparison: Arbitrum, Optimism, Base, ZkSync.',
};

export const revalidate = 300;

export default function L2Page() {
  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Layer 2 Scaling</h1>
        <p className="text-[#555] font-mono text-[10px] uppercase tracking-[0.3em] mb-10">
          Arbitrum • Optimism • Base • ZkSync
        </p>
        <L2Client />
      </div>
    </main>
  );
}
