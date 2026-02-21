'use client';
import React, { useState } from 'react';

export default function AdvertiseClient() {
  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    telegram: '',
    website: '',
    budget_range: '',
    package_interest: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/ad-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('success');
      setForm({
        company_name: '',
        contact_name: '',
        email: '',
        telegram: '',
        website: '',
        budget_range: '',
        package_interest: '',
        message: '',
      });
    } catch {
      setStatus('error');
    }
  };

  const inputCls =
    'w-full bg-[#0a0a0a] border border-[#1a1a1a] px-4 py-3 text-xs text-white font-mono outline-none focus:border-[#FABF2C]/50 placeholder:text-[#333]';

  if (status === 'success') {
    return (
      <div className="border border-[#FABF2C]/30 bg-[#FABF2C]/[0.02] p-12 text-center">
        <div className="text-4xl mb-4">✓</div>
        <h3 className="text-xl font-black text-white uppercase mb-2">Submission Received</h3>
        <p className="text-xs text-[#555] font-mono uppercase tracking-widest">
          Our partnerships team will contact you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          required
          placeholder="Company Name *"
          value={form.company_name}
          onChange={(e) => setForm({ ...form, company_name: e.target.value })}
          className={inputCls}
        />
        <input
          placeholder="Contact Name"
          value={form.contact_name}
          onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
          className={inputCls}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          required
          type="email"
          placeholder="Email *"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={inputCls}
        />
        <input
          placeholder="Telegram Handle"
          value={form.telegram}
          onChange={(e) => setForm({ ...form, telegram: e.target.value })}
          className={inputCls}
        />
      </div>
      <input
        placeholder="Website URL"
        value={form.website}
        onChange={(e) => setForm({ ...form, website: e.target.value })}
        className={inputCls}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          required
          value={form.budget_range}
          onChange={(e) => setForm({ ...form, budget_range: e.target.value })}
          className={inputCls}
        >
          <option value="">Budget Range *</option>
          <option value="$1k-$5k">$1,000 – $5,000/mo</option>
          <option value="$5k-$15k">$5,000 – $15,000/mo</option>
          <option value="$15k-$50k">$15,000 – $50,000/mo</option>
          <option value="$50k+">$50,000+/mo</option>
        </select>
        <select
          required
          value={form.package_interest}
          onChange={(e) => setForm({ ...form, package_interest: e.target.value })}
          className={inputCls}
        >
          <option value="">Package Interest *</option>
          <option value="signal">Signal ($2,500/mo)</option>
          <option value="alpha">Alpha ($7,500/mo)</option>
          <option value="institutional">Institutional (Custom)</option>
          <option value="event">Event Sponsorship</option>
        </select>
      </div>
      <textarea
        placeholder="Tell us about your campaign goals..."
        rows={4}
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        className={inputCls}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-[#FABF2C] text-black py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
      >
        {status === 'loading' ? 'SUBMITTING...' : 'SUBMIT INQUIRY'}
      </button>
      {status === 'error' && (
        <p className="text-red-500 text-xs text-center font-mono">
          Submission failed. Please try again or email partnerships@cryptobrainnews.com
        </p>
      )}
    </form>
  );
}
