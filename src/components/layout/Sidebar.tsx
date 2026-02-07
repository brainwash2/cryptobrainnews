'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MENU = {
  "Markets": ["Spot", "Futures", "Options", "Crypto Indices"],
  "ETFs": ["Bitcoin ETFs", "Ethereum ETFs", "Solana ETFs"],
  "Stablecoins": ["USD Pegged", "Non-USD Pegged", "Supply Flow"],
  "On-Chain": ["Bitcoin", "Ethereum", "Solana", "Layer 2s"],
  "DeFi": ["TVL", "DEX Volume", "Lending", "Restaking"],
  "NFTs": ["Marketplaces", "Collections", "Gaming"]
};

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#f8f9fa] border-r border-gray-200 min-h-screen p-6 hidden lg:block">
      <div className="space-y-8">
        {Object.entries(MENU).map(([category, items]) => (
          <div key={category}>
            <h3 className="font-black text-xs uppercase text-gray-400 tracking-widest mb-4">{category}</h3>
            <ul className="space-y-2">
              {items.map(item => (
                <li key={item}>
                  <Link 
                    href={`/data/${category.toLowerCase()}/${item.toLowerCase().replace(/ /g, '-')}`}
                    className={`block text-sm font-bold transition-colors ${
                      pathname.includes(item.toLowerCase()) ? 'text-primary' : 'text-gray-700 hover:text-black'
                    }`}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}