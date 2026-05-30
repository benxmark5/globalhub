import Link from 'next/link';
import { Trophy, ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
  // ... (Your sections array remains the same)

  return (
    <div style={{
      minHeight: '100dvh', background: '#0a1628',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>

      {/* Header */}
      <div style={{
        background: '#0f1f33',
        borderBottom: '1px solid #1a2740',
        padding: '16px'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center',
            gap: '8px', textDecoration: 'none',
            color: '#9ca3af', marginBottom: '12px',
            fontSize: '13px', fontWeight: 700
          }}>
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <div style={{
              width: '40px', height: '40px',
              // FIXED: Removed duplicate 'background' property
              background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={20} color="white" />
            </div>
            <div>
              <h1 style={{
                fontWeight: 900, fontSize: '22px',
                letterSpacing: '-0.5px'
              }}>
                Privacy Policy
              </h1>
              <p style={{ color: '#6b7280', fontSize: '13px' }}>
                GlobalHub — How we protect and handle your data
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ... (Rest of your component remains the same) */}
    </div>
  );
}