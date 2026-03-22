import ComingSoon from '../../_components/ComingSoon';

export const metadata = {
  title: 'USD Stablecoins | CryptoBrainNews',
  description: 'Daily transaction volumes and transfer counts for major USD-pegged stablecoins.',
};

export default function StablecoinsUsdPage() {
  return (
    <ComingSoon
      title="USD Stablecoins"
      description="Daily transaction volumes and transfer counts for major USD-pegged stablecoins."
      dataSource="DefiLlama / Dune Analytics"
      targetPhase="Phase 45 — Replace with DefiLlama historical data or Dune if restored"
    />
  );
}
