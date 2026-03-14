import ComingSoon from '../../_components/ComingSoon';
export const metadata = { title: 'Social Metrics | CryptoBrainNews' };
export default function AlternativeSocialPage() {
  return (
    <ComingSoon
      title="Social Metrics"
      description="Wikipedia pageviews, YouTube subscriber growth, tweet volume, Reddit activity"
      dataSource="Wikipedia API / Social APIs"
      targetPhase="Phase 43"
    />
  );
}
