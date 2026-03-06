export const dynamic = 'force-dynamic';

import React from 'react';
import { getSupabase } from '@/lib/supabase';
import { Calendar, MapPin, ExternalLink, PlaneTakeoff } from 'lucide-react';
import type { CryptoEvent } from '@/lib/types';

export const metadata = { title: 'Crypto Events | CryptoBrainNews' };

export default async function EventsPage() {
  const supabase = getSupabase();
  const { data } = await supabase.from('events').select('*').order('start_date', { ascending: true });
  
  const events = data ? (data as CryptoEvent[]) :[];

  const getTravalaLink = (city: string, date: string) => {
    const formattedDate = date ? date.slice(0, 10) : '';
    return `https://www.travala.com/search?location=${encodeURIComponent(city || '')}&checkIn=${formattedDate}&a_aid=YOUR_TRAVALA_ID`;
  };

  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">
            Global <span className="text-[#FABF2C]">Events</span>
          </h1>
          <p className="text-[#555] font-mono text-[10px] uppercase tracking-[0.3em]">
            Conferences • Hackathons • Summits
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="border border-[#1a1a1a] bg-[#0a0a0a] p-6 hover:border-[#FABF2C]/50 transition-all flex flex-col h-full group">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-[#111] text-[#FABF2C] px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded flex items-center gap-2">
                  <Calendar size={12} /> {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                {event.is_featured && (
                  <span className="text-[#00d672] text-[9px] font-mono uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#00d672] rounded-full animate-pulse" /> Featured
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-white uppercase mb-2 leading-snug group-hover:text-[#FABF2C] transition-colors">{event.title}</h3>
              <p className="text-[#888] text-xs mb-4 flex items-center gap-2"><MapPin size={12}/> {event.location_city}, {event.location_country}</p>
              <p className="text-sm text-[#ccc] mb-8 font-body flex-grow leading-relaxed">{event.description}</p>
              
              <div className="flex gap-2 mt-auto">
                <a href={event.url || '#'} target="_blank" rel="noopener noreferrer" className="flex-1 border border-[#1a1a1a] text-white text-center py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#FABF2C] hover:text-black hover:border-[#FABF2C] transition-colors rounded flex items-center justify-center gap-2">
                  Website <ExternalLink size={14} />
                </a>
                <a href={getTravalaLink(event.location_city, event.start_date)} target="_blank" rel="noopener noreferrer sponsored" className="flex-1 bg-[#1a1a1a] text-[#00d672] border border-[#00d672]/30 text-center py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#00d672] hover:text-black transition-colors rounded flex items-center justify-center gap-2">
                  Book Hotel <PlaneTakeoff size={14} />
                </a>
              </div>
            </div>
          ))}
          {events.length === 0 && (
             <div className="col-span-full py-20 text-center border border-dashed border-[#1a1a1a]">
               <p className="text-[#555] font-mono text-xs uppercase tracking-widest">No events scheduled. Add them in Supabase.</p>
             </div>
          )}
        </div>
      </div>
    </main>
  );
}
