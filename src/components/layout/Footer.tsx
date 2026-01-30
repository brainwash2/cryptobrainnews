import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t-4 border-primary pt-16 pb-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-primary w-10 h-10 flex items-center justify-center font-serif font-black text-2xl text-black">
                C
              </div>
              <span className="font-serif text-2xl font-bold tracking-tighter uppercase">
                Crypto<span className="text-primary">Brain</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed font-caption">
              The definitive source for institutional-grade crypto intelligence, DeFi data, and on-chain education. Leading the transition to the sovereign economy.
            </p>
            <div className="flex gap-4">
              {['Twitter', 'Telegram', 'Discord', 'Linkedin'].map((social) => (
                <div key={social} className="w-8 h-8 bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-black transition-colors cursor-pointer">
                  <span className="text-xs">{social[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-primary font-bold uppercase tracking-widest mb-6 text-sm">Network</h4>
            <ul className="space-y-4 text-sm text-gray-400 font-medium">
              <li><Link href="/homepage" className="hover:text-white transition-colors">News Hub</Link></li>
              <li><Link href="/markets-overview" className="hover:text-white transition-colors">Data Terminal</Link></li>
              <li><Link href="/learning" className="hover:text-white transition-colors">Learning Hub</Link></li>
              <li><Link href="/go-alpha" className="hover:text-white transition-colors">Go Alpha</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-primary font-bold uppercase tracking-widest mb-6 text-sm">Policies</h4>
            <ul className="space-y-4 text-sm text-gray-400 font-medium">
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Editorial Guidelines</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-primary font-bold uppercase tracking-widest mb-6 text-sm">Daily Briefing</h4>
            <p className="text-gray-400 text-sm mb-4">Get the most important alpha delivered to your inbox every morning.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-gray-900 border border-gray-800 px-4 py-2 text-sm w-full focus:outline-none focus:border-primary text-white"
              />
              <button className="bg-primary text-black font-bold px-4 py-2 text-sm hover:bg-white transition-colors">
                JOIN
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 font-mono">
          <p>© 2026 CRYPTOBRAINNEWS. ALL RIGHTS RESERVED. MARKET DATA BY DEFILLAMA & COINCAP.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span>TWITTER</span>
            <span>TELEGRAM</span>
            <span>DISCORD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
