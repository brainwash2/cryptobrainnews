import ComingSoon from '../../_components/ComingSoon';
export const metadata = { title: 'DeFi Derivatives | CryptoBrainNews' };
export default function DerivativesPage() {
  return (
    <ComingSoon
      title="DeFi Derivatives"
      description="Hyperliquid, dYdX, GMX – volume, open interest, liquidations"
      dataSource="DefiLlama / Hyperliquid API"
      targetPhase="Phase 42"
    />
  );
}
