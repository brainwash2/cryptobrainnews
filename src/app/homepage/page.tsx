import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import PriceTicker from '@/components/common/PriceTicker';
import Breadcrumb from '@/components/common/Breadcrumb';
import HomepageInteractive from './components/HomepageInteractive';

export const metadata: Metadata = {
  title: 'Homepage - CryptoBrainNews',
  description: 'Stay updated with breaking cryptocurrency news, real-time market data, and comprehensive analysis. Access trending stories, price movements, and expert insights on Bitcoin, Ethereum, and the entire crypto ecosystem.'
};

interface CarouselSlide {
  id: string;
  headline: string;
  summary: string;
  image: string;
  alt: string;
  category: string;
  articleUrl: string;
}

interface NewsArticle {
  id: string;
  thumbnail: string;
  alt: string;
  headline: string;
  excerpt: string;
  category: string;
  timestamp: string;
  articleUrl: string;
}

interface TrendingStory {
  id: string;
  headline: string;
  category: string;
  articleUrl: string;
  isHot: boolean;
}

export default function Homepage() {
  const carouselSlides: CarouselSlide[] = [
  {
    id: '1',
    headline: 'Bitcoin Surges Past $50,000 as Institutional Adoption Accelerates',
    summary: 'Major financial institutions announce increased Bitcoin holdings as the cryptocurrency breaks through key resistance levels, signaling renewed market confidence and potential for further gains.',
    image: "https://images.unsplash.com/photo-1667809339916-b03d67d86ab6",
    alt: 'Golden Bitcoin cryptocurrency coin standing upright on dark reflective surface with blue lighting',
    category: 'MARKETS',
    articleUrl: '/article-reader?id=1'
  },
  {
    id: '2',
    headline: 'Ethereum 2.0 Staking Reaches Historic Milestone with 15 Million ETH Locked',
    summary: 'The Ethereum network celebrates a major achievement as staking participation hits all-time highs, demonstrating strong community commitment to the proof-of-stake consensus mechanism.',
    image: "https://images.unsplash.com/photo-1635237755017-18a7f122a052",
    alt: 'Silver Ethereum cryptocurrency coin with glowing blue holographic network connections in background',
    category: 'DEFI',
    articleUrl: '/article-reader?id=2'
  },
  {
    id: '3',
    headline: 'Solana Network Upgrade Delivers 400% Performance Improvement',
    summary: 'Latest protocol enhancement dramatically increases transaction throughput and reduces latency, positioning Solana as a leading platform for high-frequency DeFi applications and NFT marketplaces.',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1e2cc2138-1764643920948.png",
    alt: 'Purple and teal Solana cryptocurrency logo coin on dark background with digital circuit patterns',
    category: 'TECHNOLOGY',
    articleUrl: '/article-reader?id=3'
  }];


  const newsArticles: NewsArticle[] = [
  {
    id: '4',
    thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_11e633004-1766582070905.png",
    alt: 'Professional trader analyzing multiple cryptocurrency charts on large computer monitors in modern office',
    headline: 'Major Exchange Lists 12 New DeFi Tokens Amid Growing Demand',
    excerpt: 'Leading cryptocurrency exchange expands its offerings with a diverse selection of decentralized finance tokens, providing traders with increased access to emerging protocols and yield farming opportunities.',
    category: 'MARKETS',
    timestamp: '2 hours ago',
    articleUrl: '/article-reader?id=4'
  },
  {
    id: '5',
    thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_10d766c50-1767390926147.png",
    alt: 'Colorful NFT digital artwork collection displayed on tablet screen with cryptocurrency wallet interface',
    headline: 'NFT Market Volume Surges 250% as Blue-Chip Collections Rally',
    excerpt: 'Non-fungible token trading activity reaches new heights with established collections seeing significant price appreciation and increased collector interest across major marketplaces.',
    category: 'NFT',
    timestamp: '4 hours ago',
    articleUrl: '/article-reader?id=5'
  },
  {
    id: '6',
    thumbnail: "https://images.unsplash.com/photo-1667808931296-043b333e6dd8",
    alt: 'Stack of various cryptocurrency coins including Bitcoin and Ethereum on financial chart background',
    headline: 'Central Bank Digital Currency Pilots Expand to 15 Countries',
    excerpt: 'Global central banks accelerate CBDC development programs with new pilot projects launching across Asia, Europe, and Latin America, signaling mainstream adoption of blockchain technology.',
    category: 'REGULATION',
    timestamp: '6 hours ago',
    articleUrl: '/article-reader?id=6'
  },
  {
    id: '7',
    thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1b22e13b5-1765619904097.png",
    alt: 'Businessman in suit holding glowing Bitcoin hologram with financial data visualization in background',
    headline: 'Institutional Bitcoin Holdings Reach $100 Billion Milestone',
    excerpt: 'Corporate treasuries and investment funds continue accumulating Bitcoin as a strategic reserve asset, with total institutional holdings crossing historic threshold amid favorable regulatory developments.',
    category: 'MARKETS',
    timestamp: '8 hours ago',
    articleUrl: '/article-reader?id=7'
  },
  {
    id: '8',
    thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1d0185730-1764681470074.png",
    alt: 'Futuristic DeFi interface showing liquidity pools and yield farming statistics on dark themed dashboard',
    headline: 'DeFi Protocol Launches Revolutionary Cross-Chain Bridge',
    excerpt: 'Innovative decentralized finance platform introduces seamless asset transfer mechanism connecting Ethereum, Binance Smart Chain, and Polygon networks with enhanced security features.',
    category: 'DEFI',
    timestamp: '10 hours ago',
    articleUrl: '/article-reader?id=8'
  },
  {
    id: '9',
    thumbnail: "https://images.unsplash.com/photo-1653483150562-44da148c11ec",
    alt: 'Close-up of Bitcoin coin on laptop keyboard with green candlestick trading chart on screen',
    headline: 'Bitcoin Mining Difficulty Hits All-Time High as Hashrate Soars',
    excerpt: 'Network security reaches unprecedented levels as mining difficulty adjusts upward, reflecting increased computational power dedicated to securing the Bitcoin blockchain.',
    category: 'TECHNOLOGY',
    timestamp: '12 hours ago',
    articleUrl: '/article-reader?id=9'
  },
  {
    id: '10',
    thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_147a8470b-1767236289820.png",
    alt: 'Young professional woman analyzing cryptocurrency market data on multiple screens in modern trading office',
    headline: 'Stablecoin Market Cap Exceeds $150 Billion as Adoption Grows',
    excerpt: 'Dollar-pegged cryptocurrencies see explosive growth driven by increased usage in payments, remittances, and DeFi applications across global markets.',
    category: 'MARKETS',
    timestamp: '14 hours ago',
    articleUrl: '/article-reader?id=10'
  },
  {
    id: '11',
    thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1eb86579d-1768145285505.png",
    alt: 'Ethereum cryptocurrency coin with glowing blue network connections and blockchain nodes visualization',
    headline: 'Layer 2 Solutions Process Record 5 Million Daily Transactions',
    excerpt: 'Ethereum scaling technologies demonstrate massive adoption with Arbitrum and Optimism handling unprecedented transaction volumes while maintaining low fees.',
    category: 'TECHNOLOGY',
    timestamp: '16 hours ago',
    articleUrl: '/article-reader?id=11'
  },
  {
    id: '12',
    thumbnail: "https://images.unsplash.com/photo-1668374212448-05305b065701",
    alt: 'Golden Bitcoin coin balanced on edge with blurred financial charts and graphs in background',
    headline: 'Crypto Hedge Fund Returns Outperform Traditional Markets by 40%',
    excerpt: 'Digital asset investment vehicles deliver exceptional returns as sophisticated trading strategies and market timing capitalize on cryptocurrency volatility.',
    category: 'MARKETS',
    timestamp: '18 hours ago',
    articleUrl: '/article-reader?id=12'
  }];


  const trendingStories: TrendingStory[] = [
  {
    id: 't1',
    headline: 'SEC Approves First Spot Bitcoin ETF Applications',
    category: 'REGULATION',
    articleUrl: '/article-reader?id=t1',
    isHot: true
  },
  {
    id: 't2',
    headline: 'Ethereum Gas Fees Drop to Lowest Levels in 2 Years',
    category: 'TECHNOLOGY',
    articleUrl: '/article-reader?id=t2',
    isHot: true
  },
  {
    id: 't3',
    headline: 'Major Bank Launches Cryptocurrency Custody Service',
    category: 'MARKETS',
    articleUrl: '/article-reader?id=t3',
    isHot: false
  },
  {
    id: 't4',
    headline: 'DeFi TVL Surpasses $200 Billion Across All Protocols',
    category: 'DEFI',
    articleUrl: '/article-reader?id=t4',
    isHot: true
  },
  {
    id: 't5',
    headline: 'Bitcoin Lightning Network Capacity Doubles in Q1',
    category: 'TECHNOLOGY',
    articleUrl: '/article-reader?id=t5',
    isHot: false
  }];


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PriceTicker />
      <div className="pt-4">
        <div className="container mx-auto px-4 lg:px-8">
          <Breadcrumb />
        </div>
        <HomepageInteractive
          carouselSlides={carouselSlides}
          newsArticles={newsArticles}
          trendingStories={trendingStories} />

      </div>
    </div>);
}
