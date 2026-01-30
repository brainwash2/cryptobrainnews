'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

const YieldCalculator = () => {
  const [amount, setAmount] = useState(10000);
  const apy = 12.5;

  return (
    <div className="bg-card border border-border p-6">
      <h2 className="text-xl font-bold font-heading mb-4">Yield Optimizer</h2>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-caption text-muted-foreground uppercase">Investment Amount (USD)</label>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full bg-secondary border border-border p-3 text-white font-data mt-1 outline-none focus:border-primary"
          />
        </div>
        <div className="bg-secondary p-4 flex justify-between items-center">
          <div>
            <p className="text-xs font-caption text-muted-foreground">Estimated Yearly Return</p>
            <p className="text-2xl font-bold text-success font-data">${(amount * (apy/100)).toLocaleString()}</p>
          </div>
          <Icon name="ArrowTrendingUpIcon" className="text-success" size={32} />
        </div>
      </div>
    </div>
  );
};
export default YieldCalculator;
