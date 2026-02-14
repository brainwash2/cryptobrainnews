import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { Merriweather, Inter, JetBrains_Mono, Space_Mono } from 'next/font/google';
import '../styles/globals.css';
import Header from '@/components/common/Header';
import PriceTicker from '@/components/common/PriceTicker';
import Footer from '@/components/layout/Footer';

const merriweather = Merriweather({ subsets: ['latin'], weight: ['400', '700', '900'], variable: '--font-heading', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-body', display: 'swap' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-caption', display: 'swap' });
const space = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-data', display: 'swap' });

export const metadata: Metadata = { 
  title: 'CryptoBrainNews | Institutional Terminal',
  description: 'Institutional-grade crypto intelligence.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${merriweather.variable} ${inter.variable} ${jetbrains.variable} ${space.variable}`}>
      <body className="bg-black text-white min-h-screen flex flex-col antialiased">
        <Header />
        <PriceTicker />
        <main className="flex-grow pt-[calc(4rem+2.5rem)]">
          <Suspense fallback={
            <div className="flex items-center justify-center h-[50vh]">
              <div className="text-primary font-mono text-xs animate-pulse uppercase tracking-[0.3em]">
                SYNCING DATA...
              </div>
            </div>
          }>
            {children}
          </Suspense>
        </main>
        <Footer />
      </body>
    </html>
  );
}
