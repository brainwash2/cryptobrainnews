import 'server-only';
import { cached } from './cache';

export interface ArbSignal {
  market_id: string;
  market_title: string;
  /**
   * kalshi_implied_probability is null when Kalshi is unavailable (geo-block / network error).
   * Agents MUST check kalshi_unavailable === true before acting on cross-platform spread.
   */
  platforms: {
    polymarket_implied_probability: number;
    kalshi_implied_probability: number | null;
  };
  arbitrage_spread_pct: number;
  recommended_agent_action: string;
  /**
   * execution_confidence === 0.0 means no Kalshi data — do NOT execute cross-platform arb.
   * execution_confidence > 0.0 means both legs have real live prices.
   */
  execution_confidence: number;
  /** True when Kalshi API was unreachable — spread is NOT actionable. */
  kalshi_unavailable: boolean;
}

export async function getLivePredictions(): Promise<ArbSignal[]> {
  return cached('predictions:arbitrage:live', async () => {
    try {
      // 1. Fetch Polymarket (Gamma API — always available)
      const polyRes = await fetch(
        'https://gamma-api.polymarket.com/events?closed=false&limit=50',
        { next: { revalidate: 300 } }
      );
      const polyData = await polyRes.json();

      if (!polyData || !Array.isArray(polyData)) return [];

      // 2. Fetch Kalshi (Trade API v2)
      // Kalshi restricts non-US IPs — treat any failure as a hard unavailability signal.
      let kData: { markets: any[] } = { markets: [] };
      let kalshiAvailable = false;

      try {
        const kalshiRes = await fetch(
          'https://trading-api.kalshi.co/trade-api/v2/markets?limit=50&status=active',
          { next: { revalidate: 300 } }
        );
        if (kalshiRes.ok) {
          kData = await kalshiRes.json();
          kalshiAvailable = Array.isArray(kData.markets) && kData.markets.length > 0;
        } else {
          console.warn('[Predictions] Kalshi API returned non-OK status:', kalshiRes.status);
        }
      } catch (e) {
        console.warn('[Predictions] Kalshi API unreachable (geo-block or network error).');
      }

      const signals: ArbSignal[] = [];

      if (kalshiAvailable) {
        // ── Real cross-platform matching ─────────────────────────────────────
        polyData.forEach((pEvent: any) => {
          const pMarket = pEvent.markets?.[0];
          if (!pMarket) return;

          const pProb = parseFloat(pMarket.outcomePrices?.[0] || '0');
          if (!pProb) return;

          // Keyword match against Kalshi market titles (≥2 significant words)
          const pWords = pEvent.title
            .toLowerCase()
            .split(' ')
            .filter((w: string) => w.length > 4);

          let bestMatch: any = null;
          let maxMatches = 0;

          (kData.markets || []).forEach((kMarket: any) => {
            const kTitle = kMarket.title.toLowerCase();
            const matches = pWords.filter((w: string) => kTitle.includes(w)).length;
            if (matches > maxMatches && matches >= 2) {
              maxMatches = matches;
              bestMatch = kMarket;
            }
          });

          if (bestMatch) {
            const kProb = (bestMatch.yes_bid || 0) / 100; // Kalshi prices in cents
            const spread = Math.abs(pProb - kProb) * 100;

            if (spread > 1.0) {
              signals.push({
                market_id: pEvent.id,
                market_title: pEvent.title,
                platforms: {
                  polymarket_implied_probability: pProb,
                  kalshi_implied_probability: kProb,
                },
                arbitrage_spread_pct: parseFloat(spread.toFixed(2)),
                recommended_agent_action:
                  pProb > kProb
                    ? 'buy_yes_kalshi_sell_yes_polymarket'
                    : 'buy_yes_polymarket_sell_yes_kalshi',
                execution_confidence: spread > 5 ? 0.9 : 0.6,
                kalshi_unavailable: false,
              });
            }
          }
        });
      } else {
        // ── Kalshi unavailable — return Polymarket-only signals ───────────────
        // execution_confidence is explicitly 0.0: agents must not act on
        // cross-platform arbitrage when only one leg has a real price.
        // Phase 45 · C2: synthetic Kalshi offsets removed — was fabricating
        // probabilities from title.length parity with confidence 0.75.
        polyData.slice(0, 10).forEach((p: any) => {
          const pProb = parseFloat(p.markets?.[0]?.outcomePrices?.[0] || '0');
          if (!pProb) return;

          signals.push({
            market_id: p.id,
            market_title: p.title,
            platforms: {
              polymarket_implied_probability: pProb,
              kalshi_implied_probability: null,
            },
            arbitrage_spread_pct: 0,
            recommended_agent_action: 'no_action — kalshi_unavailable',
            execution_confidence: 0.0,
            kalshi_unavailable: true,
          });
        });
      }

      return signals.sort(
        (a, b) => b.arbitrage_spread_pct - a.arbitrage_spread_pct
      );
    } catch (err) {
      console.error('[Predictions] Engine Error:', err);
      return [];
    }
  }, 300);
}
