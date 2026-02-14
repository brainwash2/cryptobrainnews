'use client';

export default function WhaleWatchError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 border border-[#1a1a1a] bg-[#0a0a0a]">
      <div className="text-4xl mb-4">🐋</div>
      <h3 className="text-xl font-bold font-heading text-white mb-2">
        Data Stream Interrupted
      </h3>
      <p className="text-sm text-[#666] font-mono mb-6 max-w-md">
        The on-chain feed is currently unresponsive. This is often due to Dune Analytics rate limits or timeouts.
      </p>
      <button
        onClick={reset}
        className="bg-primary text-black font-black text-xs px-6 py-3 uppercase tracking-widest hover:bg-white transition-colors"
      >
        Retry Connection
      </button>
    </div>
  );
}
