import ComingSoon from '../../_components/ComingSoon';
export const metadata = { title: 'Avalanche On-Chain | CryptoBrainNews' };
export default function AvalanchePage() {
  return (
    <ComingSoon
      title="Avalanche On-Chain"
      description="C-Chain active addresses, transactions, fees, subnet metrics"
      dataSource="Dune Analytics"
      targetPhase="Phase 40"
    />
  );
}
