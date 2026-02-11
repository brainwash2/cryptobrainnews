import React from 'react';
import Header from '@/components/common/Header';
import PriceTicker from '@/components/common/PriceTicker';
import { DataSidebar } from './_components/DataSidebar';
import { DataBreadcrumb } from './_components/DataBreadcrumb';

export default function DataLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
      {/* Global Nav */}
      <Header />
      <PriceTicker />

      {/* Terminal Grid */}
      <div className="flex max-w-[2000px] mx-auto border-l border-r border-[#222]">
        {/* Sidebar */}
        <DataSidebar />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 bg-[#050505]">
          <div className="p-6 md:p-8">
            <DataBreadcrumb />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
