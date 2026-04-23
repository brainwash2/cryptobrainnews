/**
 * lib/monetisation/affiliate.ts
 * Affiliate link injection for article footers and inline content.
 *
 * Strategy:
 *   1. Category-aware link selection:
 *      Bitcoin/On-chain → Ledger Hardware Wallet
 *      Trading/Markets  → Bybit, Binance
 *      DeFi             → Ledger, Bybit
 *      All              → Ledger as default fallback
 *
 *   2. Ticker-aware inline injection:
 *      If article body mentions BTC, ETH, etc., inject a soft CTA
 *      ("Trade BTC on Bybit →") near first mention — NOT aggressive.
 *
 *   3. Footer block:
 *      Up to 2 contextually relevant affiliate cards rendered at
 *      article bottom. Never more than 2 (avoids spam signal for SEO).
 *
 *   4. Disclosure:
 *      Required FTC/ASA disclosure injected automatically.
 *
 * Affiliate programmes supported:
 *   Ledger    — https://shop.ledger.com (affiliate param: r=<id>)
 *   Binance   — https://www.binance.com/en/activity/referral (ref=<id>)
 *   Bybit     — https://www.bybit.com/en (affiliate_id=<id>)
 *
 * All links are:
 *   - rel="nofollow noopener sponsored" (required for SEO compliance)
 *   - target="_blank"
 *   - Marked with data-affiliate="true" for analytics tracking
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AffiliatePartner {
  id:           string;
  name:         string;
  description:  string; // Short CTA copy
  url:          string; // Full affiliate URL with tracking param
  logo:         string; // Path to logo in /public/affiliates/
  categories:   string[]; // Which article categories this partner suits
  tickers:      string[]; // Which tickers trigger inline CTA
  cta:          string;   // Button text: "Get Ledger →"
  badgeText?:   string;   // Optional badge: "10% off", "Recommended"
}

export interface AffiliateCard {
  partner:     AffiliatePartner;
  position:    'footer' | 'inline';
  triggerText?: string; // The ticker/keyword that triggered inline injection
}

export interface AffiliateInjectionResult {
  footerCards:   AffiliateCard[];
  inlineCards:   AffiliateCard[];
  disclosureHtml:string;
}

// ─── Partner registry ─────────────────────────────────────────────────────────

const LEDGER_REF  = process.env.AFFILIATE_LEDGER_REF   ?? '';
const BINANCE_REF = process.env.AFFILIATE_BINANCE_REF  ?? '';
const BYBIT_REF   = process.env.AFFILIATE_BYBIT_REF    ?? '';

const PARTNERS: AffiliatePartner[] = [
  {
    id:          'ledger',
    name:        'Ledger',
    description: 'The most trusted hardware wallet. Keep your crypto offline.',
    url:         `https://shop.ledger.com/pages/referral-program?r=${LEDGER_REF}`,
    logo:        '/affiliates/ledger.svg',
    categories:  ['Bitcoin', 'Ethereum', 'DeFi', 'Security', 'Altcoins', 'Markets'],
    tickers:     ['BTC', 'ETH', 'SOL', 'BNB'],
    cta:         'Get Ledger →',
    badgeText:   'Recommended',
  },
  {
    id:          'bybit',
    name:        'Bybit',
    description: 'Trade crypto with up to 100x leverage and industry-low fees.',
    url:         `https://www.bybit.com/en/invite?affiliate_id=${BYBIT_REF}`,
    logo:        '/affiliates/bybit.svg',
    categories:  ['Markets', 'Trading', 'DeFi', 'Bitcoin', 'Altcoins'],
    tickers:     ['BTC', 'ETH', 'SOL', 'DOGE', 'XRP'],
    cta:         'Trade on Bybit →',
    badgeText:   'Low Fees',
  },
  {
    id:          'binance',
    name:        'Binance',
    description: "World's largest crypto exchange by volume.",
    url:         `https://www.binance.com/en/activity/referral-entry?ref=${BINANCE_REF}`,
    logo:        '/affiliates/binance.svg',
    categories:  ['Markets', 'Altcoins', 'Bitcoin', 'DeFi'],
    tickers:     ['BNB', 'BTC', 'ETH'],
    cta:         'Trade on Binance →',
  },
];

const DISCLOSURE_HTML = `<aside class="affiliate-disclosure" aria-label="Affiliate disclosure">
  <p><strong>Disclosure:</strong> This article contains affiliate links. If you click and make a purchase,
  CryptoBrainNews may earn a commission at no extra cost to you.
  We only recommend services we believe in. <a href="/affiliate-disclosure">Learn more</a>.</p>
</aside>`;

// ─── Injector ─────────────────────────────────────────────────────────────────

export class AffiliateInjector {
  /**
   * Determine which affiliate cards to inject for an article.
   * Pure function — no side effects, no network calls.
   *
   * @param category    Article category (e.g. 'Bitcoin')
   * @param tickers     Tickers mentioned in the article (e.g. ['BTC', 'ETH'])
   * @param tags        Article tags for additional matching
   * @returns Injection result with footer cards, inline cards, and disclosure HTML
   */
  inject(
    category:  string,
    tickers:   string[],
    tags:      string[],
  ): AffiliateInjectionResult {
    // ── Footer cards: max 2, category-matched, deduped ──────────────────────
    const footerMatches = PARTNERS.filter(
      (p) =>
        p.categories.some(
          (c) => c.toLowerCase() === category.toLowerCase() ||
                 tags.some((t) => t.toLowerCase().includes(c.toLowerCase())),
        ),
    );

    // Fallback: if no category match, use first two partners
    const footerPartners = footerMatches.length > 0
      ? footerMatches.slice(0, 2)
      : PARTNERS.slice(0, 2);

    const footerCards: AffiliateCard[] = footerPartners.map((p) => ({
      partner:  p,
      position: 'footer',
    }));

    // ── Inline cards: ticker-triggered, max 1 per article ────────────────────
    const inlineCards: AffiliateCard[] = [];
    const upperTickers = tickers.map((t) => t.toUpperCase());

    for (const partner of PARTNERS) {
      const matchedTicker = partner.tickers.find((t) => upperTickers.includes(t));
      if (matchedTicker) {
        inlineCards.push({
          partner,
          position:    'inline',
          triggerText: matchedTicker,
        });
        break; // Only 1 inline card per article
      }
    }

    return {
      footerCards,
      inlineCards,
      disclosureHtml: (footerCards.length + inlineCards.length) > 0
        ? DISCLOSURE_HTML
        : '',
    };
  }

  /**
   * Build a rel-safe affiliate anchor tag string.
   * Use in server components and email templates.
   */
  static buildLink(partner: AffiliatePartner, label?: string): string {
    const text = label ?? partner.cta;
    return (
      `<a href="${partner.url}" ` +
      `rel="nofollow noopener sponsored" ` +
      `target="_blank" ` +
      `data-affiliate="true" ` +
      `data-partner="${partner.id}">` +
      `${text}</a>`
    );
  }

  /** Get a partner by id (for direct use in pipeline scripts). */
  static getPartner(id: string): AffiliatePartner | undefined {
    return PARTNERS.find((p) => p.id === id);
  }

  static get all(): AffiliatePartner[] {
    return PARTNERS;
  }
}
