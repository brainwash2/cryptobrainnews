import ComingSoon from '../../_components/ComingSoon';
export const metadata = { title: 'Crypto Politics | CryptoBrainNews' };
export default function PoliticsPage() {
  return (
    <ComingSoon
      title="Politics"
      description="Crypto PAC fundraising, spending per committee, election cycles"
      dataSource="FEC Public Data"
      targetPhase="Phase 43"
    />
  );
}
