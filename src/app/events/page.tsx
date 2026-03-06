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

  // Travala Affiliate Integration Strategy
  const getTravalaLink = (city: string, date: string) => {
    // We add a 2-day buffer before the event for check-in
    const checkIn = new Date(date);
    checkIn.setDate(checkIn.getDate() - 2);
    const formattedDate = checkIn.toISOString().slice(0, 10);
    const TRAVALA_AFFILIATE_ID = 'YOUR_AFFILIATE_ID'; // Replace this with your Travala ID
    
    return `https://www.travala.com/search?location=${encodeURIComponent(city || '')}&checkIn=${formattedDate}&a_aid=${TRAVALA_AFFILIATE_ID}`;
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
            <div key={event.id} className="border border-[#1a1a1a] bg-[#0a0a0a] p-6 hover:border-[#FABF2C]/50 transition-all flex flex-col h-full group relative overflow-hidden">
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
              <h3 className="text-xl font-black text-white uppercase mb-2 leading-snug group-hover:text-[#FABF2C] transition-colors">{event.title}</h3>
              <p className="text-[#888] text-xs mb-4 flex items-center gap-2 font-bold"><MapPin size={12}/> {event.location_city}, {event.location_country}</p>
              <p className="text-sm text-[#ccc] mb-10 font-body flex-grow leading-relaxed">{event.description}</p>
              
              <div className="flex flex-col gap-3 mt-auto">
                <a href={getTravalaLink(event.location_city, event.start_date)} target="_blank" rel="noopener noreferrer sponsored" className="w-full bg-[#111] border border-[#FABF2C]/30 text-[#FABF2C] hover:bg-[#FABF2C] hover:text-black text-center py-4 text-[11px] font-black uppercase tracking-widest transition-colors rounded flex items-center justify-center gap-2">
                  Book Hotel in {event.location_city} <PlaneTakeoff size={14} />
                </a>
                <a href={event.url || '#'} target="_blank" rel="noopener noreferrer" className="w-full text-[#555] hover:text-white text-center py-2 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                  Official Website <ExternalLink size={12} />
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
