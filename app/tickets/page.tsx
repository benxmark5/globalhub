"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Ticket, Search, Calendar, MapPin,
  Clock, Star, Shield, Zap, ArrowRight,
  Filter
} from 'lucide-react';

type Event = {
  id: string; title: string; subtitle: string;
  competition: string; sport: string; emoji: string;
  home_team: string; away_team: string;
  home_team_flag: string; away_team_flag: string;
  home_team_color: string; away_team_color: string;
  venue_name: string; venue_city: string;
  venue_country: string; venue_flag: string;
  event_date: string; event_time: string;
  cover_color_1: string; cover_color_2: string;
  is_featured: boolean; status: string;
};

type Tier = {
  event_id: string; price_usd: number;
  total_quantity: number; sold_quantity: number;
  name: string; color: string;
};

const SPORTS = ['All', 'Football', 'Basketball', 'Tennis', 'Rugby', 'Athletics', 'Motorsport'];

export default function TicketsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [allTiers, setAllTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState('All');

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/tickets/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }

      // Get all tiers for pricing
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: tierData } = await supabase
        .from('ticket_tiers').select('event_id, price_usd, total_quantity, sold_quantity, name, color')
        .eq('is_active', true);
      setAllTiers(tierData || []);
      setLoading(false);
    };
    load();
  }, []);

  const getMinPrice = (eventId: string) => {
    const tiers = allTiers.filter(t => t.event_id === eventId);
    if (!tiers.length) return null;
    return Math.min(...tiers.map(t => t.price_usd));
  };

  const getAvailability = (eventId: string) => {
    const tiers = allTiers.filter(t => t.event_id === eventId);
    const total = tiers.reduce((s, t) => s + (t.total_quantity || 0), 0);
    const sold = tiers.reduce((s, t) => s + (t.sold_quantity || 0), 0);
    return { total, sold, pct: total > 0 ? Math.round((sold / total) * 100) : 0 };
  };

  const featured = events.filter(e => e.is_featured);
  const filtered = events.filter(e => {
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.competition.toLowerCase().includes(search.toLowerCase()) ||
      e.venue_city.toLowerCase().includes(search.toLowerCase());
    const matchSport = sport === 'All' || e.sport.toLowerCase() === sport.toLowerCase();
    return matchSearch && matchSport;
  });

  return (
    <div style={{
      minHeight: '100dvh', background: '#060f1e',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      paddingBottom: '90px'
    }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #0f1a10 50%, #0a1628 100%)',
        padding: '40px 16px 32px',
        borderBottom: '1px solid rgba(251,146,60,0.15)'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.3)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ticket size={24} color="#fb923c" />
            </div>
            <div>
              <h1 style={{ fontWeight: 900, fontSize: 'clamp(24px,4vw,42px)', letterSpacing: '-1.5px', marginBottom: '2px' }}>
                Stadium Tickets
              </h1>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Official verified tickets for sporting events worldwide
              </p>
            </div>
          </div>

          {/* Trust row */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {[
              { icon: Shield, label: 'Official Verified', color: '#22c55e' },
              { icon: Zap, label: 'Instant QR Delivery', color: '#fbbf24' },
              { icon: Star, label: 'FIFA-Style Ticket', color: '#fb923c' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Icon size={14} color={color} />
                <span style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 600 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#0a1628', border: '1.5px solid #1a2740', borderRadius: '14px', padding: '12px 16px', maxWidth: '560px' }}>
            <Search size={16} color="#6b7280" />
            <input type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search events, teams, cities..."
              style={{ background: 'none', border: 'none', color: 'white', fontSize: '14px', outline: 'none', width: '100%' }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Sport filter */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '28px' }}>
          {SPORTS.map(s => (
            <button key={s} type="button" onClick={() => setSport(s)}
              style={{
                padding: '8px 18px', borderRadius: '20px',
                background: sport === s ? '#fb923c' : '#0f1f33',
                color: sport === s ? 'black' : '#9ca3af',
                fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                whiteSpace: 'nowrap', touchAction: 'manipulation',
                border: sport === s ? 'none' : '1px solid #1a2740'
              }}>
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#374151' }}>
            Loading events...
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured.length > 0 && sport === 'All' && !search && (
              <div style={{ marginBottom: '36px' }}>
                <h2 style={{ fontWeight: 900, fontSize: '18px', marginBottom: '16px' }}>
                  ⭐ Featured Events
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                  {featured.map(e => (
                    <EventCard key={e.id} event={e}
                      minPrice={getMinPrice(e.id)}
                      availability={getAvailability(e.id)}
                      featured />
                  ))}
                </div>
              </div>
            )}

            {/* All events */}
            <div>
              <h2 style={{ fontWeight: 900, fontSize: '18px', marginBottom: '16px' }}>
                {sport === 'All' ? 'All Events' : `${sport} Events`}{' '}
                <span style={{ color: '#374151', fontSize: '14px', fontWeight: 400 }}>
                  ({filtered.length})
                </span>
              </h2>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px', background: '#0a1628', borderRadius: '20px', border: '1px solid #1a2740' }}>
                  <Ticket size={48} color="#374151" style={{ margin: '0 auto 14px' }} />
                  <p style={{ color: '#374151', fontSize: '16px' }}>No events found</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                  {filtered.map(e => (
                    <EventCard key={e.id} event={e}
                      minPrice={getMinPrice(e.id)}
                      availability={getAvailability(e.id)} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EventCard({ event, minPrice, availability, featured }: {
  event: Event;
  minPrice: number | null;
  availability: { total: number; sold: number; pct: number };
  featured?: boolean;
}) {
  const daysLeft = Math.floor((new Date(event.event_date).getTime() - Date.now()) / 86400000);
  const isSoldOut = availability.pct >= 100;
  const isAlmostSold = availability.pct >= 85;

  return (
    <Link href={`/tickets/${event.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#0a1628',
        border: `1px solid ${featured ? 'rgba(251,146,60,0.25)' : '#1a2740'}`,
        borderRadius: '18px', overflow: 'hidden',
        transition: 'transform 0.15s, border-color 0.15s',
        cursor: 'pointer'
      }}>
        {/* Ticket header with team colors */}
        <div style={{
          background: `linear-gradient(135deg, ${event.home_team_color || '#1a3a5c'} 0%, #0a1628 40%, ${event.away_team_color || '#3a1a1a'} 100%)`,
          padding: '20px 18px', position: 'relative', overflow: 'hidden'
        }}>
          {/* Holographic shimmer */}
          <div style={{
            position: 'absolute', top: 0, left: '-100%',
            width: '60%', height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
            transform: 'skewX(-15deg)',
          }} />

          {/* Competition badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{
              background: 'rgba(0,0,0,0.4)',
              color: 'white', fontSize: '10px', fontWeight: 700,
              padding: '4px 10px', borderRadius: '20px',
              textTransform: 'uppercase', letterSpacing: '0.06em'
            }}>
              {event.emoji} {event.competition}
            </span>
            {featured && (
              <span style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24', fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px' }}>
                ⭐ FEATURED
              </span>
            )}
          </div>

          {/* Teams */}
          {event.home_team || event.away_team ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <p style={{ fontSize: '32px', marginBottom: '6px' }}>{event.home_team_flag}</p>
                <p style={{ fontWeight: 900, fontSize: '14px', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                  {event.home_team}
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '0 12px' }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 900, fontSize: '18px' }}>VS</p>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <p style={{ fontSize: '32px', marginBottom: '6px' }}>{event.away_team_flag}</p>
                <p style={{ fontWeight: 900, fontSize: '14px', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                  {event.away_team}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <p style={{ fontWeight: 900, fontSize: '18px', color: 'white' }}>{event.title}</p>
            </div>
          )}
        </div>

        {/* Ticket body */}
        <div style={{ padding: '16px' }}>
          {/* Date / venue */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={12} color="#6b7280" />
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                {new Date(event.event_date).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={12} color="#6b7280" />
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>{event.event_time?.slice(0, 5)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <MapPin size={12} color="#6b7280" />
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>{event.venue_flag} {event.venue_city}</span>
            </div>
          </div>

          <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '12px' }}>
            {event.venue_name}
          </p>

          {/* Availability bar */}
          {availability.total > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ height: '3px', background: '#1a2740', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' }}>
                <div style={{
                  height: '100%', borderRadius: '2px',
                  width: `${availability.pct}%`,
                  background: availability.pct >= 90 ? '#ef4444' : availability.pct >= 70 ? '#fbbf24' : '#22c55e',
                  transition: 'width 0.3s'
                }} />
              </div>
              <p style={{ color: '#374151', fontSize: '10px' }}>
                {isSoldOut ? '🔴 Sold Out' : isAlmostSold ? `🔥 Only ${availability.total - availability.sold} left` : `${availability.total - availability.sold} tickets available`}
              </p>
            </div>
          )}

          {/* Price + CTA */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '11px' }}>Starting from</p>
              <p style={{ fontWeight: 900, fontSize: '22px', fontFamily: 'monospace', color: '#22c55e' }}>
                {minPrice !== null ? `$${minPrice}` : 'Free'}
              </p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: isSoldOut ? '#374151' : 'linear-gradient(135deg, #fb923c, #f97316)',
              color: isSoldOut ? '#6b7280' : 'black',
              padding: '11px 18px', borderRadius: '11px',
              fontWeight: 900, fontSize: '13px',
              boxShadow: isSoldOut ? 'none' : '0 4px 15px rgba(251,146,60,0.3)'
            }}>
              {isSoldOut ? 'Sold Out' : (
                <>
                  {daysLeft === 0 ? 'Today!' : daysLeft <= 3 ? `${daysLeft}d left!` : 'Get Tickets'}
                  <ArrowRight size={14} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}