import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import PriceTicker from '@/components/common/PriceTicker';
import Breadcrumb from '@/components/common/Breadcrumb';
import MarketsInteractive from './components/MarketsInteractive';

export const metadata: Metadata = {
  title: 'Markets Overview - CryptoBrainNews',
  description: 'Comprehensive cryptocurrency trading data visualization with real-time spot markets, futures markets, and ETF flows analysis.',
};

export default function MarketsOverviewPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PriceTicker />
      <div className="pt-4">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb />
          <div className="py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground font-heading mb-4">
                Markets <span className="text-primary">Overview</span>
              </h1>
              <p className="text-lg text-muted-foreground font-caption">
                Real-time cryptocurrency trading data, market analysis, and comprehensive insights across spot, futures, and ETF markets.
              </p>
            </div>
            <MarketsInteractive />
          </div>
        </div>
      </div>
    </div>
  );
}
