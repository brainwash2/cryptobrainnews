'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="text-red-500 font-mono text-xs tracking-[0.3em] mb-4 uppercase">
        Terminal Error
      </div>
      <h2 className="text-2xl font-black text-white uppercase mb-2">
        Something Went Wrong
      </h2>
      <p className="text-[#555] font-mono text-xs mb-8 max-w-md">
        The data pipeline encountered an unexpected error. Our team has been notified.
      </p>
      <button
        onClick={reset}
        className="bg-[#FABF2C] text-black font-black text-xs px-8 py-3 uppercase tracking-widest hover:bg-white transition-colors"
      >
        Retry
      </button>
    </div>
  );
}
