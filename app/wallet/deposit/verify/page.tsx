"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, RefreshCw, Trophy } from 'lucide-react';

export default function DepositVerifyPage() {
  const router = useRouter();
  const [reference, setReference] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    if (!reference) { setStatus('failed'); return; }
    const verify = async () => {
      try {
        const res = await fetch('/api/wallet/deposit/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference }),
        });
        const data = await res.json();
        if (data.success) {
          setAmount(data.amount || 0);
          setStatus('success');
          setTimeout(() => router.push('/account?tab=wallet'), 3000);
        } else {
          setStatus('failed');
        }
      } catch {
        setStatus('failed');
      }
    };
    verify();
  }, [reference]);

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      setReference(sp.get('reference') || sp.get('trxref'));
    } catch {}
  }, []);

  return (
    <div style={{
      minHeight: '100dvh', background: '#0a1628',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '24px',
      fontFamily: '-apple-system, sans-serif', color: 'white'
    }}>
      <div style={{ maxWidth: '420px', width: '100%', textAlign: 'center' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '32px' }}>
          <div style={{ width: '32px', height: '32px', background: '#22c55e', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={16} color="black" />
          </div>
          <span style={{ fontWeight: 900, fontSize: '17px' }}>GLOBAL<span style={{ color: '#22c55e' }}>HUB</span></span>
        </Link>

        {status === 'loading' && (
          <>
            <RefreshCw size={52} color="#22c55e" style={{ margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
            <h2 style={{ fontWeight: 900, fontSize: '24px', marginBottom: '10px' }}>Verifying Deposit...</h2>
            <p style={{ color: '#6b7280' }}>Please wait while we confirm your payment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ width: '90px', height: '90px', background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <CheckCircle size={48} color="#22c55e" />
            </div>
            <h2 style={{ fontWeight: 900, fontSize: '28px', marginBottom: '10px' }}>Deposit Successful! 🎉</h2>
            {amount > 0 && <p style={{ color: '#22c55e', fontSize: '22px', fontWeight: 900, fontFamily: 'monospace', marginBottom: '10px' }}>${amount.toFixed(2)} added</p>}
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>Your wallet has been updated. Redirecting to your wallet...</p>
            <Link href="/account?tab=wallet" style={{ display: 'inline-block', background: '#22c55e', color: 'black', padding: '13px 28px', borderRadius: '11px', fontWeight: 900, textDecoration: 'none' }}>
              View Wallet →
            </Link>
          </>
        )}

        {status === 'failed' && (
          <>
            <div style={{ width: '90px', height: '90px', background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <XCircle size={48} color="#f87171" />
            </div>
            <h2 style={{ fontWeight: 900, fontSize: '24px', marginBottom: '10px' }}>Deposit Failed</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>Payment could not be verified. Contact support if funds were debited.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <Link href="/account?tab=wallet" style={{ display: 'inline-block', background: '#1a2740', color: 'white', padding: '12px 22px', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>
                Back to Wallet
              </Link>
              <a href="mailto:support.globalhub.team@gmail.com" style={{ display: 'inline-block', background: '#22c55e', color: 'black', padding: '12px 22px', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>
                Contact Support
              </a>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}