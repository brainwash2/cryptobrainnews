'use client';

import React, { useState } from 'react';
import { getSupabase } from '@/lib/supabase';

export default function AdminCMS() {
  const [form, setForm] = useState({ title: '', slug: '', body: '', category: 'News', image_url: '' });
  const [status, setStatus] = useState('');

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

  return (
    <main className="min-h-screen bg-[#050505] p-10 font-sans text-white">
      <div className="max-w-3xl mx-auto border border-[#1a1a1a] bg-[#0a0a0a] p-10">
        <h1 className="text-3xl font-black uppercase text-[#FABF2C] mb-8">CMS Dashboard</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase mb-2 text-gray-500">Article Title</label>
            <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-black border border-[#222] p-3 text-white outline-none focus:border-[#FABF2C]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-2 text-gray-500">URL Slug</label>
              <input required value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full bg-black border border-[#222] p-3 text-white outline-none focus:border-[#FABF2C]" placeholder="my-new-article" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-2 text-gray-500">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-black border border-[#222] p-3 text-white outline-none focus:border-[#FABF2C]">
                <option>News</option>
                <option>Alpha Call</option>
                <option>Daily Analysis</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-2 text-gray-500">Image URL</label>
            <input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} className="w-full bg-black border border-[#222] p-3 text-white outline-none focus:border-[#FABF2C]" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-2 text-gray-500">Content Body</label>
            <textarea required rows={10} value={form.body} onChange={e => setForm({...form, body: e.target.value})} className="w-full bg-black border border-[#222] p-3 text-white outline-none focus:border-[#FABF2C]" />
          </div>
          
          <button type="submit" className="bg-[#FABF2C] text-black font-black uppercase px-8 py-4 w-full hover:bg-white transition-colors">
            Publish to Network
          </button>
          
          {status && <p className="text-center font-mono text-sm mt-4 text-[#00d672]">{status}</p>}
        </form>
      </div>
    </main>
  );
}
