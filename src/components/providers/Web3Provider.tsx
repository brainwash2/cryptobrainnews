'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Web3ContextType = {
  address: string | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const Web3Context = createContext<Web3ContextType>({
  address: null,
  isConnecting: false,
  connect: async () => {},
  disconnect: () => {},
});

export const useWeb3 = () => useContext(Web3Context);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAddress(accounts[0]);
          }
        } catch (err) {
          console.error('[Web3] Failed to check connection', err);
        }
      }
    };
    checkConnection();

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAddress(accounts[0]);
      } else {
        setAddress(null);
      }
    };

    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  },[]);

  const connect = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      alert('Please install MetaMask, Rabby, or a Web3 wallet extension to continue.');
      return;
    }
    setIsConnecting(true);
    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setAddress(accounts[0]);
      }
    } catch (error) {
      console.error('[Web3] Connection rejected', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    // Note: EIP-1193 doesn't have a true "disconnect" method, so we clear local state.
    setAddress(null);
  };

  return (
    <Web3Context.Provider value={{ address, isConnecting, connect, disconnect }}>
      {children}
    </Web3Context.Provider>
  );
}
