import ComingSoon from '../../_components/ComingSoon';
export const metadata = { title: 'DeFi Lending | CryptoBrainNews' };
export default function LendingPage() {
  return (
    <ComingSoon
      title="Lending Markets"
      description="Aave, Compound, MakerDAO – TVL, outstanding debt, rates, liquidations"
      dataSource="DefiLlama"
      targetPhase="Phase 42"
    />
  );
}
