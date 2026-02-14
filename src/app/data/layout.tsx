import React from 'react';
import { DataSidebar } from './_components/DataSidebar';
import { DataBreadcrumb } from './_components/DataBreadcrumb';

export default function DataTerminalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex max-w-[2000px] mx-auto border-x border-[#1a1a1a] min-h-screen">
      <DataSidebar />
      <main className="flex-1 min-w-0 bg-[#050505] p-6 lg:p-10">
        <DataBreadcrumb />
        {children}
      </main>
    </div>
  );
}
