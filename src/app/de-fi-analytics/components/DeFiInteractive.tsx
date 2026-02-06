'use client';
import React from 'react';
import ProtocolRankings from './ProtocolRankings';
import StablecoinAnalytics from './StablecoinAnalytics';
import YieldCalculator from './YieldCalculator';
import OnChainMetrics from './OnChainMetrics';
import AlphaGate from '@/components/auth/AlphaGate';
import WhaleWatch from './WhaleWatch'; // NEW

interface DeFiInteractiveProps {
  initialProtocols: any[];
  stablecoins: any[];
  tvlData?: any[]; 
}

const DeFiInteractive = ({ initialProtocols, stablecoins, tvlData = [] }: DeFiInteractiveProps) => {
  return (
    <div className="space-y-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <ProtocolRankings protocols={initialProtocols} />
        </div>
        
        {/* ALPHA COLUMN */}
        <div className="lg:col-span-4 space-y-8">
          <AlphaGate>
            <WhaleWatch />
          </AlphaGate>
          <StablecoinAnalytics data={stablecoins} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AlphaGate>
           <YieldCalculator />
        </AlphaGate>
        <OnChainMetrics />
      </div>
    </div>
  );
};
export default DeFiInteractive;
