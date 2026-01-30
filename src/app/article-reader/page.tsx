import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import PriceTicker from '@/components/common/PriceTicker';
import Breadcrumb from '@/components/common/Breadcrumb';
import ArticleReaderInteractive from './components/ArticleReaderInteractive';

export const metadata: Metadata = {
  title: 'Bitcoin Reaches New All-Time High - CryptoBrainNews',
};

export default function ArticleReaderPage() {
  // In a real app, we would fetch(props.params.id) here
  // For now, we use the static mock article you provided
  const mockArticle = {
    title: "Bitcoin Reaches New All-Time High Above $50,000",
    publishedDate: "2026-01-28",
    author: { name: "Michael Chen", avatar: "", alt: "Analyst" },
    category: "Markets",
    readTime: 8,
    content: [
      { type: 'paragraph', text: "Bitcoin has shattered previous records by surging past the $50,000 mark..." },
      { type: 'heading', level: 2, text: "Institutional Adoption Drives Price Surge" },
      { type: 'paragraph', text: "The recent price rally can be attributed to several key factors..." }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PriceTicker />
      <main className="pt-8 pb-16 container mx-auto px-4">
        <Breadcrumb />
        <ArticleReaderInteractive article={mockArticle} relatedArticles={[]} trendingStories={[]} currentUrl="https://example.com" />
      </main>
    </div>
  );
}
