import 'server-only';
import { cached } from './cache';
import { fetchWithTimeout } from './fetch-with-timeout';
import type { L2ScalingData } from './types';

export async function getL2ScalingData(): Promise<L2ScalingData[]> {
  return cached('l2:scaling:summary', async () => {
    try {
      const res = await fetchWithTimeout('https://api.llama.fi/v2/chains', { cache: 'no-store' });
      if (!res.ok) return[];
      const data = await res.json();
      
      const rollups =['Arbitrum', 'Optimism', 'Base', 'ZkSync Era', 'Starknet', 'Linea', 'Scroll', 'Mantle', 'Blast'];
      
      return rollups.map(name => {
        // Handle name mismatches gracefully
        const chain = data.find((c: any) => c.name.toLowerCase() === name.toLowerCase());
        return {
          name,
          tvl: chain && chain.tvl > 0 ? chain.tvl : null, // Set to null if 0 or missing
        };
      }).sort((a: any, b: any) => (b.tvl || 0) - (a.tvl || 0));
    } catch {
      return[];
    }
  }, 3600); // 1 hour cache
}
