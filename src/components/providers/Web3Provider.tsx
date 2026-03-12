'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SiweMessage } from 'siwe';

type Web3ContextType = {
  address: string | null;
  signature: string | null;
  siweMessage: string | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const Web3Context = createContext<Web3ContextType>({
  address: null,
  signature: null,
  siweMessage: null,
  isConnecting: false,
  connect: async () => {},
  disconnect: () => {},
});

export const useWeb3 = () => useContext(Web3Context);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [siweMessage, setSiweMessage] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      // If the user changes accounts in MetaMask, force them to re-sign
      setAddress(null);
      setSignature(null);
      setSiweMessage(null);
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
      const walletAddress = accounts[0];

      // 1. Create SIWE Message
      const domain = window.location.host;
      const origin = window.location.origin;
      const statement = 'Sign in to the CryptoBrain Operator Dashboard.';
      const nonce = Math.random().toString(36).substring(2, 15); // Stateless nonce

      const message = new SiweMessage({
        domain,
        address: walletAddress,
        statement,
        uri: origin,
        version: '1',
        chainId: 1,
        nonce
      });
      const preparedMessage = message.prepareMessage();

      // 2. Request Cryptographic Signature
      const sig = await (window as any).ethereum.request({
        method: 'personal_sign',
        params: [preparedMessage, walletAddress]
      });

      // 3. Store in State
      setAddress(walletAddress);
      setSiweMessage(preparedMessage);
      setSignature(sig);

    } catch (error) {
      console.error('[Web3] Connection or Signature rejected', error);
      disconnect();
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setSignature(null);
    setSiweMessage(null);
  };

  return (
    <Web3Context.Provider value={{ address, signature, siweMessage, isConnecting, connect, disconnect }}>
      {children}
    </Web3Context.Provider>
  );
}
