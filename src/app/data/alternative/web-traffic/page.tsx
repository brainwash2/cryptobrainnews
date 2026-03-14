import ComingSoon from '../../_components/ComingSoon';
export const metadata = { title: 'Web Traffic | CryptoBrainNews' };
export default function WebTrafficPage() {
  return (
    <ComingSoon
      title="Web Traffic"
      description="Google Search volumes for Bitcoin, Ethereum, Solana, NFT, and more"
      dataSource="Google Trends"
      targetPhase="Phase 43"
    />
  );
}
