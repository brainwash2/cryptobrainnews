import ComingSoon from '../../_components/ComingSoon';
export const metadata = { title: 'Crypto Prices | CryptoBrainNews' };
export default function PricesPage() {
  return (
    <ComingSoon
      title="Prices & Market Health"
      description="Total market cap, dominance, Fear & Greed Index, performance tables"
      dataSource="CoinGecko / DefiLlama"
      targetPhase="Phase 38"
    />
  );
}
