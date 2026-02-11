'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MENU = {
  "Markets": ["Spot", "Futures", "Options", "Crypto Indices"],
  "ETFs": ["Bitcoin ETFs", "Ethereum ETFs", "Solana ETFs"],
  "On-Chain": ["Bitcoin", "Ethereum", "Solana", "Layer 2s"],
  "DeFi": ["TVL", "DEX Volume", "Lending", "Restaking"],
};

export default function DataSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-black border-r border-gray-800 min-h-screen p-6 hidden lg:block sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="space-y-8">
        {Object.entries(MENU).map(([category, items]) => (
          <div key={category}>
            <h3 className="font-black text-[10px] uppercase text-primary tracking-widest mb-4 border-b border-gray-800 pb-2">{category}</h3>
            <ul className="space-y-1">
              {items.map(item => {
                const href = `/data/${category.toLowerCase()}/${item.toLowerCase().replace(/ /g, '-')}`;
                const isActive = pathname === href;
                return (
                  <li key={item}>
                    <Link 
                      href={href}
                      className={`block text-xs font-bold py-2 px-3 rounded transition-all ${
                        isActive ? 'bg-white/10 text-white border-l-2 border-primary' : 'text-gray-500 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {item}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
