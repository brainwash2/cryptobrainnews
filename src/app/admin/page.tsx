'use client';

import React, { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { Cpu, Zap } from 'lucide-react';

export default function AdminCMS() {
  const[form, setForm] = useState({ title: '', slug: '', body: '', category: 'News', image_url: '' });
  const [status, setStatus] = useState('');
  const [aiStatus, setAiStatus] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Publishing...');
    const supabase = getSupabase();
    
    const { error } = await supabase.from('articles').insert([
      { ...form, author_name: 'Admin', source: 'CryptoBrain' }
    ]);

    if (error) {
      setStatus(`Error: ${error.message}`);
    } else {
      setStatus('Published successfully!');
      setForm({ title: '', slug: '', body: '', category: 'News', image_url: '' });
    }
  };

  const handleGenerateAirdrop = async () => {
    setAiLoading(true);
    setAiStatus('Scanning DefiLlama & Initializing Llama-3.3 LLM...');
    try {
      const res = await fetch('/api/admin/generate-airdrop', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Generation failed');
      setAiStatus(`Success: Synthesized & Published Playbook for[${data.protocol}]`);
    } catch (err: any) {
      setAiStatus(`Error: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] p-10 font-sans text-white">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* AI Automation Panel */}
        <div className="border border-[#00d672]/30 bg-[#00d672]/[0.02] p-10 rounded">
          <div className="flex items-center gap-3 mb-6">
            <Cpu className="text-[#00d672]" size={28} />
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">AI Content Automation</h2>
          </div>
          <p className="text-[#888] text-sm mb-6 leading-relaxed">
            Scan live DefiLlama TVL data for tokenless protocols. Automatically synthesize a 3-step airdrop farming guide using our fine-tuned Groq model and push it directly into the Sanity CMS data pipeline.
          </p>
          <button 
            onClick={handleGenerateAirdrop}
            disabled={aiLoading}
            className="flex items-center justify-center gap-3 bg-[#00d672] text-black font-black uppercase px-8 py-4 w-full md:w-auto hover:bg-white transition-colors disabled:opacity-50"
          >
            <Zap size={18} />
            {aiLoading ? 'Synthesizing On-Chain Data...' : 'Auto-Generate Next Airdrop Guide'}
          </button>
          {aiStatus && (
            <div className="mt-6 p-4 bg-black border border-[#222] font-mono text-xs text-[#00d672] break-words">
              {`> ${aiStatus}`}
            </div>
          )}
        </div>

        {/* Legacy Manual CMS */}
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-10 rounded">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-[#FABF2C] mb-8">Legacy Manual CMS (Supabase)</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-500">Article Title</label>
              <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-black border border-[#222] p-3 text-white outline-none focus:border-[#FABF2C]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-500">URL Slug</label>
                <input required value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full bg-black border border-[#222] p-3 text-white outline-none focus:border-[#FABF2C]" placeholder="my-new-article" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-500">Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-black border border-[#222] p-3 text-white outline-none focus:border-[#FABF2C]">
                  <option>News</option>
                  <option>Alpha Call</option>
                  <option>Daily Analysis</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-500">Image URL</label>
              <input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} className="w-full bg-black border border-[#222] p-3 text-white outline-none focus:border-[#FABF2C]" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-500">Content Body</label>
              <textarea required rows={10} value={form.body} onChange={e => setForm({...form, body: e.target.value})} className="w-full bg-black border border-[#222] p-3 text-white outline-none focus:border-[#FABF2C]" />
            </div>
            
            <button type="submit" className="bg-[#1a1a1a] text-white border border-[#333] font-black uppercase tracking-widest px-8 py-4 w-full hover:border-[#FABF2C] hover:text-[#FABF2C] transition-colors">
              Publish to Network
            </button>
            
            {status && <p className="text-center font-mono text-sm mt-4 text-[#FABF2C]">{status}</p>}
          </form>
        </div>
        
      </div>
    </main>
  );
}
