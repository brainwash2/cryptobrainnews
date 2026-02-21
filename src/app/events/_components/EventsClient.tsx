'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { CryptoEvent } from '@/lib/types';

const EVENT_TYPES = ['all', 'conference', 'hackathon', 'meetup', 'summit', 'workshop', 'webinar', 'protocol_milestone'] as const;

export default function EventsClient({ events }: { events: CryptoEvent[] }) {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = events;
    if (filter !== 'all') result = result.filter((e) => e.event_type === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.location_city?.toLowerCase().includes(q) ||
          e.location_country?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [events, filter, search]);

  const featured = filtered.filter((e) => e.is_featured);
  const regular = filtered.filter((e) => !e.is_featured);

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {EVENT_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${
              filter === type
                ? 'bg-[#FABF2C] text-black border-[#FABF2C]'
                : 'bg-transparent text-[#555] border-[#1a1a1a] hover:text-white hover:border-[#333]'
            }`}
          >
            {type === 'all' ? 'All Events' : type.replace('_', ' ')}
          </button>
        ))}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="SEARCH EVENTS..."
          className="ml-auto bg-[#0a0a0a] border border-[#1a1a1a] px-4 py-2 text-[10px] font-mono text-white w-64 outline-none focus:border-[#FABF2C]/50 placeholder:text-[#333] uppercase tracking-wider"
        />
      </div>

      {/* Featured Events */}
      {featured.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-[10px] font-black text-[#FABF2C] uppercase tracking-[0.3em]">
            ★ Featured Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((event) => (
              <EventCard key={event.id} event={event} featured />
            ))}
          </div>
        </div>
      )}

      {/* Regular Events */}
      {regular.length > 0 && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regular.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-20 text-center border border-dashed border-[#1a1a1a]">
          <p className="text-[#333] font-mono text-xs uppercase tracking-widest">
            No events found
          </p>
        </div>
      )}
    </div>
  );
}

function EventCard({
  event,
  featured = false,
}: {
  event: CryptoEvent;
  featured?: boolean;
}) {
  const startDate = new Date(event.start_date);
  const month = startDate.toLocaleDateString('en-US', { month: 'short' });
  const day = startDate.getDate();

  return (
    <a
      href={event.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block border ${
        featured ? 'border-[#FABF2C]/30 bg-[#FABF2C]/[0.02]' : 'border-[#1a1a1a] bg-[#0a0a0a]'
      } hover:border-[#FABF2C]/50 transition-all p-5`}
    >
      <div className="flex gap-4">
        {/* Date Badge */}
        <div className="flex flex-col items-center justify-center w-14 h-14 bg-[#050505] border border-[#1a1a1a] shrink-0">
          <span className="text-[9px] font-black text-[#FABF2C] uppercase">{month}</span>
          <span className="text-xl font-black text-white leading-none">{day}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {featured && (
              <span className="text-[8px] bg-[#FABF2C] text-black font-black px-1.5 py-0.5 uppercase">
                Featured
              </span>
            )}
            <span className="text-[8px] font-mono text-[#444] uppercase">
              {event.event_type.replace('_', ' ')}
            </span>
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-[#FABF2C] transition-colors leading-snug line-clamp-2 uppercase">
            {event.title}
          </h3>
          <p className="text-[10px] text-[#555] font-mono mt-2">
            {event.is_online
              ? '🌐 Online'
              : `📍 ${event.location_city || 'TBD'}${event.location_country ? `, ${event.location_country}` : ''}`}
          </p>
        </div>
      </div>
    </a>
  );
}
