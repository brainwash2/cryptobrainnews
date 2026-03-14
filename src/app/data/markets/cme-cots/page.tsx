import ComingSoon from '../../_components/ComingSoon';
export const metadata = { title: 'CME COTs | CryptoBrainNews' };
export default function CmeCotsPage() {
  return (
    <ComingSoon
      title="CME Commitments of Traders"
      description="Institutional positioning data – Managed Money, Swap Dealers, Other Reportables"
      dataSource="CFTC / CME"
      targetPhase="Phase 38"
    />
  );
}
