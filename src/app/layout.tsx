import type { Metadata, Viewport } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import '@/styles/globals.css';
import Header from '@/components/layout/Header';
import PriceTicker from '@/components/common/PriceTicker';
import NewsletterPopup from '@/components/monetization/NewsletterPopup';
 
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = Roboto_Mono({ subsets: ['latin'], variable: '--font-mono' });
 
export const viewport: Viewport = {
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};
 
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cryptobrainnews.vercel.app'),
  title: {
    default: 'CryptoBrain | The AI Agent Data Terminal',
    template: '%s | CryptoBrain'
  },
  description: 'Production-grade, edge-cached DeFi intelligence and L402 Lightning compute execution.',
  keywords: ['Crypto', 'AI Agents', 'L402', 'Lightning Network', 'DeFi', 'Oracle', 'Airdrops', 'Web3'],
  authors: [{ name: 'CryptoBrain Protocol' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'CryptoBrain | The AI Agent Data Terminal',
    description: 'DeFi intelligence and L402 compute execution built for autonomous AI agents.',
    siteName: 'CryptoBrain',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'CryptoBrain Terminal' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CryptoBrain | AI Agent Data Terminal',
    description: 'High-fidelity on-chain analytics and L402 Lightning execution endpoints.',
    creator: '@CryptoBrainNews',
  },
  robots: { index: true, follow: true },
};
 
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} scroll-smooth`}>
      <body className="bg-[#050505] text-white min-h-screen flex flex-col antialiased selection:bg-[#FABF2C] selection:text-black">
 
        {/*
          KEY FIX: Header + PriceTicker wrapped in ONE sticky container.
          This creates a single stacking context so the dropdown (z-[300])
          always renders above the ticker. Previously they were siblings
          and the ticker painted over the dropdown.
        */}
        <div className="sticky top-0 z-[200]">
          <Header />
          <PriceTicker />
        </div>
 
        <main className="flex-1">
          {children}
        </main>
 
        <NewsletterPopup />
      </body>
    </html>
  );
}
