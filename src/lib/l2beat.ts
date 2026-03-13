import 'server-only';
import { cached } from './cache';
import { fetchWithTimeout } from './fetch-with-timeout';
import type { L2ScalingData } from './types';

// Uses DefiLlama chains endpoint as a highly reliable baseline for L2 TVL data
export async function getL2ScalingData(): Promise<L2ScalingData[]> {
  return cached('l2:scaling:summary', async () => {
    try {
      const res = await fetchWithTimeout('https://api.llama.fi/v2/chains', { cache: 'no-store' });
      if (!res.ok) return[];
      const data = await res.json();
      
      const rollups =['Arbitrum', 'Optimism', 'Base', 'ZkSync Era', 'Starknet', 'Linea', 'Scroll', 'Mantle', 'Blast'];
      
      return data
        .filter((c: any) => rollups.includes(c.name))
        .map((c: any) => ({
          name: c.name,
          tvl: c.tvl || 0,
        }))
        .sort((a: any, b: any) => b.tvl - a.tvl);
    } catch {
      return[];
    }
  }, 3600); // 1 hour cache
}
