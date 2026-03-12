'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SiweMessage, generateNonce } from 'siwe';
import { getAddress } from 'ethers';

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
      // 1. Get lowercase address from MetaMask
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      const rawAddress = accounts[0];
      
      // 2. Force strict EIP-55 Checksum formatting for SIWE
      const checksummedAddress = getAddress(rawAddress);
      
      console.log('[Web3] Raw MetaMask Address:', rawAddress);
      console.log('[Web3] EIP-55 Checksummed Address:', checksummedAddress);

      // 3. Create SIWE Message
      const domain = window.location.host;
      const origin = window.location.origin;
      const statement = 'Sign in to the CryptoBrain Operator Dashboard.';
      const nonce = generateNonce(); // Secure SIWE nonce

      const message = new SiweMessage({
        domain,
        address: checksummedAddress, // Must be mixed-case checksum
        statement,
        uri: origin,
        version: '1',
        chainId: 1,
        nonce
      });
      
      const preparedMessage = message.prepareMessage();

      // 4. Request Signature (Using raw address for RPC compatibility)
      const sig = await (window as any).ethereum.request({
        method: 'personal_sign',
        params: [preparedMessage, rawAddress]
      });

      // 5. Store in State
      setAddress(checksummedAddress);
      setSiweMessage(preparedMessage);
      setSignature(sig);

    } catch (error) {
      console.error('[Web3] Connection or Signature rejected:', error);
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
