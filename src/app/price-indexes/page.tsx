import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import PriceTicker from '@/components/common/PriceTicker';
import Breadcrumb from '@/components/common/Breadcrumb';
import PriceIndexesInteractive from './components/PriceIndexesInteractive';

export const metadata: Metadata = {
  title: 'Price Indexes - CryptoBrainNews',
  description: 'Top 100 Cryptocurrencies by Market Cap',
};

export default function PriceIndexesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PriceTicker />
      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          <Breadcrumb />
          <PriceIndexesInteractive />
        </div>
      </main>
    </div>
  );
}
