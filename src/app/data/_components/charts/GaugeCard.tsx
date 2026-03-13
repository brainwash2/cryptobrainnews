'use client';

import React, { useEffect, useState } from 'react';

interface GaugeCardProps {
  title: string;
  value: number;
  max?: number;
  suffix?: string;
  color?: string;
  description?: string;
}

export default function GaugeCard({ 
  title, 
  value, 
  max = 100, 
  suffix = '%', 
  color = '#FABF2C',
  description 
}: GaugeCardProps) {
  const[mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  },[]);

  const percentage = Math.min(Math.max(value / max, 0), 1);
  const radius = 60;
  const circumference = Math.PI * radius;
  // Start at zero for animation, then fill to the value
  const strokeDashoffset = mounted ? circumference - percentage * circumference : circumference;

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 flex flex-col items-center justify-between h-full relative overflow-hidden group">
      <h3 className="text-[10px] font-black text-[#888] uppercase tracking-widest w-full text-left mb-6 group-hover:text-white transition-colors">{title}</h3>
      
      <div className="relative flex items-center justify-center my-4">
        <svg width="180" height="100" viewBox="0 0 160 90" className="transform rotate-180">
          <path 
            d="M 20 80 A 60 60 0 0 1 140 80" 
            fill="none" 
            stroke="#1a1a1a" 
            strokeWidth="16" 
            strokeLinecap="round" 
          />
          <path 
            d="M 20 80 A 60 60 0 0 1 140 80" 
            fill="none" 
            stroke={color} 
            strokeWidth="16" 
            strokeLinecap="round" 
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset} 
            className="transition-all duration-1000 ease-out" 
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-2">
          <span className="text-3xl font-black tabular-nums text-white" style={{ color }}>
            {mounted ? value.toFixed(1) : '0.0'}{suffix}
          </span>
        </div>
      </div>

      {description && (
        <p className="text-[9px] font-mono text-[#555] uppercase tracking-widest mt-4 text-center">
          {description}
        </p>
      )}
    </div>
  );
}
