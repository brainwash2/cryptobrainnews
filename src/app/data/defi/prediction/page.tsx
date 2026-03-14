import ComingSoon from '../../_components/ComingSoon';
export const metadata = { title: 'Prediction Markets | CryptoBrainNews' };
export default function PredictionPage() {
  return (
    <ComingSoon
      title="Prediction Markets"
      description="Polymarket & Kalshi – volume, OI, active traders, market share"
      dataSource="Polymarket Gamma API / Kalshi API"
      targetPhase="Phase 42"
    />
  );
}
