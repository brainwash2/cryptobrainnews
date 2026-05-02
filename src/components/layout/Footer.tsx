// src/components/layout/Footer.tsx
import React from 'react';
import Link from 'next/link';
import NewsletterForm from './NewsletterForm';

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[#27272a] py-16 px-4 lg:px-8 mt-20">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#22c55e] rounded-lg flex items-center justify-center font-bold text-[#0a0a0a]">CB</div>
            <span className="text-xl font-bold tracking-tighter text-[#f8fafc] uppercase">CryptoBrain</span>
          </div>
          <p className="text-[#a3a3a3] text-xs leading-relaxed font-medium max-w-xs">
            The definitive source for institutional-grade crypto intelligence, DeFi data, and on-chain education.
          </p>
          <div className="flex gap-4">
            {['X', 'TG', 'DC', 'IN'].map((social) => (
              <div key={social} className="w-8 h-8 border border-[#27272a] rounded-lg flex items-center justify-center text-[10px] text-[#a3a3a3] hover:border-[#22c55e] hover:text-[#22c55e] cursor-pointer transition-all">
                {social}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-bold text-[#22c55e] uppercase tracking-[0.2em] mb-6">Network</h4>
          <ul className="space-y-4">
            <li><Link href="/news" className="text-[#a3a3a3] text-xs hover:text-[#f8fafc] transition-colors uppercase font-bold">News Hub</Link></li>
            <li><Link href="/data" className="text-[#a3a3a3] text-xs hover:text-[#f8fafc] transition-colors uppercase font-bold">Data Terminal</Link></li>
            <li><Link href="/events" className="text-[#a3a3a3] text-xs hover:text-[#f8fafc] transition-colors uppercase font-bold">Events Calendar</Link></li>
            <li><Link href="/airdrops" className="text-[#a3a3a3] text-xs hover:text-[#f8fafc] transition-colors uppercase font-bold">Alpha Airdrops</Link></li>
            <li><Link href="/learning" className="text-[#a3a3a3] text-xs hover:text-[#f8fafc] transition-colors uppercase font-bold">Learning Hub</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-bold text-[#22c55e] uppercase tracking-[0.2em] mb-6">Legal</h4>
          <ul className="space-y-4">
            <li><Link href="/privacy" className="text-[#a3a3a3] text-xs hover:text-[#f8fafc] transition-colors uppercase font-bold">Privacy Policy</Link></li>
            <li><Link href="/terms" className="text-[#a3a3a3] text-xs hover:text-[#f8fafc] transition-colors uppercase font-bold">Terms of Service</Link></li>
            <li><Link href="/about" className="text-[#a3a3a3] text-xs hover:text-[#f8fafc] transition-colors uppercase font-bold">About Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-bold text-[#22c55e] uppercase tracking-[0.2em] mb-6">Daily Briefing</h4>
          <p className="text-[#a3a3a3] text-xs mb-6 font-medium">Institutional alpha delivered to your inbox every morning.</p>
          <NewsletterForm />
        </div>
      </div>
      <div className="container mx-auto mt-16 pt-8 border-t border-[#27272a] flex justify-between items-center">
        <p className="text-[10px] text-[#52525b] font-mono uppercase tracking-widest">© 2026 CryptoBrainNews. Market Data by CoinGecko.</p>
      </div>
    </footer>
  );
}
