'use client';

import React from 'react';
import { useWeb3 } from '../providers/Web3Provider';
import { Wallet, LogOut, Loader2 } from 'lucide-react';

export default function ConnectWallet() {
  const { address, isConnecting, connect, disconnect } = useWeb3();

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  if (address) {
    return (
      <div className="flex items-center gap-3 bg-[#111] border border-[#333] pl-4 pr-2 py-2 rounded">
        <div className="w-2 h-2 rounded-full bg-[#00d672] animate-pulse" />
        <span className="font-mono text-xs text-[#00d672] font-black">{formatAddress(address)}</span>
        <button 
          onClick={disconnect}
          className="p-2 hover:bg-[#222] rounded transition-colors text-[#888] hover:text-white"
          title="Disconnect"
        >
          <LogOut size={14} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="flex items-center gap-2 bg-[#FABF2C] text-black px-6 py-3 rounded text-xs font-black uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
    >
      {isConnecting ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
