'use client';

export default function HomepageError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <p className="text-red-500 font-mono text-xs tracking-widest uppercase mb-4">
          NEWS FEED ERROR
        </p>
        <button
          onClick={reset}
          className="bg-primary text-black font-black text-xs px-6 py-3 uppercase tracking-widest hover:bg-white transition-colors"
        >
          RETRY
        </button>
      </div>
    </div>
  );
}
