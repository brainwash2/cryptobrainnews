import ComingSoon from '../../_components/ComingSoon';

export const metadata = {
  title: 'Stablecoins by Chain | CryptoBrainNews',
  description: 'Stablecoin holder distribution and supply by blockchain.',
};

export default function StablecoinsChainsPage() {
  return (
    <ComingSoon
      title="Stablecoins by Chain"
      description="Holder distribution, supply, and activity per blockchain"
      dataSource="DefiLlama / Dune Analytics"
      targetPhase="Phase 45 — Replace with live data from DefiLlama or other free source"
    />
  );
}
