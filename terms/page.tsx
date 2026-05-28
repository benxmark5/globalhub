import Link from 'next/link';
import { Trophy } from 'lucide-react';

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p style={{
          color: '#6b7280', fontSize: '14px', marginBottom: '40px'
        }}>
          Last updated: {new Date().toLocaleDateString()}
        </p>

        {[
          {
            title: '1. Acceptance of Terms',
            content: `By accessing and using GlobalHub ("the Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.`
          },
          {
            title: '2. Description of Service',
            content: `GlobalHub provides sports analysis signals and Aviator game signals for informational and entertainment purposes only. Our signals are based on statistical analysis and expert opinion. We do not guarantee any specific outcomes.`
          },
          {
            title: '3. Payment Terms',
            content: `All payments are processed securely through our payment partners. Signals are delivered digitally and are non-refundable once unlocked. Prices are displayed in your local currency and are subject to change without notice.`
          },
          {
            title: '4. Age Restriction',
            content: `You must be at least 18 years of age to use GlobalHub. By using this service, you confirm that you are 18 or older. We reserve the right to verify age and terminate accounts of underage users.`
          },
          {
            title: '5. Disclaimer',
            content: `GlobalHub signals are for informational purposes only. We do not guarantee winnings or specific results. Sports betting and gaming involve risk. Past performance does not guarantee future results. Users are solely responsible for their betting decisions.`
          },
          {
            title: '6. Account Security',
            content: `You are responsible for maintaining the confidentiality of your account credentials. You are responsible for all activities that occur under your account. Please notify us immediately of any unauthorized use.`
          },
          {
            title: '7. Intellectual Property',
            content: `All content on GlobalHub, including signals, analysis, and interface design, is proprietary and protected by copyright. Sharing, reselling, or distributing our signals without permission is strictly prohibited.`
          },
          {
            title: '8. Termination',
            content: `We reserve the right to terminate or suspend accounts that violate these terms, engage in fraudulent activity, or misuse the service. Termination does not entitle users to refunds.`
          },
          {
            title: '9. Governing Law',
            content: `These terms are governed by the laws of Kenya. Any disputes shall be resolved through binding arbitration in Nairobi, Kenya.`
          },
          {
            title: '10. Contact',
            content: `For questions about these Terms, contact us at support@globalhub.com`
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
              color: '#9ca3af', fontSize: '15px',
              lineHeight: 1.8
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