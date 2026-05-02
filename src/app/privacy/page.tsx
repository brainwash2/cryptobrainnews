// src/app/privacy/page.tsx
import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | CryptoBrainNews',
  description: 'CryptoBrainNews privacy policy — how we collect, use, and protect your data.',
};

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cryptobrainnews.vercel.app').replace(/\/$/, '');

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] py-16 px-4 lg:px-8 font-sans text-[#f8fafc]">
      <div className="max-w-[800px] mx-auto space-y-10">
        <div className="border-b border-[#27272a] pb-8">
          <p className="text-[#a3a3a3] font-mono text-[10px] uppercase tracking-widest mb-2">Legal</p>
          <h1 className="text-4xl font-bold uppercase tracking-tighter">Privacy Policy</h1>
          <p className="text-[#52525b] font-mono text-xs mt-2">Last updated: May 2026</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-wide text-[#22c55e]">1. Information We Collect</h2>
          <p className="text-[#a3a3a3] leading-relaxed">
            CryptoBrainNews collects minimal personal data necessary to operate our services. When you subscribe to our newsletter, we collect your email address. When you create a Pro account, we collect your email address and payment information (processed securely by Stripe — we never store full credit card numbers). We use Vercel Analytics and Microsoft Clarity to understand aggregate usage patterns; these services may set first-party cookies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-wide text-[#22c55e]">2. How We Use Your Data</h2>
          <ul className="list-disc pl-5 space-y-2 text-[#a3a3a3]">
            <li>To deliver the CryptoBrain Daily Brief newsletter (if subscribed).</li>
            <li>To process Pro subscription payments via Stripe.</li>
            <li>To analyse site traffic and improve content (aggregate, anonymised).</li>
            <li>To comply with legal obligations.</li>
          </ul>
          <p className="text-[#a3a3a3] leading-relaxed">
            We never sell, rent, or share your personal data with third parties for their marketing purposes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-wide text-[#22c55e]">3. Cookies</h2>
          <p className="text-[#a3a3a3] leading-relaxed">
            We use essential cookies for site functionality (e.g., session management for Pro subscribers) and analytics cookies (Vercel Analytics, Microsoft Clarity) to measure site performance. You may disable cookies in your browser settings, though some features may not function correctly. We do not use advertising or tracking cookies from third-party ad networks.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-wide text-[#22c55e]">4. Newsletter & Email Communications</h2>
          <p className="text-[#a3a3a3] leading-relaxed">
            Our newsletter is sent via Resend. Every email includes a one-click unsubscribe link. You may also unsubscribe at any time by visiting <a href={`${BASE}/api/newsletter/unsubscribe`} className="text-[#22c55e] hover:underline">our unsubscribe page</a>. Unsubscribe requests are processed immediately and permanently.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-wide text-[#22c55e]">5. Third-Party Services</h2>
          <p className="text-[#a3a3a3] leading-relaxed">
            We use the following third-party services, each governed by their own privacy policies:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[#a3a3a3]">
            <li><strong>Stripe</strong> — payment processing for Pro subscriptions.</li>
            <li><strong>Resend</strong> — transactional and newsletter email delivery.</li>
            <li><strong>Vercel</strong> — hosting and serverless function execution.</li>
            <li><strong>Upstash</strong> — Redis caching (no personal data stored).</li>
            <li><strong>Neon</strong> — PostgreSQL database (newsletter subscriber list).</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-wide text-[#22c55e]">6. Data Retention</h2>
          <p className="text-[#a3a3a3] leading-relaxed">
            Newsletter subscriber emails are retained until you unsubscribe. Stripe payment records are retained per Stripe&apos;s policies. Analytics data is retained for up to 14 months (Vercel Analytics) or per Microsoft Clarity&apos;s default retention period. We do not retain server logs containing IP addresses beyond 30 days.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-wide text-[#22c55e]">7. Your Rights (GDPR / CCPA)</h2>
          <p className="text-[#a3a3a3] leading-relaxed">
            You have the right to access, correct, or delete your personal data. To exercise these rights, or if you have any questions about this privacy policy, contact us at <a href="mailto:privacy@cryptobrainnews.com" className="text-[#22c55e] hover:underline">privacy@cryptobrainnews.com</a>. We will respond within 30 days as required by GDPR.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-wide text-[#22c55e]">8. Changes to This Policy</h2>
          <p className="text-[#a3a3a3] leading-relaxed">
            We may update this privacy policy from time to time. Material changes will be communicated via email to newsletter subscribers. Continued use of the site after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <div className="border-t border-[#27272a] pt-8 mt-12">
          <p className="text-[#52525b] font-mono text-xs">
            Contact: <a href="mailto:privacy@cryptobrainnews.com" className="text-[#22c55e] hover:underline">privacy@cryptobrainnews.com</a>
          </p>
        </div>
      </div>
    </main>
  );
}