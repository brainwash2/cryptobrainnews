import type { Metadata, Viewport } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';

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
  description: 'Production-grade, edge-cached DeFi intelligence and L402 Lightning compute execution. Built natively for autonomous AI agents and human operators.',
  keywords:['Crypto', 'AI Agents', 'L402', 'Lightning Network', 'DeFi', 'Oracle', 'Airdrops', 'Web3'],
  authors: [{ name: 'CryptoBrain Protocol' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'CryptoBrain | The AI Agent Data Terminal',
    description: 'DeFi intelligence and L402 compute execution built for autonomous AI agents.',
    siteName: 'CryptoBrain',
    images:[{
      url: '/og-image.png', // Assuming you will add an og-image.png to /public later
      width: 1200,
      height: 630,
      alt: 'CryptoBrain Terminal'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CryptoBrain | AI Agent Data Terminal',
    description: 'High-fidelity on-chain analytics and L402 Lightning execution endpoints.',
    creator: '@CryptoBrainNews',
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} scroll-smooth`}>
      <body className="bg-[#050505] text-white min-h-screen flex flex-col antialiased selection:bg-[#FABF2C] selection:text-black">
        <Header />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
