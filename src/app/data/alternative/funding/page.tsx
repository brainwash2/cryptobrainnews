import ComingSoon from '../../_components/ComingSoon';
export const metadata = { title: 'Venture Funding | CryptoBrainNews' };
export default function FundingPage() {
  return (
    <ComingSoon
      title="Venture Funding"
      description="Monthly & quarterly crypto VC deals, funding rounds, and category breakdown"
      dataSource="RootData / Public Filings"
      targetPhase="Phase 43"
    />
  );
}
