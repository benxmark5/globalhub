"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';

// Explicitly mark this route as dynamic to prevent static pre-rendering errors
export const dynamic = 'force-dynamic';

function VerifyContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [details, setDetails] = useState<{
    amount?: number;
    currency?: string;
    reference?: string;
  }>({});

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');

    if (!reference) {
      setStatus('failed');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch('/api/paystack/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference }),
        });
        const data = await res.json();

        if (data.paid) {
          setStatus('success');
          setDetails({
            amount: data.amount,
            currency: data.currency,
            reference: data.reference,
          });
        } else {
          setStatus('failed');
        }
      } catch {
        setStatus('failed');
      }
    };

    verify();
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100dvh', background: '#0a1628',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column',
        gap: '20px', fontFamily: '-apple-system, sans-serif'
      }}>
        <div style={{
          width: '50px', height: '50px',
          border: '3px solid #1a2740',
          borderTop: '3px solid #22c55e',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#6b7280', fontSize: '15px' }}>Verifying your payment...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div style={{
        minHeight: '100dvh', background: '#0a1628',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '24px',
        fontFamily: '-apple-system, sans-serif'
      }}>
        <div style={{ maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '80px', background: 'rgba(34,197,94,0.1)',
            border: '2px solid rgba(34,197,94,0.3)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
          }}>
            <CheckCircle size={40} color="#22c55e" />
          </div>
          <h2 style={{ fontWeight: 900, fontSize: '28px', marginBottom: '10px', color: 'white' }}>
            Payment Successful! 🎉
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '28px', lineHeight: 1.6 }}>
            Your signals are now unlocked and ready!
          </p>
          <div style={{ background: '#0f1f33', border: '1px solid #1a2740', borderRadius: '16px', padding: '20px', marginBottom: '24px', textAlign: 'left' }}>
            <p style={{ color: '#6b7280', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
              Payment Receipt
            </p>
            {[
              { l: 'Status', v: '✅ Paid', c: '#22c55e' },
              { l: 'Amount', v: `${details.currency} ${details.amount?.toLocaleString()}`, c: 'white' },
              { l: 'Reference', v: details.reference || '', c: '#6b7280' },
            ].map(item => (
              <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                <span style={{ color: '#6b7280', fontSize: '13px' }}>{item.l}</span>
                <span style={{ color: item.c, fontSize: '13px', fontWeight: 700, fontFamily: 'monospace' }}>{item.v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link href="/football" style={{ display: 'block', textAlign: 'center', background: '#22c55e', color: 'black', padding: '16px', borderRadius: '12px', fontWeight: 900, fontSize: '16px', textDecoration: 'none', textTransform: 'uppercase' }}>⚽ View Football Signals</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#0a1628', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: '-apple-system, sans-serif' }}>
        <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center', color: 'white' }}>
            <XCircle size={64} color="#f87171" style={{ margin: '0 auto 20px' }} />
            <h2>Payment Failed</h2>
            <Link href="/pricing" style={{ color: '#22c55e' }}>Try again</Link>
        </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}