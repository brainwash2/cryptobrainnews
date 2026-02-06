'use client';
import React from 'react';
import ProtocolRankings from './ProtocolRankings';
import StablecoinAnalytics from './StablecoinAnalytics';
import YieldCalculator from './YieldCalculator';
import OnChainMetrics from './OnChainMetrics';
import AlphaGate from '@/components/auth/AlphaGate';
import WhaleWatch from './WhaleWatch'; // Import the new Alpha tool

const DeFiInteractive = ({ initialProtocols, stablecoins }: any) => {
  return (
    <div className="space-y-12 pb-20">
      {/* 1. PUBLIC SECTION (TEASER) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
           <ProtocolRankings protocols={initialProtocols} />
        </div>
        <div className="lg:col-span-4">
           <OnChainMetrics />
        </div>
      </div>

      {/* 2. ALPHA SECTION (THE SECRET SAUCE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <AlphaGate>
             <WhaleWatch />
          </AlphaGate>
        </div>
        <div className="lg:col-span-5">
          <AlphaGate>
             <StablecoinAnalytics data={stablecoins} />
          </AlphaGate>
        </div>
      </div>

      {/* 3. TOOLS SECTION */}
      <div className="max-w-2xl mx-auto">
        <AlphaGate>
           <YieldCalculator />
        </AlphaGate>
      </div>
    </div>
  );
};
export default DeFiInteractive;
