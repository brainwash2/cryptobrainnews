'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface FilterToolbarProps {
  selectedExchange: string;
  onExchangeChange: (exchange: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  volumeThreshold: string;
  onVolumeThresholdChange: (threshold: string) => void;
}

export default function FilterToolbar({
  selectedExchange,
  onExchangeChange,
  searchQuery,
  onSearchChange,
  volumeThreshold,
  onVolumeThresholdChange
}: FilterToolbarProps) {
  const exchanges = ['All Exchanges', 'Binance', 'Coinbase', 'Kraken', 'Bybit', 'OKX'];
  const volumeThresholds = ['All Volumes', '>$1M', '>$10M', '>$100M', '>$1B'];

  return (
    <div className="bg-card border border-border p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Icon name="MagnifyingGlassIcon" size={20} className="text-muted-foreground" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search trading pairs..."
            className="w-full h-10 pl-10 pr-4 bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-caption"
          />
        </div>

        {/* Exchange Filter */}
        <div className="relative">
          <select
            value={selectedExchange}
            onChange={(e) => onExchangeChange(e.target.value)}
            className="w-full h-10 px-4 bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-caption appearance-none cursor-pointer"
          >
            {exchanges.map((exchange) => (
              <option key={exchange} value={exchange}>
                {exchange}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon name="ChevronDownIcon" size={20} className="text-muted-foreground" />
          </div>
        </div>

        {/* Volume Threshold Filter */}
        <div className="relative">
          <select
            value={volumeThreshold}
            onChange={(e) => onVolumeThresholdChange(e.target.value)}
            className="w-full h-10 px-4 bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm font-caption appearance-none cursor-pointer"
          >
            {volumeThresholds.map((threshold) => (
              <option key={threshold} value={threshold}>
                {threshold}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon name="ChevronDownIcon" size={20} className="text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}
