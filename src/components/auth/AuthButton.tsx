'use client';

import React from 'react';

export default function AuthButton() {
  return (
    <div className="flex items-center gap-4">
      <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-[0.2em] border border-[#27272a] px-2 py-1">
        Auth Disabled
      </span>
    </div>
  );
}