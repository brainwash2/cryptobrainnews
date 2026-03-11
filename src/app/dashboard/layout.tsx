import React from 'react';
import { Web3Provider } from '@/components/providers/Web3Provider';

export const metadata = {
  title: 'Operator Dashboard | CryptoBrain',
  description: 'Manage your AI agents and execution analytics.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Web3Provider>
      {children}
    </Web3Provider>
  );
}
