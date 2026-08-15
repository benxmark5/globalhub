"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Calendar, Clock, MapPin,
  Ticket, Shield, Zap, CheckCircle,
  Plus, Minus, Star, CreditCard,
  Wallet, RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCurrency } from '../../lib/useCurrency';
import { toLocalAmount, formatAmount } from '../../lib/currency';

type Event = {
  id: string; title: string; subtitle: string;
  competition: string; emoji: string;
  home_team: string; away_team: string;
  home_team_flag: string; away_team_flag: string;
  home_team_color: string; away_team_color: string;
  venue_name: string; venue_city: string;
  venue_country: string; venue_flag: string;
  event_date: string; event_time: string;
  gates_open: string; venue_capacity: number;
  cover_color_1: string; cover_color_2: string;
};

type Tier = {
  id: string; name: string; description: string;
  color: string; badge: string; section: string;
  price_usd: number; total_quantity: number;
  sold_quantity: number; max_per_order: number;
  perks: string[]; is_seated: boolean; is_active: boolean;
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currency } = useCurrency();
  const [event, setEvent] = useState<Event | null>(null);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [payMethod, setPayMethod] = useState<'paystack' | 'wallet'>('paystack');
  const [walletBalance, setWalletBalance] = useState(0);
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: { full_name?: string } } | null>(null);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/tickets/events?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data.event);
        setTiers(data.tiers || []);
        if (data.tiers?.length > 0) setSelectedTier(data.tiers[0]);
      }
      setLoading(false);
    };
    load();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setBuyerName(session.user.user_metadata?.full_name || '');
        // Load wallet balance
        supabase.from('wallets').select('available_balance')
          .eq('user_id', session.user.id).single()
          .then(({ data: w }) => setWalletBalance(w?.available_balance || 0));
      }
    });
  }, [id]);

  const handleBuy = async () => {
    if (!user) { router.push('/login'); return; }
    if (!selectedTier || !event) return;
    if (!buyerName.trim()) { setError('Please enter your name'); return; }
    setProcessing(true);
    setError('');

    try {
      const res = await fetch('/api/tickets/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          eventId: event.id,
          tierId: selectedTier.id,
          quantity,
          paymentMethod: payMethod,
          buyerName,
          buyerEmail: user.email,
          buyerPhone,
          unitPriceUsd: selectedTier.price_usd,
        }),
      });

      const data = await res.json();
      if (!data.success) { setError(data.error || 'Purchase failed'); return; }

      if (payMethod === 'paystack' && data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        setSuccess(true);
        setTimeout(() => router.push('/my-tickets'), 3000);
      }
    } catch { setError('Connection error. Try again.'); }
    finally { setProcessing(false); }
  };

  if (loading) return (
    <div style={{ minHeight: '100dvh', background: '#060f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: '-apple-system, sans-serif' }}>
      <p style={{ color: '#374151' }}>Loading event...</p>
    </div>
  );

  if (!event) return (
    <div style={{ minHeight: '100dvh', background: '#060f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: '-apple-system, sans-serif' }}>
      <p style={{ color: '#f87171' }}>Event not found</p>
    </div>
  );

  if (success) return (
    <div style={{ minHeight: '100dvh', background: '#060f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: '-apple-system, sans-serif', color: 'white' }}>
      <div style={{ maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ width: '88px', height: '88px', background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle size={46} color="#22c55e" />
        </div>
        <h2 style={{ fontWeight: 900, fontSize: '28px', marginBottom: '12px' }}>Tickets Confirmed! 🎫</h2>
        <p style={{ color: '#9ca3af', marginBottom: '24px', lineHeight: 1.6 }}>
          Your {quantity} ticket{quantity > 1 ? 's are' : ' is'} ready. Redirecting to My Tickets...
        </p>
        <Link href="/my-tickets" style={{ display: 'inline-block', background: '#fb923c', color: 'black', padding: '14px 28px', borderRadius: '12px', fontWeight: 900, textDecoration: 'none' }}>
          View My Tickets →
        </Link>
      </div>
    </div>
  );

  const totalUsd = selectedTier ? selectedTier.price_usd * quantity : 0;
  const totalLocal = toLocalAmount(totalUsd, currency);
  const displayTotal = formatAmount(totalLocal, currency);
  const canUseWallet = walletBalance >= totalUsd;

  return (
    <div style={{
      minHeight: '100dvh', background: '#060f1e', color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      paddingBottom: '90px'
    }}>

      {/* Back */}
      <div style={{ padding: '14px 16px', position: 'sticky', top: 0, zIndex: 50, background: 'rgba(6,15,30,0.97)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #1a2740' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/tickets" style={{ color: '#9ca3af', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 700 }}>
            <ArrowLeft size={16} /> Events
          </Link>
          <span style={{ color: '#374151' }}>·</span>
          <span style={{ color: '#9ca3af', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {event.title}
          </span>
        </div>
      </div>

      {/* Event header */}
      <div style={{
        background: `linear-gradient(135deg, ${event.home_team_color || '#1a3a5c'} 0%, #0a1628 45%, ${event.away_team_color || '#3a1a1a'} 100%)`,
        padding: '32px 16px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)' }} />
        <div style={{ position: 'relative', maxWidth: '680px', margin: '0 auto' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>
            {event.emoji} {event.competition}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '48px', marginBottom: '8px' }}>{event.home_team_flag}</p>
              <p style={{ fontWeight: 900, fontSize: '18px', color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                {event.home_team}
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '10px 20px' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 900, fontSize: '24px' }}>VS</p>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '48px', marginBottom: '8px' }}>{event.away_team_flag}</p>
              <p style={{ fontWeight: 900, fontSize: '18px', color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                {event.away_team}
              </p>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>{event.subtitle}</p>
        </div>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '20px 16px' }}>

        {/* Event info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '20px' }}>
          {[
            { icon: Calendar, label: 'Date', value: new Date(event.event_date).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' }) },
            { icon: Clock, label: 'Kick-off', value: event.event_time?.slice(0, 5) },
            { icon: MapPin, label: 'City', value: `${event.venue_flag} ${event.venue_city}` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ background: '#0a1628', border: '1px solid #1a2740', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
              <Icon size={16} color="#6b7280" style={{ margin: '0 auto 6px' }} />
              <p style={{ color: '#374151', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</p>
              <p style={{ color: 'white', fontSize: '12px', fontWeight: 700 }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Venue details expandable */}
        <div style={{ background: '#0a1628', border: '1px solid #1a2740', borderRadius: '14px', overflow: 'hidden', marginBottom: '20px' }}>
          <button type="button" onClick={() => setShowDetails(!showDetails)}
            style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', touchAction: 'manipulation' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color="#6b7280" />
              <span style={{ fontWeight: 700, fontSize: '14px' }}>{event.venue_name}</span>
            </div>
            {showDetails ? <ChevronUp size={16} color="#6b7280" /> : <ChevronDown size={16} color="#6b7280" />}
          </button>
          {showDetails && (
            <div style={{ padding: '0 16px 16px', borderTop: '1px solid #1a2740' }}>
              <div style={{ paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { l: 'Stadium', v: event.venue_name },
                  { l: 'City', v: event.venue_city },
                  { l: 'Country', v: `${event.venue_flag} ${event.venue_country}` },
                  { l: 'Capacity', v: event.venue_capacity ? event.venue_capacity.toLocaleString() : 'TBC' },
                  { l: 'Gates Open', v: event.gates_open?.slice(0, 5) || 'TBC' },
                ].map(item => (
                  <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280', fontSize: '13px' }}>{item.l}</span>
                    <span style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>{item.v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ticket Tiers */}
        <h2 style={{ fontWeight: 900, fontSize: '18px', marginBottom: '14px' }}>
          Select Ticket Tier
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {tiers.map(tier => {
            const avail = tier.total_quantity - tier.sold_quantity;
            const pct = Math.round((tier.sold_quantity / tier.total_quantity) * 100);
            const isSoldOut = avail <= 0;
            const isSelected = selectedTier?.id === tier.id;

            return (
              <div key={tier.id}
                onClick={() => !isSoldOut && setSelectedTier(tier)}
                style={{
                  background: isSelected ? `${tier.color}10` : '#0a1628',
                  border: `2px solid ${isSelected ? tier.color : '#1a2740'}`,
                  borderRadius: '14px', padding: '16px',
                  cursor: isSoldOut ? 'not-allowed' : 'pointer',
                  opacity: isSoldOut ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        background: `${tier.color}20`, color: tier.color,
                        fontSize: '12px', fontWeight: 900,
                        padding: '3px 10px', borderRadius: '20px'
                      }}>
                        {tier.badge} {tier.name}
                      </span>
                      {isSoldOut && <span style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px' }}>SOLD OUT</span>}
                      {!isSoldOut && avail <= 20 && <span style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px' }}>🔥 {avail} left</span>}
                    </div>
                    <p style={{ color: '#6b7280', fontSize: '13px' }}>{tier.description}</p>
                    {tier.section && (
                      <p style={{ color: '#374151', fontSize: '12px', marginTop: '2px' }}>
                        📍 {tier.section} {tier.is_seated ? '· Reserved seating' : '· General admission'}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                    <p style={{ fontWeight: 900, fontSize: '22px', fontFamily: 'monospace', color: tier.color }}>
                      ${tier.price_usd}
                    </p>
                    <p style={{ color: '#374151', fontSize: '11px' }}>per ticket</p>
                  </div>
                </div>

                {/* Perks */}
                {tier.perks && tier.perks.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {tier.perks.map(perk => (
                      <span key={perk} style={{
                        background: `${tier.color}12`,
                        color: tier.color,
                        fontSize: '11px', fontWeight: 600,
                        padding: '3px 8px', borderRadius: '20px'
                      }}>
                        ✓ {perk}
                      </span>
                    ))}
                  </div>
                )}

                {/* Availability */}
                <div style={{ height: '3px', background: '#1a2740', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '2px', width: `${pct}%`, background: pct >= 90 ? '#ef4444' : pct >= 70 ? '#fbbf24' : tier.color }} />
                </div>
                <p style={{ color: '#374151', fontSize: '10px', marginTop: '4px' }}>
                  {avail > 0 ? `${avail} of ${tier.total_quantity} available` : 'Sold out'}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quantity */}
        {selectedTier && (
          <div style={{ background: '#0a1628', border: '1px solid #1a2740', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
            <p style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7280', marginBottom: '12px' }}>
              Quantity
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#1a2740', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', touchAction: 'manipulation' }}>
                <Minus size={16} />
              </button>
              <p style={{ fontWeight: 900, fontSize: '24px', fontFamily: 'monospace', color: 'white', minWidth: '32px', textAlign: 'center' }}>
                {quantity}
              </p>
              <button type="button" onClick={() => setQuantity(Math.min(selectedTier.max_per_order, quantity + 1, selectedTier.total_quantity - selectedTier.sold_quantity))}
                style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#1a2740', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', touchAction: 'manipulation' }}>
                <Plus size={16} />
              </button>
              <p style={{ color: '#6b7280', fontSize: '12px' }}>
                max {selectedTier.max_per_order} per order
              </p>
            </div>

            <div style={{ borderTop: '1px solid #1a2740', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '12px' }}>Total</p>
                  <p style={{ fontWeight: 900, fontSize: '26px', fontFamily: 'monospace', color: '#22c55e', lineHeight: 1 }}>
                    {displayTotal}
                  </p>
                  <p style={{ color: '#374151', fontSize: '11px' }}>= ${totalUsd.toFixed(2)} USD</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: '#6b7280', fontSize: '12px' }}>{quantity} × ${selectedTier.price_usd}</p>
                  <p style={{ color: '#9ca3af', fontSize: '12px' }}>{selectedTier.name}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Buyer details */}
        <div style={{ background: '#0a1628', border: '1px solid #1a2740', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
          <p style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7280', marginBottom: '12px' }}>
            Ticket Holder Details
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                Full Name *
              </label>
              <input type="text" value={buyerName} onChange={e => setBuyerName(e.target.value)}
                placeholder="As shown on your ID"
                style={{ width: '100%', background: '#060f1e', border: '1.5px solid #1a2740', borderRadius: '10px', padding: '12px 14px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                Phone (optional)
              </label>
              <input type="tel" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)}
                placeholder="+1 234 567 8900"
                style={{ width: '100%', background: '#060f1e', border: '1.5px solid #1a2740', borderRadius: '10px', padding: '12px 14px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7280', marginBottom: '12px' }}>
            Payment Method
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button type="button" onClick={() => setPayMethod('paystack')}
              style={{
                padding: '14px', borderRadius: '12px', border: 'none',
                background: payMethod === 'paystack' ? 'rgba(34,197,94,0.1)' : '#0a1628',
                border: `2px solid ${payMethod === 'paystack' ? '#22c55e' : '#1a2740'}`,
                cursor: 'pointer', textAlign: 'left', touchAction: 'manipulation'
              }}>
              <CreditCard size={20} color={payMethod === 'paystack' ? '#22c55e' : '#6b7280'} style={{ marginBottom: '8px' }} />
              <p style={{ fontWeight: 700, fontSize: '13px', color: payMethod === 'paystack' ? '#22c55e' : 'white', marginBottom: '2px' }}>
                Card / Mobile
              </p>
              <p style={{ color: '#6b7280', fontSize: '11px' }}>
                Visa, Mastercard, M-Pesa
              </p>
            </button>
            <button type="button" onClick={() => canUseWallet && setPayMethod('wallet')}
              style={{
                padding: '14px', borderRadius: '12px', border: 'none',
                background: payMethod === 'wallet' ? 'rgba(96,165,250,0.1)' : '#0a1628',
                border: `2px solid ${payMethod === 'wallet' ? '#60a5fa' : '#1a2740'}`,
                cursor: canUseWallet ? 'pointer' : 'not-allowed',
                textAlign: 'left', touchAction: 'manipulation',
                opacity: !user ? 0.5 : 1
              }}>
              <Wallet size={20} color={payMethod === 'wallet' ? '#60a5fa' : '#6b7280'} style={{ marginBottom: '8px' }} />
              <p style={{ fontWeight: 700, fontSize: '13px', color: payMethod === 'wallet' ? '#60a5fa' : 'white', marginBottom: '2px' }}>
                Wallet Balance
              </p>
              <p style={{ color: canUseWallet ? '#22c55e' : '#f87171', fontSize: '11px' }}>
                ${walletBalance.toFixed(2)} available
              </p>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px' }}>
            <p style={{ color: '#f87171', fontSize: '13px' }}>⚠️ {error}</p>
          </div>
        )}

        {/* Buy button */}
        <button type="button" onClick={handleBuy}
          disabled={processing || !selectedTier}
          style={{
            width: '100%',
            background: processing || !selectedTier ? '#1a2740' : 'linear-gradient(135deg, #fb923c, #f97316)',
            color: processing || !selectedTier ? '#374151' : 'black',
            border: 'none', borderRadius: '14px',
            padding: '20px', fontSize: '17px', fontWeight: 900,
            cursor: processing || !selectedTier ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            boxShadow: !selectedTier || processing ? 'none' : '0 8px 25px rgba(251,146,60,0.3)',
            marginBottom: '12px', touchAction: 'manipulation'
          }}>
          {processing
            ? <><RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
            : <><Ticket size={18} /> Purchase {quantity} Ticket{quantity > 1 ? 's' : ''} · {displayTotal}</>
          }
        </button>

        {/* Trust */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { icon: Shield, label: 'Official Verified' },
            { icon: Zap, label: 'Instant QR Delivery' },
            { icon: CheckCircle, label: 'Secure Checkout' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Icon size={12} color="#374151" />
              <span style={{ color: '#374151', fontSize: '11px' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}