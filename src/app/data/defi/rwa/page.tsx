import ComingSoon from '../../_components/ComingSoon';
export const metadata = { title: 'Real World Assets | CryptoBrainNews' };
export default function RwaPage() {
  return (
    <ComingSoon
      title="Real World Assets (RWA)"
      description="Total RWA TVL by protocol, issuer, blockchain, and asset class"
      dataSource="DefiLlama"
      targetPhase="Phase 42"
    />
  );
}
