import ComingSoon from '../../_components/ComingSoon';
export const metadata = { title: 'L1 EVM Chains | CryptoBrainNews' };
export default function L1EvmPage() {
  return (
    <ComingSoon
      title="Layer 1: EVM Blockchains"
      description="Daily new addresses and transaction counts for EVM-compatible chains"
      dataSource="DefiLlama / Dune Analytics"
      targetPhase="Phase 41"
    />
  );
}
