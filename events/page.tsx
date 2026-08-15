"use client";
import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Radio, CheckCircle, Zap } from 'lucide-react';

type EventItem = {
  id: string; title: string; competition: string;
  status: 'live' | 'upcoming' | 'finished';
  date: string; time: string; venue: string;
  city: string; country: string; flag: string;
  sport: string; emoji: string;
  homeScore?: number; awayScore?: number;
  homeTeam?: string; awayTeam?: string;
};

const EVENTS: EventItem[] = [
  { id:'1', title:'Arsenal vs Chelsea', competition:'Premier League', status:'live', date:'2026-08-07', time:'20:00', venue:'Emirates Stadium', city:'London', country:'UK', flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', sport:'football', emoji:'⚽', homeTeam:'Arsenal', awayTeam:'Chelsea', homeScore:2, awayScore:1 },
  { id:'2', title:'Real Madrid vs Barcelona', competition:'La Liga', status:'upcoming', date:'2026-08-10', time:'21:00', venue:'Santiago Bernabeu', city:'Madrid', country:'Spain', flag:'🇪🇸', sport:'football', emoji:'⚽' },
  { id:'3', title:'AFCON 2026 Group Stage', competition:'AFCON', status:'upcoming', date:'2026-08-15', time:'16:00', venue:'Cairo International', city:'Cairo', country:'Egypt', flag:'🇪🇬', sport:'football', emoji:'🏆' },
  { id:'4', title:'Wimbledon Final', competition:'Wimbledon', status:'finished', date:'2026-07-14', time:'14:00', venue:'All England Club', city:'London', country:'UK', flag:'🇬🇧', sport:'tennis', emoji:'🎾', homeTeam:'Djokovic', awayTeam:'Alcaraz', homeScore:3, awayScore:2 },
  { id:'5', title:'NBA Finals Game 7', competition:'NBA', status:'finished', date:'2026-07-20', time:'21:00', venue:'Chase Center', city:'San Francisco', country:'USA', flag:'🇺🇸', sport:'basketball', emoji:'🏀', homeTeam:'Warriors', awayTeam:'Celtics', homeScore:112, awayScore:108 },
  { id:'6', title:'F1 British Grand Prix', competition:'Formula 1', status:'upcoming', date:'2026-08-25', time:'14:00', venue:'Silverstone', city:'Silverstone', country:'UK', flag:'🇬🇧', sport:'motorsport', emoji:'🏎️' },
  { id:'7', title:'Kenya vs Nigeria', competition:'AFCON Qualifiers', status:'upcoming', date:'2026-08-20', time:'16:00', venue:'Kasarani', city:'Nairobi', country:'Kenya', flag:'🇰🇪', sport:'football', emoji:'⚽' },
];

function Countdown({ date, time }: { date: string; time: string }) {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    const target = new Date(`${date}T${time}`).getTime();
    const update = () => setDiff(Math.max(0, target - Date.now()));
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [date, time]);

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  if (diff === 0) return <span style={{ color: '#22c55e', fontSize: '12px', fontWeight: 700 }}>Starting now!</span>;

  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {[{ v: d, l: 'd' }, { v: h, l: 'h' }, { v: m, l: 'm' }, { v: s, l: 's' }].map(({ v, l }) => (
        <div key={l} style={{ background: '#0a1628', border: '1px solid #1a2740', borderRadius: '6px', padding: '4px 6px', textAlign: 'center', minWidth: '34px' }}>
          <p style={{ fontWeight: 900, fontSize: '14px', fontFamily: 'monospace', color: '#22c55e', lineHeight: 1 }}>{String(v).padStart(2, '0')}</p>
          <p style={{ color: '#374151', fontSize: '9px' }}>{l}</p>
        </div>
      ))}
    </div>
  );
}

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'upcoming' | 'finished'>('all');

  const filtered = EVENTS.filter(e => activeTab === 'all' || e.status === activeTab);
  const liveCount = EVENTS.filter(e => e.status === 'live').length;

  return (
    <div style={{
      minHeight: '100dvh', background: '#060f1e', color: 'white',
      fontFamily: '-apple-system, sans-serif', paddingBottom: '80px'
    }}>
      {/* Header */}
      <div style={{ background: '#0a1628', borderBottom: '1px solid #1a2740', padding: '32px 16px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(24px,4vw,36px)', letterSpacing: '-1px', marginBottom: '6px' }}>
            Sports Events
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Live, upcoming and finished sporting events worldwide</p>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 16px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
          {([
            { id: 'all', label: 'All Events', count: EVENTS.length },
            { id: 'live', label: '🔴 Live', count: liveCount },
            { id: 'upcoming', label: '📅 Upcoming', count: EVENTS.filter(e => e.status === 'upcoming').length },
            { id: 'finished', label: '✅ Finished', count: EVENTS.filter(e => e.status === 'finished').length },
          ] as const).map(tab => (
            <button key={tab.id} type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '9px 16px', borderRadius: '20px', border: 'none',
                background: activeTab === tab.id ? '#22c55e' : '#0f1f33',
                color: activeTab === tab.id ? 'black' : '#9ca3af',
                fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                whiteSpace: 'nowrap', touchAction: 'manipulation',
                border: activeTab === tab.id ? 'none' : '1px solid #1a2740'
              }}>
              {tab.label}
              <span style={{
                background: activeTab === tab.id ? 'rgba(0,0,0,0.2)' : '#1a2740',
                borderRadius: '20px', padding: '1px 6px', fontSize: '11px'
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Events list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(event => (
            <div key={event.id} style={{
              background: '#0a1628',
              border: `1px solid ${event.status === 'live' ? 'rgba(239,68,68,0.3)' : '#1a2740'}`,
              borderRadius: '16px', overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{
                background: event.status === 'live' ? 'rgba(239,68,68,0.06)' : '#0f1f33',
                padding: '12px 16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid #1a2740'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{event.emoji}</span>
                  <p style={{ color: event.status === 'live' ? '#f87171' : '#22c55e', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                    {event.competition}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {event.status === 'live' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '20px', padding: '3px 10px' }}>
                      <span style={{ width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%', display: 'inline-block' }} />
                      <span style={{ color: '#f87171', fontSize: '11px', fontWeight: 700 }}>LIVE</span>
                    </div>
                  )}
                  {event.status === 'finished' && (
                    <span style={{ background: 'rgba(107,114,128,0.15)', color: '#6b7280', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}>
                      FINISHED
                    </span>
                  )}
                </div>
              </div>

              <div style={{ padding: '16px' }}>
                {/* Score or title */}
                {(event.homeTeam || event.awayTeam) ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <p style={{ fontWeight: 900, fontSize: '16px', flex: 1, textAlign: 'left' }}>{event.homeTeam}</p>
                    <div style={{ textAlign: 'center', padding: '0 16px' }}>
                      {event.homeScore !== undefined ? (
                        <p style={{ fontWeight: 900, fontSize: '22px', fontFamily: 'monospace', color: event.status === 'live' ? '#f87171' : 'white' }}>
                          {event.homeScore} - {event.awayScore}
                        </p>
                      ) : (
                        <p style={{ color: '#374151', fontWeight: 700, fontSize: '16px' }}>VS</p>
                      )}
                    </div>
                    <p style={{ fontWeight: 900, fontSize: '16px', flex: 1, textAlign: 'right' }}>{event.awayTeam}</p>
                  </div>
                ) : (
                  <h3 style={{ fontWeight: 900, fontSize: '16px', marginBottom: '14px' }}>{event.title}</h3>
                )}

                {/* Meta */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: event.status === 'upcoming' ? '14px' : '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={12} color="#6b7280" />
                    <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                      {new Date(event.date).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={12} color="#6b7280" />
                    <span style={{ color: '#9ca3af', fontSize: '12px' }}>{event.time}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={12} color="#6b7280" />
                    <span style={{ color: '#9ca3af', fontSize: '12px' }}>{event.flag} {event.city}</span>
                  </div>
                </div>

                {/* Countdown for upcoming */}
                {event.status === 'upcoming' && (
                  <Countdown date={event.date} time={event.time} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}