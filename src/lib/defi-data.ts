import { cached } from '@/lib/cache';
// Extend src/lib/defi-data.ts — append this function to the existing file
// Add the following interface and function to src/lib/defi-data.ts:

export interface TokenUnlock {
  token: string;
  amount: number;
  amountUsd: number;
  pctOfSupply: number | null;
  unlockDate: string;
}

export async function getNextUnlocks(): Promise<TokenUnlock[]> {
  return cached('defi:unlocks:next', async () => {
    try {
      const res = await fetch('https://api.llama.fi/unlocks', {
        next: { revalidate: 86400 },
      });
      if (!res.ok) return [];
      const data = await res.json() as {
        data?: Array<{
          name: string;
          date: number;
          amount: number;
          amountUsd: number;
          supply: number;
        }>;
      };
      if (!data.data) return [];
      return data.data
        .filter((u) => u.date * 1000 >= Date.now())
        .map((u) => ({
          token: u.name,
          amount: u.amount ?? 0,
          amountUsd: u.amountUsd ?? 0,
          pctOfSupply: u.supply > 0 ? (u.amount / u.supply) * 100 : null,
          unlockDate: new Date(u.date * 1000).toISOString().slice(0, 10),
        }))
        .sort((a, b) => a.unlockDate.localeCompare(b.unlockDate));
    } catch {
      return [];
    }
  }, 86400);
}