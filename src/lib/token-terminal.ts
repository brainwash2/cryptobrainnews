// src/lib/token-terminal.ts   
// Token Terminal — protocol revenue, P/E ratios, annualised fees
// Sign‑up: tokenterminal.com → free account → API key
// Free tier: 200 requests/month
import 'server-only';
import { cached } from '@/lib/cache';

const TT_API = 'https://api.tokenterminal.com/v1';
const API_KEY = process.env.TOKEN_TERMINAL_API_KEY;

interface TTProject {
  id: string;
  name: string;
  slug: string;
  category: string;
}

interface TTMetric {
  projectId: string;
  metricId: string;
  value: number | null;
  timestamp: string;
}

interface TTResponse<T> {
  data: T[];
}

async function ttFetch<T>(path: string, fallback: T): Promise<T> {
  if (!API_KEY) {
    console.warn('[TokenTerminal] TOKEN_TERMINAL_API_KEY not set');
    return fallback;
  }
  try {
    const res = await fetch(`${TT_API}${path}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export interface TTProtocolRevenue {
  name: string;
  revenue24h: number | null;
  revenueAnnualised: number | null;
  feesAnnualised: number | null;
  peRatio: number | null;
  category: string;
}

export async function getProtocolRevenue(): Promise<TTProtocolRevenue[]> {
  return cached('token-terminal:revenue', async () => {
    const projects = await ttFetch<TTResponse<TTProject>>(
      '/projects?limit=50',
      { data: [] },
    );

    if (projects.data.length === 0) return [];

    const results: TTProtocolRevenue[] = [];
    const metrics = ['revenue', 'revenue_annualized', 'fees_annualized', 'pe_ratio'];

    for (const project of projects.data.slice(0, 25)) {
      try {
        const metricData = await ttFetch<TTResponse<TTMetric>>(
          `/metrics?project_ids=${project.id}&metric_ids=${metrics.join(',')}`,
          { data: [] },
        );

        const getMetric = (id: string): number | null => {
          const m = metricData.data.find((d) => d.metricId === id);
          return m?.value ?? null;
        };

        results.push({
          name: project.name,
          revenue24h: getMetric('revenue'),
          revenueAnnualised: getMetric('revenue_annualized'),
          feesAnnualised: getMetric('fees_annualized'),
          peRatio: getMetric('pe_ratio'),
          category: project.category ?? '—',
        });
      } catch {
        results.push({
          name: project.name,
          revenue24h: null,
          revenueAnnualised: null,
          feesAnnualised: null,
          peRatio: null,
          category: project.category ?? '—',
        });
      }
    }

    return results.filter((r) => r.revenue24h !== null || r.revenueAnnualised !== null);
  }, 86400);
}
