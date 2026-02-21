import React from 'react';
import ExchangesClient from './_components/ExchangesClient';

export const metadata = {
  title: 'DEX Volumes | CryptoBrainNews',
  description: 'Decentralized exchange trading volumes by protocol.',
};

export const revalidate = 300;

export default function ExchangesPage() {
  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">DEX Volumes</h1>
        <p className="text-[#555] font-mono text-[10px] uppercase tracking-[0.3em] mb-10">
          Decentralized Exchange Trading Activity
        </p>
        <ExchangesClient />
      </div>
    </main>
  );
}
