import React from 'react';
import { getSupabase } from '@/lib/supabase';
import type { CryptoEvent } from '@/lib/types';
import EventsClient from './_components/EventsClient';

export const metadata = {
  title: 'Crypto Events Calendar | CryptoBrainNews',
  description: 'Global crypto conferences, hackathons, and protocol milestones.',
};

export const revalidate = 300;

async function getEvents(): Promise<CryptoEvent[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('start_date', new Date().toISOString())
    .order('start_date', { ascending: true })
    .limit(100);

  if (error || !data) return [];
  return data as CryptoEvent[];
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <main className="min-h-screen bg-[#050505] py-10 px-4 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter font-heading">
            Crypto <span className="text-[#FABF2C]">Events</span>
          </h1>
          <p className="text-[#444] font-mono text-[10px] uppercase tracking-[0.3em] mt-2">
            Conferences • Hackathons • Protocol Milestones
          </p>
        </div>
        <EventsClient events={events} />
      </div>
    </main>
  );
}
