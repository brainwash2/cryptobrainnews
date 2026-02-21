import React, { Suspense } from 'react';
import { DataSidebar } from './_components/DataSidebar';
import { DataBreadcrumb } from './_components/DataBreadcrumb';

export const metadata = {
  title: 'Data Terminal | CryptoBrainNews',
  description: 'Institutional-grade on-chain data, DeFi analytics, and market intelligence.',
};

export default function DataTerminalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex max-w-[2000px] mx-auto border-x border-[#1a1a1a] min-h-screen">
      <DataSidebar />
      <main className="flex-1 min-w-0 bg-[#050505] p-4 sm:p-6 lg:p-10">
        <DataBreadcrumb />
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-64">
              <span className="text-primary font-mono text-xs animate-pulse uppercase tracking-[0.3em]">
                Loading terminal data...
              </span>
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
    </div>
  );
}
