"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Ticket, ArrowLeft, Calendar, MapPin, CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type TicketData = {
  id: string; ticket_number: string;
  event_id: string; tier_id: string;
  section: string; row_number: string;
  seat_number: string; gate: string;
  status: string; created_at: string;
};
type EventData = { id: string; title: string; competition: string; emoji: string; home_team: string; away_team: string; home_team_flag: string; away_team_flag: string; home_team_color: string; away_team_color: string; venue_name: string; venue_city: string; venue_flag: string; event_date: string; event_time: string; };
type TierData = { id: string; name: string; color: string; badge: string; };

export default function MyTicketsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyRef = searchParams.get('verify');
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [tiers, setTiers] = useState<TierData[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) { router.push('/login'); return; }
      setUser(session.user);
      loadTickets(session.user.id);
    });
  }, []);

  useEffect(() => {
    if (verifyRef && user) {
      verifyPayment(verifyRef);
    }
  }, [verifyRef, user]);

  const verifyPayment = async (ref: string) => {
    setVerifying(true);
    await fetch('/api/tickets/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: ref }),
    });
    if (user) await loadTickets(user.id);
    setVerifying(false);
  };

  const loadTickets = async (userId: string) => {
    setLoading(true);
    const res = await fetch(`/api/tickets/my-tickets?userId=${userId}`);
    if (res.ok) {
      const data = await res.json();
      setTickets(data.tickets || []);
      setEvents(data.events || []);
      setTiers(data.tiers || []);
    }
    setLoading(false);
  };

  const getEvent = (id: string) => events.find(e => e.id === id);
  const getTier = (id: string) => tiers.find(t => t.id === id);

  const upcoming = tickets.filter(t => {
    const event = getEvent(t.event_id);
    return event && new Date(event.event_date) > new Date();
  });
  const past = tickets.filter(t => {
    const event = getEvent(t.event_id);
    return event && new Date(event.event_date) <= new Date();
  });

  return (
    <div style={{ minHeight: '100dvh', background: '#060f1e', color: 'white', fontFamily: '-apple-system, sans-serif', paddingBottom: '90px' }}>

      {/* Header */}
      <div style={{ background: '#0a1628', borderBottom: '1px solid #1a2740', padding: '14px 16px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/" style={{ color: '#9ca3af', textDecoration: 'none' }}><ArrowLeft size={18} /></Link>
            <div>
              <h1 style={{ fontWeight: 900, fontSize: '18px' }}>My Tickets</h1>
              <p style={{ color: '#6b7280', fontSize: '12px' }}>{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <Link href="/tickets" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fb923c', color: 'black', padding: '8px 14px', borderRadius: '9px', fontSize: '12px', fontWeight: 900, textDecoration: 'none' }}>
            <Ticket size={13} /> Browse
          </Link>
        </div>
      </div>

      {verifying && (
        <div style={{ background: 'rgba(34,197,94,0.08)', borderBottom: '1px solid rgba(34,197,94,0.2)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <RefreshCw size={16} color="#22c55e" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ color: '#86efac', fontSize: '13px', fontWeight: 600 }}>Verifying your payment and issuing tickets...</span>
        </div>
      )}

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '20px 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#374151' }}>Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', background: '#0a1628', borderRadius: '20px', border: '1px solid #1a2740' }}>
            <Ticket size={52} color="#374151" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontWeight: 900, fontSize: '20px', marginBottom: '8px' }}>No Tickets Yet</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>Browse events and get your first ticket!</p>
            <Link href="/tickets" style={{ display: 'inline-block', background: '#fb923c', color: 'black', padding: '13px 28px', borderRadius: '12px', fontWeight: 900, textDecoration: 'none' }}>
              Browse Events →
            </Link>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <h2 style={{ fontWeight: 900, fontSize: '16px', marginBottom: '12px', color: '#22c55e' }}>
                  Upcoming ({upcoming.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {upcoming.map(ticket => <TicketPreviewCard key={ticket.id} ticket={ticket} event={getEvent(ticket.event_id)} tier={getTier(ticket.tier_id)} />)}
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <h2 style={{ fontWeight: 900, fontSize: '16px', marginBottom: '12px', color: '#6b7280' }}>
                  Past ({past.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {past.map(ticket => <TicketPreviewCard key={ticket.id} ticket={ticket} event={getEvent(ticket.event_id)} tier={getTier(ticket.tier_id)} past />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function TicketPreviewCard({ ticket, event, tier, past }: { ticket: TicketData; event?: EventData; tier?: TierData; past?: boolean }) {
  if (!event) return null;
  return (
    <Link href={`/my-tickets/${ticket.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: past ? '#0a1628' : 'linear-gradient(135deg, #0a1628, #0f1a10)',
        border: `1px solid ${past ? '#1a2740' : 'rgba(34,197,94,0.2)'}`,
        borderRadius: '16px', overflow: 'hidden',
        opacity: past ? 0.7 : 1
      }}>
        {/* Mini header */}
        <div style={{
          background: `linear-gradient(90deg, ${event.home_team_color || '#1a3a5c'}, #0a1628)`,
          padding: '10px 14px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
            {event.emoji} {event.competition}
          </span>
          <span style={{
            background: past ? '#1a2740' : 'rgba(34,197,94,0.2)',
            color: past ? '#6b7280' : '#22c55e',
            fontSize: '10px', fontWeight: 700,
            padding: '2px 8px', borderRadius: '20px'
          }}>
            {past ? 'PAST' : '✓ VALID'}
          </span>
        </div>
        <div style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 900, fontSize: '15px', marginBottom: '4px', color: 'white' }}>
              {event.home_team_flag} {event.home_team} vs {event.away_team} {event.away_team_flag}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ color: '#6b7280', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={11} /> {new Date(event.event_date).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
              </span>
              <span style={{ color: '#6b7280', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={11} /> {event.venue_flag} {event.venue_city}
              </span>
            </div>
            <p style={{ color: '#374151', fontSize: '11px', marginTop: '4px', fontFamily: 'monospace' }}>
              {ticket.ticket_number}
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
            {tier && (
              <span style={{ background: `${tier.color}20`, color: tier.color, fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px', display: 'block', marginBottom: '4px' }}>
                {tier.badge} {tier.name}
              </span>
            )}
            <p style={{ color: '#374151', fontSize: '11px' }}>{ticket.section}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
