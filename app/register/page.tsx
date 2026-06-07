"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trophy, Eye, EyeOff, CheckCircle,
  Check, X, Shield
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const getPasswordStrength = (password: string) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { checks, score };
};

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedAge, setAcceptedAge] = useState(false);
  const [acceptedResponsible, setAcceptedResponsible] = useState(false);

  const { checks, score } = getPasswordStrength(password);

  const strengthLabel = score === 0 ? '' :
    score <= 2 ? 'Weak' :
    score <= 3 ? 'Fair' :
    score <= 4 ? 'Good' : 'Strong';

  const strengthColor = score <= 2 ? '#f87171' :
    score === 3 ? '#fbbf24' :
    score === 4 ? '#60a5fa' : '#22c55e';

  const canSubmit = name && email && password &&
    score >= 3 && acceptedTerms &&
    acceptedAge && acceptedResponsible;

  const handleRegister = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { full_name: name.trim() } }
      });
      if (authError) throw authError;

      await fetch('/api/track-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitor_id: `reg_${Date.now()}`,
          page: '/register',
          referrer: 'registration',
          country: 'Unknown',
          city: 'Unknown',
        }),
      }).catch(e => console.error('Tracking analytics mismatch:', e));

      setSuccess(true);
      
      const destination = localStorage.getItem('redirectAfterLogin') || '/account';
      localStorage.removeItem('redirectAfterLogin');
      
      setTimeout(() => router.push(destination), 2000);
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : 'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100dvh', background: '#0a1628',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '24px',
        fontFamily: '-apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '360px' }}>
          <div style={{
            width: '80px', height: '80px',
            background: 'rgba(34,197,94,0.1)',
            border: '2px solid rgba(34,197,94,0.3)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 24px'
          }}>
            <CheckCircle size={40} color="#22c55e" />
          </div>
          <h2 style={{ fontWeight: 900, fontSize: '28px', marginBottom: '10px', color: 'white' }}>
            Account Created! 🎉
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: 1.6 }}>
            Welcome to GlobalHub! Taking you to your account...
          </p>
        </div>
      </div>
    );
  }

  const inputStyle = {
    width: '100%', background: '#0a1628',
    border: '2px solid #1a2740', borderRadius: '12px',
    padding: '15px', color: 'white', fontSize: '16px',
    outline: 'none', boxSizing: 'border-box' as const,
    display: 'block'
  };

  return (
    <div style={{
      minHeight: '100dvh', background: '#0a1628',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '24px 16px',
      fontFamily: '-apple-system, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center',
            gap: '10px', textDecoration: 'none', marginBottom: '16px'
          }}>
            <div style={{
              width: '44px', height: '44px', background: '#22c55e',
              borderRadius: '12px', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <Trophy size={22} color="black" />
            </div>
            <span style={{ fontWeight: 900, fontSize: '24px', color: 'white' }}>
              GLOBAL<span style={{ color: '#22c55e' }}>HUB</span>
            </span>
          </Link>
          <h1 style={{ fontWeight: 900, fontSize: '26px', marginBottom: '6px', color: 'white' }}>
            Create Account
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Join thousands of winners worldwide
          </p>
        </div>

        <div style={{
          background: '#0f1f33', border: '1px solid #1a2740',
          borderRadius: '20px', padding: '28px 20px'
        }}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{
              display: 'block', color: '#9ca3af', fontSize: '12px',
              fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: '8px'
            }}>
              Full Name
            </label>
            <input
              type="text" value={name}
              onChange={e => setName(e.target.value)}
              placeholder="John Doe"
              autoComplete="name"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{
              display: 'block', color: '#9ca3af', fontSize: '12px',
              fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: '8px'
            }}>
              Email Address
            </label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoCapitalize="none" autoCorrect="off"
              autoComplete="email"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{
              display: 'block', color: '#9ca3af', fontSize: '12px',
              fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: '8px'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Create a strong password"
                autoComplete="new-password"
                style={{ ...inputStyle, paddingRight: '52px' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: 'absolute', right: '14px',
                  top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  color: '#6b7280', cursor: 'pointer',
                  touchAction: 'manipulation'
                }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {password.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} style={{
                    flex: 1, height: '4px', borderRadius: '2px',
                    background: i <= score ? strengthColor : '#1a2740',
                    transition: 'all 0.3s'
                  }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: strengthColor }}>
                  {strengthLabel} Password
                </span>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>
                  {score}/5 requirements met
                </span>
              </div>

              <div style={{
                background: '#0a1628', border: '1px solid #1a2740',
                borderRadius: '10px', padding: '12px',
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px'
              }}>
                {[
                  { key: 'length', label: '8+ characters' },
                  { key: 'uppercase', label: 'Uppercase letter' },
                  { key: 'lowercase', label: 'Lowercase letter' },
                  { key: 'number', label: 'Number' },
                  { key: 'special', label: 'Special character' },
                ].map(req => (
                  <div key={req.key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {checks[req.key as keyof typeof checks] ? (
                      <Check size={12} color="#22c55e" />
                    ) : (
                      <X size={12} color="#374151" />
                    )}
                    <span style={{
                      fontSize: '11px',
                      color: checks[req.key as keyof typeof checks] ? '#86efac' : '#374151'
                    }}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{
            background: '#0a1628', border: '1px solid #1a2740',
            borderRadius: '12px', padding: '16px', marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Shield size={14} color="#22c55e" />
              <p style={{
                fontSize: '11px', fontWeight: 700, color: '#9ca3af',
                textTransform: 'uppercase', letterSpacing: '0.06em'
              }}>
                Required Agreements
              </p>
            </div>
            <p style={{ fontSize: '11px', color: '#374151', marginBottom: '14px' }}>
              All three must be accepted to continue
            </p>

            {[
              {
                key: 'terms',
                value: acceptedTerms,
                setter: setAcceptedTerms,
                label: 'I have read and agree to the ',
                link: '/terms',
                linkText: 'Terms of Service',
                suffix: ' and ',
                link2: '/privacy',
                linkText2: 'Privacy Policy'
              },
              {
                key: 'age',
                value: acceptedAge,
                setter: setAcceptedAge,
                label: 'I confirm I am 18 years of age or older and legally permitted to use this service in my country',
              },
              {
                key: 'responsible',
                value: acceptedResponsible,
                setter: setAcceptedResponsible,
                label: 'I agree to use GlobalHub responsibly and acknowledge that signals do not guarantee winnings. See our ',
                link: '/responsible-gaming',
                linkText: 'Responsible Gaming'
              },
            ].map(item => (
              <div
                key={item.key}
                onClick={() => item.setter(!item.value)}
                style={{
                  display: 'flex', gap: '10px',
                  marginBottom: '12px', cursor: 'pointer',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{
                  width: '20px', height: '20px',
                  borderRadius: '6px', flexShrink: 0,
                  border: item.value ? '2px solid #22c55e' : '2px solid #374151',
                  background: item.value ? '#22c55e' : 'transparent',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', marginTop: '1px',
                  transition: 'all 0.2s'
                }}>
                  {item.value && <Check size={12} color="black" />}
                </div>
                <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: 1.5 }}>
                  {item.label}
                  {item.link && (
                    <Link href={item.link}
                      onClick={e => e.stopPropagation()}
                      style={{ color: '#22c55e', fontWeight: 700, textDecoration: 'none' }}>
                      {item.linkText}
                    </Link>
                  )}
                  {item.suffix}
                  {item.link2 && (
                    <Link href={item.link2}
                      onClick={e => e.stopPropagation()}
                      style={{ color: '#22c55e', fontWeight: 700, textDecoration: 'none' }}>
                      {item.linkText2}
                    </Link>
                  )}
                </p>
              </div>
            ))}
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '12px', padding: '14px', marginBottom: '16px'
            }}>
              <p style={{ color: '#f87171', fontSize: '14px', textAlign: 'center' }}>
                ⚠️ {error}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleRegister}
            disabled={loading || !canSubmit}
            style={{
              width: '100%',
              background: canSubmit ? '#22c55e' : '#1a2740',
              color: canSubmit ? 'black' : '#374151',
              border: 'none', borderRadius: '14px',
              padding: '18px', fontSize: '17px', fontWeight: 900,
              cursor: canSubmit && !loading ? 'pointer' : 'not-allowed',
              touchAction: 'manipulation', display: 'block',
              transition: 'all 0.2s',
              boxShadow: canSubmit ? '0 4px 15px rgba(34,197,94,0.3)' : 'none'
            }}
          >
            {loading ? '⏳ Creating account...' : '🚀 Create Account'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '10px' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#22c55e', fontWeight: 700, textDecoration: 'none' }}>
              Login here
            </Link>
          </p>
          <Link href="/" style={{ color: '#374151', fontSize: '13px', textDecoration: 'none' }}>
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}