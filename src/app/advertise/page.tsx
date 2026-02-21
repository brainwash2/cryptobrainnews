import React from 'react';
import AdvertiseClient from './_components/AdvertiseClient';

export const metadata = {
  title: 'Advertise with CryptoBrainNews | Media Kit',
  description:
    'Reach institutional crypto investors. Sponsored content, banner ads, and event partnerships.',
};

export default function AdvertisePage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* Hero */}
      <section className="py-24 px-4 lg:px-8 border-b border-[#1a1a1a]">
        <div className="max-w-[1200px] mx-auto text-center">
          <span className="text-[10px] font-black text-[#FABF2C] uppercase tracking-[0.4em]">
            Media Kit
          </span>
          <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter mt-4 leading-[0.95]">
            Reach Institutional
            <br />
            <span className="text-[#FABF2C]">Crypto Investors</span>
          </h1>
          <p className="text-gray-400 text-lg mt-8 max-w-2xl mx-auto font-serif leading-relaxed">
            CryptoBrainNews delivers institutional-grade analytics to decision-makers
            in DeFi, TradFi, and Web3. Partner with us to reach this premium audience.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 lg:px-8 border-b border-[#1a1a1a]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Monthly Visitors', value: '250K+' },
            { label: 'Newsletter Subs', value: '15K+' },
            { label: 'Avg Session', value: '4:32' },
            { label: 'Data Pages', value: '50+' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 text-center"
            >
              <div className="text-3xl font-black text-[#FABF2C] font-data tabular-nums">
                {stat.value}
              </div>
              <div className="text-[10px] font-black text-[#555] uppercase tracking-widest mt-2">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-20 px-4 lg:px-8 border-b border-[#1a1a1a]">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-[10px] font-black text-[#FABF2C] uppercase tracking-[0.4em] mb-12 text-center">
            Partnership Tiers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Signal',
                price: '$2,500',
                period: '/month',
                features: [
                  'Banner ad rotation (sidebar + footer)',
                  'Newsletter mention (1x/week)',
                  'Logo on partners page',
                  'Basic analytics dashboard',
                ],
              },
              {
                name: 'Alpha',
                price: '$7,500',
                period: '/month',
                featured: true,
                features: [
                  'Everything in Signal',
                  'Sponsored article (2x/month)',
                  'Featured in data terminal',
                  'Custom research co-branding',
                  'Priority newsletter placement',
                ],
              },
              {
                name: 'Institutional',
                price: 'Custom',
                period: '',
                features: [
                  'Everything in Alpha',
                  'Dedicated event partnership',
                  'White-label data feeds',
                  'API co-marketing',
                  'Direct analyst access',
                ],
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`border p-8 ${
                  tier.featured
                    ? 'border-[#FABF2C] bg-[#FABF2C]/[0.02] relative'
                    : 'border-[#1a1a1a] bg-[#0a0a0a]'
                }`}
              >
                {tier.featured && (
                  <div className="absolute top-0 right-0 bg-[#FABF2C] text-black text-[8px] font-black px-3 py-1 uppercase">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xs font-black text-[#FABF2C] uppercase tracking-widest">
                  {tier.name}
                </h3>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-black text-white">{tier.price}</span>
                  <span className="text-sm text-[#555]">{tier.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f) => (
                    <li key={f} className="text-xs text-[#888] flex gap-2">
                      <span className="text-[#FABF2C]">→</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 px-4 lg:px-8">
        <div className="max-w-[700px] mx-auto">
          <h2 className="text-[10px] font-black text-[#FABF2C] uppercase tracking-[0.4em] mb-8 text-center">
            Get In Touch
          </h2>
          <AdvertiseClient />
        </div>
      </section>
    </main>
  );
}
