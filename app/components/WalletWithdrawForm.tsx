// app/components/WalletWithdrawForm.tsx
'use client';

import { useEffect, useState, type ReactElement } from 'react';
import { RefreshCw, CheckCircle, Clock, ShieldCheck, Info } from 'lucide-react';

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
export type WithdrawFormData = {
  amount: string;
  payoutMethod: string;
  payoutName: string;
  payoutIdentifier: string;
  payoutExtra: string;
};

type Props = {
  availableBalance: number;
  submitting: boolean;
  error: string;
  onClearError: () => void;
  onSubmit: (data: WithdrawFormData) => Promise<{
    success: boolean;
    reference?: string;
    expiresInSeconds?: number;
  }>;
};

// ─────────────────────────────────────────────────────────
// Supported methods (4 only)
// ─────────────────────────────────────────────────────────
type MethodId = 'mpesa' | 'airtel_money' | 'bank_transfer' | 'paypal';

const METHODS: { id: MethodId; label: string; icon: string }[] = [
  { id: 'mpesa',         label: 'M-Pesa',        icon: '📱' },
  { id: 'airtel_money',  label: 'Airtel Money',  icon: '📱' },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { id: 'paypal',        label: 'PayPal',        icon: '💙' },
];

// ─────────────────────────────────────────────────────────
// Country codes for phone-based payouts
// ─────────────────────────────────────────────────────────
type CountryCode = { code: string; dial: string; flag: string; name: string };

const PHONE_COUNTRIES: CountryCode[] = [
  { code: 'KE', dial: '254', flag: '🇰🇪', name: 'Kenya' },
  { code: 'TZ', dial: '255', flag: '🇹🇿', name: 'Tanzania' },
  { code: 'UG', dial: '256', flag: '🇺🇬', name: 'Uganda' },
  { code: 'RW', dial: '250', flag: '🇷🇼', name: 'Rwanda' },
  { code: 'NG', dial: '234', flag: '🇳🇬', name: 'Nigeria' },
  { code: 'GH', dial: '233', flag: '🇬🇭', name: 'Ghana' },
  { code: 'ZA', dial: '27',  flag: '🇿🇦', name: 'South Africa' },
  { code: 'US', dial: '1',   flag: '🇺🇸', name: 'United States' },
  { code: 'GB', dial: '44',  flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'IN', dial: '91',  flag: '🇮🇳', name: 'India' },
  { code: 'PH', dial: '63',  flag: '🇵🇭', name: 'Philippines' },
  { code: 'PK', dial: '92',  flag: '🇵🇰', name: 'Pakistan' },
];

// ─────────────────────────────────────────────────────────
// Shared styles
// ─────────────────────────────────────────────────────────
const inputSt = {
  width: '100%',
  background: '#060f1e',
  border: '1.5px solid #1a2740',
  borderRadius: '10px',
  padding: '12px 14px',
  color: 'white',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box' as const,
};

const labelSt = {
  display: 'block',
  color: '#9ca3af',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  marginBottom: '7px',
};

// ─────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────
export default function WalletWithdrawForm({
  availableBalance, submitting, error, onClearError, onSubmit,
}: Props): ReactElement {
  const [form, setForm] = useState<WithdrawFormData>({
    amount: '',
    payoutMethod: '',
    payoutName: '',
    payoutIdentifier: '',
    payoutExtra: '',
  });
  const [countryCode, setCountryCode] = useState<string>('KE');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [successState, setSuccessState] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [countdown, setCountdown] = useState('');

  // Live countdown after submission
  useEffect(() => {
    if (!expiresAt) { setCountdown(''); return; }
    const tick = () => {
      const sec = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      setCountdown(`${m}:${s.toString().padStart(2, '0')}`);
      if (sec === 0) setExpiresAt(null);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const handleMethodChange = (method: string) => {
    setForm({
      amount: form.amount,
      payoutMethod: method,
      payoutName: '',
      payoutIdentifier: '',
      payoutExtra: '',
    });
    setPhoneLocal('');
    onClearError();
  };

  // Build the full international phone (dial + local digits)
  const buildPhone = () => {
    const dial = PHONE_COUNTRIES.find(c => c.code === countryCode)?.dial || '';
    const digits = phoneLocal.replace(/\D/g, '');
    return `${dial}${digits}`;
  };

  const handleSubmit = async () => {
    // Client-side validation
    if (!form.amount || parseFloat(form.amount) < 5) return;

    // For phone methods, ensure phone is built
    let identifier = form.payoutIdentifier;
    if (form.payoutMethod === 'mpesa' || form.payoutMethod === 'airtel_money') {
      identifier = buildPhone();
      if (identifier.length < 10) return;
    }

    const payload: WithdrawFormData = {
      ...form,
      payoutIdentifier: identifier,
    };

    const result = await onSubmit(payload);

    if (result.success) {
      setSuccessState(true);
      const expiresIn = result.expiresInSeconds || 1800;
      setExpiresAt(Date.now() + expiresIn * 1000);
      setForm({
        amount: '',
        payoutMethod: form.payoutMethod,
        payoutName: '',
        payoutIdentifier: '',
        payoutExtra: '',
      });
      setPhoneLocal('');
    }
  };

  // ── Success state ──
  if (successState) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <CheckCircle size={48} color="#22c55e" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontWeight: 900, fontSize: '20px', marginBottom: '10px' }}>
          Request Submitted
        </h3>
        <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.6, marginBottom: '12px' }}>
          Your payout is being processed. You&apos;ll get a notification the moment it&apos;s paid.
        </p>

        {countdown && (
          <div style={{
            background: 'rgba(251,191,36,0.08)',
            border: '1px solid rgba(251,191,36,0.2)',
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}>
            <Clock size={18} color="#fbbf24" />
            <span style={{ color: '#fde68a', fontSize: '13px', fontWeight: 600 }}>
              Processing within
            </span>
            <span style={{
              color: '#fbbf24',
              fontWeight: 900,
              fontFamily: 'monospace',
              fontSize: '18px',
            }}>
              {countdown}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() => { setSuccessState(false); setExpiresAt(null); }}
          style={{
            background: '#22c55e',
            color: 'black',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 24px',
            fontWeight: 900,
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}>
          Make Another Request
        </button>
      </div>
    );
  }

  // ── Form state ──
  return (
    <div>
      {/* Info banner — clean copy */}
      <div style={{
        background: 'rgba(34,197,94,0.06)',
        border: '1px solid rgba(34,197,94,0.15)',
        borderRadius: '10px',
        padding: '12px',
        marginBottom: '18px',
        display: 'flex',
        gap: '10px',
      }}>
        <ShieldCheck size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: '1px' }} />
        <p style={{ color: '#86efac', fontSize: '13px', lineHeight: 1.6 }}>
          Payouts are processed within <strong style={{ color: 'white' }}>30 minutes</strong>.
          Available: <strong style={{ color: 'white' }}>${availableBalance.toFixed(2)}</strong>
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '10px',
          padding: '12px',
          marginBottom: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <p style={{ color: '#f87171', fontSize: '13px' }}>⚠️ {error}</p>
          <button
            type="button"
            onClick={onClearError}
            style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
            ×
          </button>
        </div>
      )}

      {/* Amount */}
      <div style={{ marginBottom: '14px' }}>
        <label style={labelSt}>Amount (USD)</label>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#f87171',
            fontWeight: 900,
          }}>$</span>
          <input
            type="number"
            min="5"
            max={availableBalance}
            step="0.01"
            value={form.amount}
            onChange={e => { setForm(p => ({ ...p, amount: e.target.value })); onClearError(); }}
            placeholder="Minimum $5"
            style={{ ...inputSt, paddingLeft: '30px', fontSize: '16px', fontWeight: 900, fontFamily: 'monospace' }}
          />
        </div>
        <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '5px' }}>
          Minimum $5 · Maximum ${availableBalance.toFixed(2)}
        </p>
      </div>

      {/* Method selector */}
      <div style={{ marginBottom: '14px' }}>
        <label style={labelSt}>Payout Method</label>
        <select
          value={form.payoutMethod}
          onChange={e => handleMethodChange(e.target.value)}
          style={inputSt}>
          <option value="">Select method...</option>
          {METHODS.map(m => (
            <option key={m.id} value={m.id}>{m.icon} {m.label}</option>
          ))}
        </select>
      </div>

      {/* Method-specific fields */}
      {form.payoutMethod === 'mpesa' && (
        <PhoneFields
          form={form} setForm={setForm}
          label="M-Pesa"
          countryCode={countryCode} setCountryCode={setCountryCode}
          phoneLocal={phoneLocal} setPhoneLocal={setPhoneLocal}
          onClearError={onClearError}
        />
      )}
      {form.payoutMethod === 'airtel_money' && (
        <PhoneFields
          form={form} setForm={setForm}
          label="Airtel Money"
          countryCode={countryCode} setCountryCode={setCountryCode}
          phoneLocal={phoneLocal} setPhoneLocal={setPhoneLocal}
          onClearError={onClearError}
        />
      )}
      {form.payoutMethod === 'bank_transfer' && (
        <BankFields form={form} setForm={setForm} onClearError={onClearError} />
      )}
      {form.payoutMethod === 'paypal' && (
        <PaypalFields form={form} setForm={setForm} onClearError={onClearError} />
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || !form.amount || !form.payoutMethod}
        style={{
          width: '100%',
          background: submitting ? '#1a2740' : '#22c55e',
          color: submitting ? '#374151' : 'black',
          border: 'none',
          borderRadius: '12px',
          padding: '15px',
          fontWeight: 900,
          fontSize: '15px',
          cursor: submitting ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '8px',
          touchAction: 'manipulation',
        }}>
        {submitting
          ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</>
          : '→ Submit Withdrawal Request'}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', justifyContent: 'center' }}>
        <Info size={11} color="#4b5563" />
        <p style={{ color: '#4b5563', fontSize: '11px' }}>
          All amounts in USD · Processed within 30 minutes
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────

function PhoneFields({
  form, setForm, label, countryCode, setCountryCode, phoneLocal, setPhoneLocal, onClearError,
}: {
  form: WithdrawFormData;
  setForm: React.Dispatch<React.SetStateAction<WithdrawFormData>>;
  label: string;
  countryCode: string;
  setCountryCode: (v: string) => void;
  phoneLocal: string;
  setPhoneLocal: (v: string) => void;
  onClearError: () => void;
}) {
  return (
    <>
      <div style={{ marginBottom: '14px' }}>
        <label style={labelSt}>Country</label>
        <select
          value={countryCode}
          onChange={e => { setCountryCode(e.target.value); onClearError(); }}
          style={inputSt}>
          {PHONE_COUNTRIES.map(c => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name} (+{c.dial})
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelSt}>{label} Phone Number</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{
            background: '#060f1e',
            border: '1.5px solid #1a2740',
            borderRadius: '10px',
            padding: '12px 14px',
            color: '#9ca3af',
            fontWeight: 700,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
            minWidth: '80px',
          }}>
            +{PHONE_COUNTRIES.find(c => c.code === countryCode)?.dial}
          </div>
          <input
            type="tel"
            value={phoneLocal}
            onChange={e => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
              setPhoneLocal(digits);
              // Auto-sync to form for validation
              const dial = PHONE_COUNTRIES.find(c => c.code === countryCode)?.dial || '';
              setForm(p => ({ ...p, payoutIdentifier: `${dial}${digits}` }));
              onClearError();
            }}
            placeholder="712345678"
            style={{ ...inputSt, flex: 1 }}
          />
        </div>
        <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '5px' }}>
          Enter the local number without country code
        </p>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelSt}>Full Name on {label} Account</label>
        <input
          type="text"
          value={form.payoutName}
          onChange={e => { setForm(p => ({ ...p, payoutName: e.target.value })); onClearError(); }}
          placeholder="As registered on the account"
          style={inputSt}
        />
      </div>
    </>
  );
}

function BankFields({
  form, setForm, onClearError,
}: {
  form: WithdrawFormData;
  setForm: React.Dispatch<React.SetStateAction<WithdrawFormData>>;
  onClearError: () => void;
}) {
  return (
    <>
      <div style={{ marginBottom: '14px' }}>
        <label style={labelSt}>Bank Name</label>
        <input
          type="text"
          value={form.payoutExtra}
          onChange={e => { setForm(p => ({ ...p, payoutExtra: e.target.value })); onClearError(); }}
          placeholder="e.g. KCB, Equity, Co-operative"
          style={inputSt}
        />
      </div>
      <div style={{ marginBottom: '14px' }}>
        <label style={labelSt}>Account Number</label>
        <input
          type="text"
          inputMode="numeric"
          value={form.payoutIdentifier}
          onChange={e => {
            const digits = e.target.value.replace(/\D/g, '');
            setForm(p => ({ ...p, payoutIdentifier: digits }));
            onClearError();
          }}
          placeholder="e.g. 1234567890"
          style={inputSt}
        />
      </div>
      <div style={{ marginBottom: '14px' }}>
        <label style={labelSt}>Account Holder Name</label>
        <input
          type="text"
          value={form.payoutName}
          onChange={e => { setForm(p => ({ ...p, payoutName: e.target.value })); onClearError(); }}
          placeholder="Name exactly as on the bank account"
          style={inputSt}
        />
      </div>
    </>
  );
}

function PaypalFields({
  form, setForm, onClearError,
}: {
  form: WithdrawFormData;
  setForm: React.Dispatch<React.SetStateAction<WithdrawFormData>>;
  onClearError: () => void;
}) {
  return (
    <>
      <div style={{ marginBottom: '14px' }}>
        <label style={labelSt}>PayPal Email</label>
        <input
          type="email"
          value={form.payoutIdentifier}
          onChange={e => { setForm(p => ({ ...p, payoutIdentifier: e.target.value.trim() })); onClearError(); }}
          placeholder="your-paypal@email.com"
          style={inputSt}
        />
      </div>
      <div style={{ marginBottom: '14px' }}>
        <label style={labelSt}>Full Name on PayPal Account</label>
        <input
          type="text"
          value={form.payoutName}
          onChange={e => { setForm(p => ({ ...p, payoutName: e.target.value })); onClearError(); }}
          placeholder="As shown on PayPal"
          style={inputSt}
        />
      </div>
    </>
  );
}