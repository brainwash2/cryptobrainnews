import React, { Suspense } from 'react';
import DataSidebar from './_components/DataSidebar';
import { DataBreadcrumb } from './_components/DataBreadcrumb';

// Restored `force-dynamic` to prevent build crashes from Upstash Redis `no-store` fetches
export const dynamic = 'force-dynamic';

export default function DataLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#050505]">
      <DataSidebar />
      <main className="flex-1 pl-0 lg:pl-72">
        <div className="max-w-[1600px] mx-auto px-6 py-10">
          <DataBreadcrumb />
          {children}
        </div>
      </main>
    </div>
  );
}
