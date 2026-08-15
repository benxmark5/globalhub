"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Download, Share2,
  CheckCircle, XCircle, Clock,
  MapPin, Calendar, Shield
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

type FullTicket = {
  ticket: {
    id: string; ticket_number: string;
    section: string; row_number: string;
    seat_number: string; gate: string;
    qr_data: string; barcode_data: string;
    status: string; created_at: string;
  };
  event: {
    id: string; title: string; subtitle: string;
    competition: string; emoji: string;
    home_team: string; away_team: string;
    home_team_flag: string; away_team_flag: string;
    home_team_color: string; away_team_color: string;
    venue_name: string; venue_city: string;
    venue_country: string; venue_flag: string;
    event_date: string; event_time: string;
    gates_open: string;
    cover_color_1: string; cover_color_2: string;
  };
  tier: {
    name: string; color: string; badge: string;
    section: string; is_seated: boolean;
  };
  order: {
    order_number: string; quantity: number;
    unit_price_usd: number; buyer_name: string;
    buyer_email: string; payment_method: string;
  };
};

// CSS barcode component
function Barcode({ data }: { data: string }) {
  const bars = data.split('').map(c => c.charCodeAt(0));
  const pattern: number[] = [];
  bars.forEach(code => {
    for (let i = 0; i < 8; i++) {
      pattern.push(((code >> (7 - i)) & 1) ? (Math.random() > 0.5 ? 3 : 2) : 1);
    }
  });
  // Normalize to create visible barcode
  const finalPattern = Array.from({ length: 80 }, (_, i) =>
    Math.sin(i * 0.7 + data.charCodeAt(i % data.length) * 0.1) > 0.3 ? 2 : 1
  );

  return (
    <div style={{ display: 'flex', alignItems: 'stretch', height: '50px', gap: '1px' }}>
      {finalPattern.map((w, i) => (
        <div key={i} style={{
          width: `${w}px`,
          background: i % 5 === 0 ? 'transparent' : '#000',
          flexShrink: 0
        }} />
      ))}
    </div>
  );
}

export default function TicketViewPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const router = useRouter();
  const [data, setData] = useState<FullTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) { router.push('/login'); return; }
      setUser(session.user);
      fetch(`/api/tickets/my-tickets?userId=${session.user.id}&ticketId=${ticketId}`)
        .then(r => r.json())
        .then(d => { setData(d); setLoading(false); });
    });
  }, [ticketId]);

  if (loading) return (
    <div style={{ minHeight: '100dvh', background: '#060f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: '-apple-system, sans-serif' }}>
      <p style={{ color: '#374151' }}>Loading ticket...</p>
    </div>
  );

  if (!data?.ticket || !data?.event) return (
    <div style={{ minHeight: '100dvh', background: '#060f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: '-apple-system, sans-serif' }}>
      <p style={{ color: '#f87171' }}>Ticket not found</p>
    </div>
  );

  const { ticket, event, tier, order } = data;
  const isValid = ticket.status === 'valid';
  const eventDate = new Date(event.event_date);
  const isPast = eventDate < new Date();
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticket.qr_data)}&color=000000&bgcolor=FFFFFF&margin=10`;

  return (
    <div style={{
      minHeight: '100dvh', background: '#060f1e', color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      paddingBottom: '90px'
    }}>

      {/* Header */}
      <div style={{ background: '#0a1628', borderBottom: '1px solid #1a2740', padding: '14px 16px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/my-tickets" style={{ color: '#9ca3af', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700 }}>
            <ArrowLeft size={16} /> My Tickets
          </Link>
          <button type="button"
            onClick={() => { if (navigator.share) { navigator.share({ title: event.title, text: `My ticket for ${event.title}`, url: window.location.href }); } }}
            style={{ background: '#1a2740', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#9ca3af', touchAction: 'manipulation', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Share2 size={16} />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Status banner */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: isValid ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${isValid ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
          borderRadius: '12px', padding: '12px 16px', marginBottom: '20px'
        }}>
          {isValid ? <CheckCircle size={18} color="#22c55e" /> : <XCircle size={18} color="#f87171" />}
          <div>
            <p style={{ fontWeight: 700, fontSize: '14px', color: isValid ? '#22c55e' : '#f87171' }}>
              {isValid ? (isPast ? 'Event Passed' : 'Valid Ticket') : 'Ticket Invalid'}
            </p>
            <p style={{ color: '#6b7280', fontSize: '11px' }}>
              {ticket.ticket_number}
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════
            FIFA-STYLE TICKET
        ══════════════════════════════════════ */}
        <div
          onClick={() => setFlipped(!flipped)}
          style={{ cursor: 'pointer', marginBottom: '20px' }}
        >

          {!flipped ? (
            /* ── FRONT ── */
            <div style={{
              background: `linear-gradient(135deg, ${event.cover_color_1 || '#0a1628'} 0%, ${event.home_team_color || '#1a3a5c'} 40%, ${event.away_team_color || '#3a1a1a'} 70%, ${event.cover_color_2 || '#0a1628'} 100%)`,
              borderRadius: '20px', overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              position: 'relative',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              {/* Holographic shimmer overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.03) 50%, transparent 70%)',
                pointerEvents: 'none', zIndex: 1
              }} />

              {/* GlobalHub logo bar */}
              <div style={{
                background: 'rgba(0,0,0,0.5)',
                padding: '10px 16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.08)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <div style={{ width: '22px', height: '22px', background: '#22c55e', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>🏆</div>
                  <span style={{ fontWeight: 900, fontSize: '13px', color: 'white' }}>GLOBAL<span style={{ color: '#22c55e' }}>HUB</span></span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' }}>{event.competition}</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', fontFamily: 'monospace' }}>{ticket.ticket_number}</p>
                </div>
              </div>

              {/* Main content */}
              <div style={{ padding: '24px 20px', position: 'relative', zIndex: 2 }}>

                {/* Teams display */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <p style={{ fontSize: '44px', marginBottom: '6px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>
                      {event.home_team_flag}
                    </p>
                    <p style={{ fontWeight: 900, fontSize: '16px', color: 'white', textShadow: '0 2px 6px rgba(0,0,0,0.8)', letterSpacing: '-0.5px' }}>
                      {event.home_team}
                    </p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '10px', padding: '8px 14px'
                    }}>
                      <p style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 900, fontSize: '18px', letterSpacing: '0.1em' }}>VS</p>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', textTransform: 'uppercase', marginTop: '2px' }}>
                        {event.emoji}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <p style={{ fontSize: '44px', marginBottom: '6px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>
                      {event.away_team_flag}
                    </p>
                    <p style={{ fontWeight: 900, fontSize: '16px', color: 'white', textShadow: '0 2px 6px rgba(0,0,0,0.8)', letterSpacing: '-0.5px' }}>
                      {event.away_team}
                    </p>
                  </div>
                </div>

                {/* Date / Venue row */}
                <div style={{
                  background: 'rgba(0,0,0,0.45)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px', padding: '12px 16px',
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: '10px', marginBottom: '16px'
                }}>
                  {[
                    { l: 'Date', v: eventDate.toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) },
                    { l: 'Kick-off', v: event.event_time?.slice(0, 5) },
                    { l: 'Stadium', v: event.venue_name },
                    { l: 'City', v: `${event.venue_flag} ${event.venue_city}` },
                  ].map(item => (
                    <div key={item.l}>
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>
                        {item.l}
                      </p>
                      <p style={{ color: 'white', fontSize: '12px', fontWeight: 700 }}>
                        {item.v}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Seat info */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px', marginBottom: '16px'
                }}>
                  {[
                    { l: 'Tier', v: tier?.badge + ' ' + tier?.name },
                    { l: 'Section', v: ticket.section || tier?.section || 'GA' },
                    { l: 'Row', v: ticket.row_number || 'GA' },
                    { l: 'Gate', v: ticket.gate || 'G1' },
                  ].map(item => (
                    <div key={item.l} style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px', padding: '8px',
                      textAlign: 'center'
                    }}>
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '8px', textTransform: 'uppercase', marginBottom: '4px' }}>{item.l}</p>
                      <p style={{ color: 'white', fontSize: '11px', fontWeight: 900 }}>{item.v}</p>
                    </div>
                  ))}
                </div>

                {/* Holographic strip */}
                <div style={{
                  height: '4px', borderRadius: '2px', marginBottom: '12px',
                  background: `linear-gradient(90deg, ${tier?.color || '#22c55e'}, #60a5fa, #fbbf24, #f87171, ${tier?.color || '#22c55e'})`
                }} />

                {/* Buyer name */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Ticket Holder</p>
                    <p style={{ color: 'white', fontWeight: 900, fontSize: '13px' }}>
                      {order?.buyer_name?.toUpperCase() || 'GUEST'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '9px', textTransform: 'uppercase', marginBottom: '2px' }}>Seat</p>
                    <p style={{ color: 'white', fontWeight: 900, fontSize: '13px' }}>
                      {ticket.seat_number !== 'GA' ? ticket.seat_number : 'GA'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tear-off QR section */}
              <div style={{
                borderTop: '2px dashed rgba(255,255,255,0.15)',
                background: 'rgba(0,0,0,0.6)',
                padding: '16px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', gap: '12px'
              }}>
                {/* QR Code */}
                <div style={{
                  background: 'white', padding: '6px',
                  borderRadius: '8px', flexShrink: 0
                }}>
                  <img
                    src={qrUrl}
                    alt="QR Code"
                    width={88} height={88}
                    style={{ display: 'block', borderRadius: '4px' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>

                {/* Ticket info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ marginBottom: '8px' }}>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', textTransform: 'uppercase', marginBottom: '2px' }}>Ticket No.</p>
                    <p style={{ color: 'white', fontWeight: 900, fontSize: '13px', fontFamily: 'monospace' }}>
                      {ticket.ticket_number}
                    </p>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', textTransform: 'uppercase', marginBottom: '2px' }}>Order No.</p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontFamily: 'monospace' }}>
                      {order?.order_number}
                    </p>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    background: isValid ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                    border: `1px solid ${isValid ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    borderRadius: '20px', padding: '4px 10px',
                    width: 'fit-content'
                  }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isValid ? '#22c55e' : '#f87171' }} />
                    <span style={{ color: isValid ? '#22c55e' : '#f87171', fontSize: '10px', fontWeight: 700 }}>
                      {isValid ? 'ADMIT ONE' : 'INVALID'}
                    </span>
                  </div>
                </div>

                {/* Barcode */}
                <div style={{
                  background: 'white',
                  padding: '6px 8px',
                  borderRadius: '6px', flexShrink: 0
                }}>
                  <Barcode data={ticket.barcode_data || ticket.ticket_number} />
                  <p style={{ color: '#000', fontSize: '7px', textAlign: 'center', fontFamily: 'monospace', marginTop: '3px', letterSpacing: '0.05em' }}>
                    {ticket.barcode_data?.slice(0, 18) || ticket.ticket_number.slice(0, 18)}
                  </p>
                </div>
              </div>
            </div>

          ) : (

            /* ── BACK ── */
            <div style={{
              background: '#0f1f33',
              border: '1px solid #1a2740',
              borderRadius: '20px', overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }}>
              <div style={{
                background: `linear-gradient(90deg, ${tier?.color || '#22c55e'}20, transparent)`,
                padding: '16px',
                borderBottom: '1px solid #1a2740'
              }}>
                <p style={{ fontWeight: 900, fontSize: '15px' }}>Ticket Details</p>
                <p style={{ color: '#6b7280', fontSize: '12px' }}>Tap to flip back</p>
              </div>
              <div style={{ padding: '20px' }}>
                {[
                  { l: 'Event', v: event.title },
                  { l: 'Competition', v: event.competition },
                  { l: 'Date & Time', v: `${eventDate.toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at ${event.event_time?.slice(0,5)}` },
                  { l: 'Venue', v: `${event.venue_name}, ${event.venue_city}, ${event.venue_country}` },
                  { l: 'Gates Open', v: event.gates_open?.slice(0,5) || 'TBC' },
                  { l: 'Tier', v: `${tier?.badge} ${tier?.name}` },
                  { l: 'Section', v: ticket.section || tier?.section },
                  { l: 'Row', v: ticket.row_number },
                  { l: 'Seat', v: ticket.seat_number },
                  { l: 'Gate', v: ticket.gate },
                  { l: 'Holder', v: order?.buyer_name },
                  { l: 'Order No.', v: order?.order_number },
                  { l: 'Ticket No.', v: ticket.ticket_number },
                  { l: 'Issued', v: new Date(ticket.created_at).toLocaleString() },
                ].map(item => item.v && (
                  <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #1a2740' }}>
                    <span style={{ color: '#6b7280', fontSize: '13px' }}>{item.l}</span>
                    <span style={{ color: 'white', fontSize: '13px', fontWeight: 600, textAlign: 'right', maxWidth: '60%', fontFamily: item.l.includes('No') ? 'monospace' : 'inherit' }}>{item.v}</span>
                  </div>
                ))}
              </div>
              {/* Terms */}
              <div style={{ background: '#060f1e', padding: '16px', borderTop: '1px solid #1a2740' }}>
                <p style={{ color: '#374151', fontSize: '11px', lineHeight: 1.6 }}>
                  This ticket is issued by GlobalHub on behalf of the event organizer. Valid for one entry only. Lost or stolen tickets will not be replaced. This ticket must be presented at the gate. Ticket holder agrees to all event terms and conditions. No refunds unless event is cancelled.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tap hint */}
        <p style={{ textAlign: 'center', color: '#374151', fontSize: '12px', marginBottom: '20px' }}>
          Tap ticket to {flipped ? 'see front' : 'view details'}
        </p>

        {/* Instructions */}
        <div style={{ background: '#0a1628', border: '1px solid #1a2740', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
          <p style={{ fontWeight: 700, fontSize: '13px', marginBottom: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            How to Enter
          </p>
          {[
            { step: '1', text: 'Arrive before gates close', icon: Clock },
            { step: '2', text: `Head to ${ticket.gate || 'your designated gate'}`, icon: MapPin },
            { step: '3', text: 'Show QR code on screen to scanner', icon: CheckCircle },
            { step: '4', text: 'Barcode on ticket back for manual scan', icon: Shield },
          ].map(({ step, text, icon: Icon }) => (
            <div key={step} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ width: '24px', height: '24px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#22c55e', fontWeight: 900, fontSize: '11px' }}>{step}</span>
              </div>
              <p style={{ color: '#9ca3af', fontSize: '14px' }}>{text}</p>
            </div>
          ))}
        </div>

        {/* Support link */}
        <p style={{ textAlign: 'center', color: '#374151', fontSize: '12px' }}>
          Issues with your ticket?{' '}
          <a href="mailto:support.globalhub.team@gmail.com" style={{ color: '#22c55e', textDecoration: 'none', fontWeight: 700 }}>
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}