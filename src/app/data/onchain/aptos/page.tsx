import ComingSoon from '../../_components/ComingSoon';
export const metadata = { title: 'Aptos On-Chain | CryptoBrainNews' };
export default function AptosPage() {
  return (
    <ComingSoon
      title="Aptos On-Chain"
      description="User transactions, active addresses, fees, blocks – daily and 7DMA"
      dataSource="Dune Analytics"
      targetPhase="Phase 40"
    />
  );
}
