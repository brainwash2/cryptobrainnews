import ComingSoon from '../../_components/ComingSoon';
export const metadata = { title: 'Ethereum Treasuries | CryptoBrainNews' };
export default function EthereumTreasuriesPage() {
  return (
    <ComingSoon
      title="Ethereum Treasuries"
      description="Corporate ETH holdings, market caps, premium/discount to NAV"
      dataSource="CoinGecko / DefiLlama"
      targetPhase="Phase 39"
    />
  );
}
