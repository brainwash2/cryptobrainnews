import type { Metadata } from 'next';
import Breadcrumb from '@/components/common/Breadcrumb';
import PriceIndexesInteractive from './components/PriceIndexesInteractive';

export const metadata = {
  title: 'Price Indexes - CryptoBrainNews',
  description: 'Top 100 Cryptocurrencies by Market Cap',
};

export default function PriceIndexesPage() {
  return (
    <main className="pt-4">
      <div className="container mx-auto px-4 lg:px-8">
        <Breadcrumb />
        <PriceIndexesInteractive />
      </div>
    </main>
  );
}
