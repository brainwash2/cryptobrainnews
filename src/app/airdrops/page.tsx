import React from 'react';
import { getSupabase } from '@/lib/supabase';
import Icon from '@/components/ui/AppIcon';

export const metadata = { title: 'Alpha Airdrops | CryptoBrainNews' };
export const revalidate = 3600;

export default async function AirdropsPage() {
  const supabase = getSupabase();
  const { data: airdrops } = await supabase
    .from('airdrops')
    .select('*')
    .eq('status', 'Active')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
          Verified <span className="text-[#FABF2C]">Airdrops</span>
        </h1>
        <p className="text-[#555] font-mono text-[10px] uppercase tracking-[0.3em] mb-10">
          Curated protocol distributions & Web3 Tasks
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(airdrops || []).map((drop) => (
            <div key={drop.id} className="border border-[#1a1a1a] bg-[#0a0a0a] p-6 hover:border-[#FABF2C]/50 transition-all flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-white/5 text-white px-2 py-1 text-[9px] font-black uppercase tracking-widest">
                  {drop.difficulty}
                </span>
                <span className="text-[#00d672] text-[9px] font-mono uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#00d672] rounded-full animate-pulse" /> Active
                </span>
              </div>
              
              <h3 className="text-xl font-black text-white uppercase mb-3">{drop.title}</h3>
              <p className="text-xs text-[#888] mb-8 font-body flex-grow">{drop.description}</p>
              
              <a 
                href={drop.affiliate_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-[#FABF2C] text-black text-center py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors block mt-auto"
              >
                Claim Drop →
              </a>
            </div>
          ))}

          {(!airdrops || airdrops.length === 0) && (
            <div className="col-span-full py-20 border border-dashed border-[#1a1a1a] text-center">
              <p className="text-[#555] font-mono text-xs uppercase tracking-widest">Scanning network for new drops...</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
