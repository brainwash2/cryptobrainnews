'use client';
import React from 'react';
import ProtocolRankings from './ProtocolRankings';
import StablecoinAnalytics from './StablecoinAnalytics';
import YieldCalculator from './YieldCalculator';
import OnChainMetrics from './OnChainMetrics';
import AlphaGate from '@/components/auth/AlphaGate'; // Import the Gate

interface DeFiInteractiveProps {
  initialProtocols: any[];
  stablecoins: any[];
  tvlData?: any[]; 
}

const DeFiInteractive = ({ initialProtocols, stablecoins, tvlData = [] }: DeFiInteractiveProps) => {
  return (
    <div className="space-y-8 pb-20">
      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <StablecoinAnalytics data={stablecoins} />
        </div>
        <div className="lg:col-span-8">
          <ProtocolRankings protocols={initialProtocols} />
        </div>
      </div>

      {/* LOCKED SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PREMIUM FEATURE: WRAPPED IN ALPHA GATE */}
        <AlphaGate>
           <YieldCalculator />
        </AlphaGate>
        
        {/* FREE FEATURE: Left open as a teaser */}
        <OnChainMetrics />
      </div>
    </div>
  );
};
export default DeFiInteractive;
