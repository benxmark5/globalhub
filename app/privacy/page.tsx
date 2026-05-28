import Link from 'next/link';
import { Trophy } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div style={{
      minHeight: '100dvh', background: '#0a1628',
      color: 'white', fontFamily: '-apple-system, sans-serif',
      padding: '0 0 60px'
    }}>
      <nav style={{
        background: '#0f1f33',
        borderBottom: '1px solid #1a2740',
        padding: '16px', marginBottom: '40px'
      }}>
        <div style={{
          maxWidth: '800px', margin: '0 auto',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center',
            gap: '8px', textDecoration: 'none'
          }}>
            <div style={{
              width: '32px', height: '32px', background: '#22c55e',
              borderRadius: '8px', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <Trophy size={16} color="black" />
            </div>
            <span style={{ fontWeight: 900, fontSize: '18px' }}>
              GLOBAL<span style={{ color: '#22c55e' }}>HUB</span>
            </span>
          </Link>
        </div>
      </nav>

      <div style={{
        maxWidth: '800px', margin: '0 auto', padding: '0 16px'
      }}>
        <h1 style={{
          fontWeight: 900, fontSize: '32px',
          marginBottom: '8px', letterSpacing: '-1px'
        }}>
          Privacy Policy
        </h1>
        <p style={{
          color: '#6b7280', fontSize: '14px', marginBottom: '40px'
        }}>
          Last updated: {new Date().toLocaleDateString()}
        </p>

        {[
          {
            title: '1. Information We Collect',
            content: `We collect: your name and email address when you register, payment information processed through secure third-party payment providers, device and usage data to improve our service, and phone numbers for M-Pesa transactions only.`
          },
          {
            title: '2. How We Use Your Information',
            content: `Your information is used to: create and manage your account, process payments and deliver signals, send important service notifications, improve our signal accuracy and service quality, and comply with legal obligations.`
          },
          {
            title: '3. Payment Security',
            content: `We do not store your payment card details. All transactions are processed through PCI-DSS compliant payment processors (PayHero, Paystack). M-Pesa transactions are processed through Safaricom's secure API.`
          },
          {
            title: '4. Data Sharing',
            content: `We do not sell your personal data. We share data only with: payment processors to complete transactions, analytics services to improve our platform, and law enforcement when legally required.`
          },
          {
            title: '5. Cookies',
            content: `We use essential cookies to maintain your login session. We use analytics cookies to understand how users interact with our service. You can disable cookies in your browser settings.`
          },
          {
            title: '6. Data Retention',
            content: `Account data is retained as long as your account is active. Transaction records are kept for 7 years for legal compliance. You may request deletion of your account data at any time.`
          },
          {
            title: '7. Your Rights',
            content: `You have the right to: access your personal data, correct inaccurate data, delete your account and data, opt out of marketing communications, and data portability. Contact us to exercise these rights.`
          },
          {
            title: '8. Security',
            content: `We implement industry-standard security measures including SSL encryption, secure database storage, and regular security audits. However, no method of transmission over the internet is 100% secure.`
          },
          {
            title: '9. Contact',
            content: `For privacy concerns, contact our Data Protection Officer at privacy@globalhub.com`
          },
        ].map(section => (
          <div key={section.title} style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontWeight: 900, fontSize: '18px',
              color: '#22c55e', marginBottom: '12px'
            }}>
              {section.title}
            </h2>
            <p style={{
              color: '#9ca3af', fontSize: '15px', lineHeight: 1.8
            }}>
              {section.content}
            </p>
          </div>
        ))}

        <Link href="/" style={{
          display: 'inline-block',
          color: '#22c55e', textDecoration: 'none',
          fontWeight: 700, marginTop: '20px'
        }}>
          ← Back to home
        </Link>
      </div>
    </div>
  );
}