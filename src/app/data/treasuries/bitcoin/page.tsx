import ComingSoon from '../../_components/ComingSoon';
export const metadata = { title: 'Bitcoin Treasuries | CryptoBrainNews' };
export default function BitcoinTreasuriesPage() {
  return (
    <ComingSoon
      title="Bitcoin Treasuries"
      description="Corporate BTC holdings, market caps, premium/discount to NAV"
      dataSource="CoinGecko / DefiLlama"
      targetPhase="Phase 39"
    />
  );
}
