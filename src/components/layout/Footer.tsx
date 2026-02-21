import React from 'react';
import Link from 'next/link';
import NewsletterForm from './NewsletterForm';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-[#1a1a1a] py-16 px-4 lg:px-8 mt-20">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center font-black text-black">C</div>
            <span className="text-xl font-black tracking-tighter text-white uppercase">CryptoBrain</span>
          </div>
          <p className="text-[#444] text-xs leading-relaxed font-medium max-w-xs">
            The definitive source for institutional-grade crypto intelligence, DeFi data, and on-chain education.
          </p>
          <div className="flex gap-4">
            {[
              { id: 'tw', label: 'X' },
              { id: 'tg', label: 'TG' },
              { id: 'dc', label: 'DC' },
              { id: 'li', label: 'IN' },
            ].map((social) => (
              <div
                key={social.id}
                className="w-8 h-8 border border-[#1a1a1a] flex items-center justify-center text-[10px] text-[#444] hover:border-primary hover:text-primary cursor-pointer transition-all"
              >
                {social.label}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6">Network</h4>
          <ul className="space-y-4">
            <li><Link href="/news" className="text-[#666] text-xs hover:text-white transition-colors uppercase font-bold">News Hub</Link></li>
            <li><Link href="/data" className="text-[#666] text-xs hover:text-white transition-colors uppercase font-bold">Data Terminal</Link></li>
            <li><Link href="/learning" className="text-[#666] text-xs hover:text-white transition-colors uppercase font-bold">Learning Hub</Link></li>
            <li><Link href="/go-alpha" className="text-[#666] text-xs hover:text-white transition-colors uppercase font-bold">Go Alpha</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6">Policies</h4>
          <ul className="space-y-4">
            <li><Link href="/privacy" className="text-[#666] text-xs hover:text-white transition-colors uppercase font-bold">Privacy Policy</Link></li>
            <li><Link href="/terms" className="text-[#666] text-xs hover:text-white transition-colors uppercase font-bold">Terms of Service</Link></li>
            <li><Link href="/cookies" className="text-[#666] text-xs hover:text-white transition-colors uppercase font-bold">Cookie Policy</Link></li>
            <li><Link href="/editorial" className="text-[#666] text-xs hover:text-white transition-colors uppercase font-bold">Editorial Guidelines</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6">Daily Briefing</h4>
          <p className="text-[#444] text-xs mb-6 font-medium">
            Institutional alpha delivered to your inbox every morning.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="container mx-auto mt-16 pt-8 border-t border-[#111] flex justify-between items-center">
        <p className="text-[9px] text-[#333] font-mono uppercase tracking-widest">
          © 2026 CryptoBrainNews. Market Data by DefiLlama.
        </p>
      </div>
    </footer>
  );
}

