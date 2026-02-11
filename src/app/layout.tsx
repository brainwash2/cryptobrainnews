import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Merriweather, Inter, JetBrains_Mono, Space_Mono } from 'next/font/google';
import '../styles/globals.css';
import Header from '@/components/common/Header';
import PriceTicker from '@/components/common/PriceTicker';
import Footer from '@/components/layout/Footer';

// Load Fonts Efficiently
const merriweather = Merriweather({ subsets: ['latin'], weight: ['400', '700', '900'], variable: '--font-heading', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-body', display: 'swap' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-caption', display: 'swap' });
const space = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-data', display: 'swap' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export const metadata: Metadata = {
  title: { default: 'CryptoBrainNews', template: '%s | CBN' },
  description: 'Institutional Grade Crypto Intelligence Terminal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${merriweather.variable} ${inter.variable} ${jetbrains.variable} ${space.variable}`}>
      <body className="flex flex-col min-h-screen">
        <Header />
        <PriceTicker />
        <div className="flex-grow">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
