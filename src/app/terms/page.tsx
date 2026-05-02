// src/app/terms/page.tsx
import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | CryptoBrainNews',
  description: 'CryptoBrainNews terms of service — conditions for using our platform.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] py-16 px-4 lg:px-8 font-sans text-[#f8fafc]">
      <div className="max-w-[800px] mx-auto space-y-10">
        <div className="border-b border-[#27272a] pb-8">
          <p className="text-[#a3a3a3] font-mono text-[10px] uppercase tracking-widest mb-2">Legal</p>
          <h1 className="text-4xl font-bold uppercase tracking-tighter">Terms of Service</h1>
          <p className="text-[#52525b] font-mono text-xs mt-2">Last updated: May 2026</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-wide text-[#22c55e]">1. Acceptance of Terms</h2>
          <p className="text-[#a3a3a3] leading-relaxed">
            By accessing or using CryptoBrainNews (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform. We reserve the right to modify these terms at any time; continued use after changes constitutes acceptance.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-wide text-[#22c55e]">2. Not Financial Advice</h2>
          <p className="text-[#a3a3a3] leading-relaxed">
            All content on CryptoBrainNews — including articles, data visualisations, analysis, and AI-generated summaries — is for informational and educational purposes only. Nothing on this Platform constitutes financial, investment, legal, or tax advice. Cryptocurrency investments are highly volatile and involve substantial risk of loss. Always conduct your own research and consult a qualified financial advisor before making investment decisions.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-wide text-[#22c55e]">3. Data Accuracy</h2>
          <p className="text-[#a3a3a3] leading-relaxed">
            We source market data from public APIs (CoinGecko, DefiLlama, blockchain.info, and others). While we strive for accuracy, we make no guarantees regarding the completeness, timeliness, or correctness of any data displayed. Market data may be delayed or contain errors. Use at your own risk.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-wide text-[#22c55e]">4. Pro Subscriptions</h2>
          <p className="text-[#a3a3a3] leading-relaxed">
            Pro subscriptions are billed monthly or annually via Stripe. You may cancel at any time through the Stripe Customer Portal. Refunds are not provided for partial subscription periods unless required by applicable law. We reserve the right to modify subscription pricing with 30 days notice.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-wide text-[#22c55e]">5. Affiliate Disclosure</h2>
          <p className="text-[#a3a3a3] leading-relaxed">
            Some links on the Platform are affiliate links. If you click and make a purchase or sign up for a service, we may earn a commission at no additional cost to you. Affiliate links are clearly marked with rel=&quot;sponsored&quot; attributes. We only recommend products and services we believe provide value to our readers.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-wide text-[#22c55e]">6. Intellectual Property</h2>
          <p className="text-[#a3a3a3] leading-relaxed">
            All original content published on CryptoBrainNews — including articles, charts, data visualisations, and analysis — is the intellectual property of CryptoBrainNews. You may share and quote our content with proper attribution and a link back to the original article. Reproduction of substantial portions of our content for commercial purposes requires prior written permission.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-wide text-[#22c55e]">7. User Conduct</h2>
          <p className="text-[#a3a3a3] leading-relaxed">
            You agree not to: (a) use the Platform for any unlawful purpose; (b) attempt to gain unauthorised access to our systems; (c) scrape, crawl, or data-mine the Platform without permission (API access is available via the Agent Registry); (d) use the Platform to transmit malware, spam, or other harmful content.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-wide text-[#22c55e]">8. Limitation of Liability</h2>
          <p className="text-[#a3a3a3] leading-relaxed">
            CryptoBrainNews and its operators shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the Platform, including but not limited to investment losses, data inaccuracies, or service interruptions. The Platform is provided &quot;as is&quot; without warranties of any kind, express or implied.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-wide text-[#22c55e]">9. Governing Law</h2>
          <p className="text-[#a3a3a3] leading-relaxed">
            These terms are governed by the laws of the jurisdiction in which CryptoBrainNews is registered. Any disputes shall be resolved through binding arbitration in accordance with applicable rules.
          </p>
        </section>

        <div className="border-t border-[#27272a] pt-8 mt-12">
          <p className="text-[#52525b] font-mono text-xs">
            Contact: <a href="mailto:legal@cryptobrainnews.com" className="text-[#22c55e] hover:underline">legal@cryptobrainnews.com</a>
          </p>
        </div>
      </div>
    </main>
  );
}