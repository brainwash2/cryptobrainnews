import React from 'react';
import Link from 'next/link';
import { Terminal, Book, Key, Zap, Code } from 'lucide-react';

export const metadata = {
  title: 'API Documentation | CryptoBrain',
  description: 'Integrate your AI agents with the CryptoBrain Oracle and L402 compute endpoints.',
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 lg:w-72 bg-[#0a0a0a] border-r border-[#222] md:h-screen md:sticky top-0 overflow-y-auto shrink-0 flex flex-col">
        <div className="p-6 border-b border-[#222]">
          <Link href="/" className="flex items-center gap-3 text-white hover:text-[#FABF2C] transition-colors">
            <Terminal size={24} className="text-[#FABF2C]" />
            <span className="font-black tracking-tighter uppercase text-lg">CryptoBrain API</span>
          </Link>
        </div>
        
        <nav className="p-6 flex-1 space-y-8">
          <div>
            <h3 className="text-[10px] font-black uppercase text-[#555] tracking-widest mb-3 flex items-center gap-2">
              <Book size={12} /> Getting Started
            </h3>
            <ul className="space-y-3 text-sm font-mono text-[#888]">
              <li><a href="#introduction" className="hover:text-white transition-colors">Introduction</a></li>
              <li><Link href="/agent-registry" className="hover:text-[#00d672] transition-colors">KYA Registration &rarr;</Link></li>
              <li><Link href="/agent-registry/sandbox" className="hover:text-[#FABF2C] transition-colors">Developer Sandbox &rarr;</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-black uppercase text-[#555] tracking-widest mb-3 flex items-center gap-2">
              <Key size={12} /> Authentication
            </h3>
            <ul className="space-y-3 text-sm font-mono text-[#888]">
              <li><a href="#api-keys" className="hover:text-white transition-colors">API Keys</a></li>
              <li><a href="#l402-payments" className="hover:text-white transition-colors">L402 Lightning Payments</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-black uppercase text-[#555] tracking-widest mb-3 flex items-center gap-2">
              <Zap size={12} /> Endpoints
            </h3>
            <ul className="space-y-3 text-sm font-mono text-[#888]">
              <li><a href="#api-execute" className="hover:text-white transition-colors">POST /api/execute</a></li>
              <li><a href="#api-oracle" className="hover:text-white transition-colors">GET /api/oracle/*</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-[10px] font-black uppercase text-[#555] tracking-widest mb-3 flex items-center gap-2">
              <Code size={12} /> Integration
            </h3>
            <ul className="space-y-3 text-sm font-mono text-[#888]">
              <li><a href="#python-example" className="hover:text-white transition-colors">Python Example</a></li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 lg:p-16 max-w-4xl overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
