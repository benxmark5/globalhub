"use client";
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { Trophy, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { full_name: name.trim() } }
      });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => router.push('/account'), 2000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Registration failed');
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
          <h2 style={{
            fontWeight: 900, fontSize: '28px',
            marginBottom: '10px', color: 'white'
          }}>
            Account Created! 🎉
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '15px' }}>
            Redirecting to your account...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100dvh', background: '#0a1628',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '24px 16px',
      fontFamily: '-apple-system, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

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
            <span style={{
              fontWeight: 900, fontSize: '24px',
              color: 'white', letterSpacing: '-0.5px'
            }}>
              GLOBAL<span style={{ color: '#22c55e' }}>HUB</span>
            </span>
          </Link>
          <h1 style={{
            fontWeight: 900, fontSize: '28px',
            marginBottom: '6px', color: 'white'
          }}>
            Create Account
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Join thousands of winners today
          </p>
        </div>

        <div style={{
          background: '#0f1f33', border: '1px solid #1a2740',
          borderRadius: '20px', padding: '28px 20px'
        }}>

          {[
            { label: 'Full Name', value: name, setter: setName,
              type: 'text', placeholder: 'John Doe',
              autoComplete: 'name' },
            { label: 'Email Address', value: email, setter: setEmail,
              type: 'email', placeholder: 'your@email.com',
              autoComplete: 'email' },
          ].map(field => (
            <div key={field.label} style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', color: '#9ca3af',
                fontSize: '13px', fontWeight: 700, marginBottom: '8px'
              }}>
                {field.label}
              </label>
              <input
                type={field.type}
                value={field.value}
                onChange={e => field.setter(e.target.value)}
                placeholder={field.placeholder}
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete={field.autoComplete}
                style={{
                  width: '100%', background: '#0a1628',
                  border: '2px solid #1a2740', borderRadius: '12px',
                  padding: '16px', color: 'white', fontSize: '16px',
                  outline: 'none', boxSizing: 'border-box', display: 'block'
                }}
              />
            </div>
          ))}

          {/* Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block', color: '#9ca3af',
              fontSize: '13px', fontWeight: 700, marginBottom: '8px'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                autoComplete="new-password"
                style={{
                  width: '100%', background: '#0a1628',
                  border: '2px solid #1a2740', borderRadius: '12px',
                  padding: '16px 52px 16px 16px',
                  color: 'white', fontSize: '16px',
                  outline: 'none', boxSizing: 'border-box', display: 'block'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: 'absolute', right: '14px',
                  top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  color: '#6b7280', padding: '8px',
                  cursor: 'pointer', touchAction: 'manipulation',
                  zIndex: 2
                }}
              >
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '12px', padding: '14px', marginBottom: '16px'
            }}>
              <p style={{
                color: '#f87171', fontSize: '14px', textAlign: 'center'
              }}>
                ⚠️ {error}
              </p>
            </div>
          )}

          {/* ✅ REGISTER BUTTON */}
          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#374151' : '#22c55e',
              color: loading ? '#6b7280' : 'black',
              border: 'none', borderRadius: '14px',
              padding: '18px', fontSize: '17px', fontWeight: 900,
              cursor: loading ? 'not-allowed' : 'pointer',
              touchAction: 'manipulation',
              display: 'block', position: 'relative', zIndex: 1
            }}
          >
            {loading ? '⏳ Creating...' : '🚀 Create Account'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{
            color: '#6b7280', fontSize: '14px', marginBottom: '10px'
          }}>
            Already have an account?{' '}
            <Link href="/login" style={{
              color: '#22c55e', fontWeight: 700, textDecoration: 'none'
            }}>
              Login here
            </Link>
          </p>
          <Link href="/" style={{
            color: '#374151', fontSize: '13px', textDecoration: 'none'
          }}>
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}