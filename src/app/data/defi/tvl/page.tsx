import ComingSoon from '../../_components/ComingSoon';
export const metadata = { title: 'DeFi TVL | CryptoBrainNews' };
export default function TvlPage() {
  return (
    <ComingSoon
      title="Total Value Locked"
      description="TVL by category, blockchain, and project – with liquid staking breakdown"
      dataSource="DefiLlama"
      targetPhase="Phase 42"
    />
  );
}
