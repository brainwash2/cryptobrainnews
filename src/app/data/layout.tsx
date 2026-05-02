import React, { Suspense } from 'react';
import DataSidebar          from './_components/DataSidebar';
import { DataBreadcrumb }   from './_components/DataBreadcrumb';
import { FreshnessBadge }   from '@/components/common/FreshnessBadge';

// Keep force-dynamic to prevent Upstash Redis no-store build errors
export const dynamic = 'force-dynamic';

export default function DataLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#050505]">
      {/* Fixed sidebar – 288px (w-72) */}
      <DataSidebar />

      {/* Main content – offset by sidebar width on large screens */}
      <main className="flex-1 lg:pl-72 min-w-0">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-2">
            <DataBreadcrumb />
            <FreshnessBadge ttlSeconds={300} />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
