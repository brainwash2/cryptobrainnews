'use client';
import React from 'react';

export function DataHeader({
  title,
  description,
  filters,
}: {
  title: string;
  description?: string;
  filters?: React.ReactNode;
}) {
  return (
    <div className="mb-10 space-y-6">
      <div>
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter font-heading">
          {title}
        </h1>
        {description && (
          <p className="text-[#555] font-mono text-[10px] uppercase tracking-[0.3em] mt-2">
            {description}
          </p>
        )}
      </div>
      {filters && <div className="flex flex-wrap gap-3">{filters}</div>}
    </div>
  );
}
