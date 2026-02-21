import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { Merriweather, Inter, JetBrains_Mono, Space_Mono } from 'next/font/google';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '../styles/globals.css';
import Header from '@/components/common/Header';
import PriceTicker from '@/components/common/PriceTicker';
import Footer from '@/components/layout/Footer';
import CookieConsent from '@/components/common/CookieConsent';

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-heading',
  display: 'swap',
});
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-body',
  display: 'swap',
});
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-caption',
  display: 'swap',
});
const space = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-data',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'CryptoBrainNews | Institutional Terminal',
    template: '%s | CryptoBrainNews',
  },
  description: 'Institutional-grade crypto intelligence, DeFi analytics, and on-chain data.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cryptobrainnews.com'),
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    siteName: 'CryptoBrainNews',
    title: 'CryptoBrainNews | Institutional Terminal',
    description: 'Institutional-grade crypto intelligence.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CryptoBrainNews',
    description: 'Institutional-grade crypto intelligence.',
  },
  alternates: {
    types: { 'application/rss+xml': '/feed.xml' },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${merriweather.variable} ${inter.variable} ${jetbrains.variable} ${space.variable}`}
    >
      <body className="bg-black text-white min-h-screen flex flex-col antialiased">
        <Header />
        <PriceTicker />
        <main className="flex-grow pt-[calc(4rem+2.5rem)]">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-[50vh]">
                <div className="text-[#FABF2C] font-mono text-xs animate-pulse uppercase tracking-[0.3em]">
                  SYNCING DATA...
                </div>
              </div>
            }
          >
            {children}
          </Suspense>
        </main>
        <Footer />
        <CookieConsent />

        {/* Vercel Analytics */}
        <Analytics />
        <SpeedInsights />

        {/* Microsoft Clarity */}
        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <Script
            id="microsoft-clarity"
            strategy="afterInteractive"
          >{`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window,document,"clarity","script","${process.env.NEXT_PUBLIC_CLARITY_ID}");
          `}</Script>
        )}
      </body>
    </html>
  );
}
