import Link from 'next/link';
import { ArrowLeft, Trophy } from 'lucide-react';

export default function TermsPage() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `By accessing or using GlobalHub, you confirm you are at least 18 years old, have read these Terms, and agree to be bound by them. If you do not agree, please do not use GlobalHub. These terms apply to all users worldwide.`
    },
    {
      title: '2. Description of Service',
      content: `GlobalHub provides sports analysis signals and Aviator game signals for informational and entertainment purposes only. Our signals are opinion-based and should not be treated as financial advice. We do not guarantee any specific outcomes or profits.`
    },
    {
      title: '3. Eligibility',
      content: `You must be at least 18 years old to use GlobalHub. By using our service you confirm this. We may request age verification at any time and terminate accounts of underage users. You are responsible for ensuring use of our service is legal in your jurisdiction.`
    },
    {
      title: '4. Account Registration',
      content: `You agree to provide accurate, complete information when registering. You are responsible for all activity under your account. Notify us immediately at support.globalhub.team@gmail.com if you suspect unauthorized access.`
    },
    {
      title: '5. Payment Terms',
      content: `All payments are processed securely through Paystack. Signals are digital goods delivered instantly upon payment. Due to their digital nature, all sales are final and non-refundable once a signal has been unlocked. If a technical issue prevents delivery, contact support within 24 hours.`
    },
    {
      title: '6. Signal Usage Policy',
      content: `Signals are licensed for personal use only. You may not resell, redistribute, or share signals with third parties. Sharing account credentials or signal content violates these terms and may result in immediate account suspension without refund.`
    },
    {
      title: '7. Responsible Use',
      content: `GlobalHub strongly promotes responsible gaming. Our signals are tools to inform decisions, not guarantees. Never stake money you cannot afford to lose. If you believe you have a gambling problem, please contact a professional support service immediately.`
    },
    {
      title: '8. Disclaimer',
      content: `GlobalHub services are provided as-is without warranties. We are not liable for any losses, damages, or costs arising from your use of our signals. Market conditions and external factors can affect outcomes beyond our control.`
    },
    {
      title: '9. Intellectual Property',
      content: `All content on GlobalHub including signals, analysis, design, and software is our exclusive intellectual property. You may not copy, reproduce, or distribute any content without express written permission.`
    },
    {
      title: '10. Prohibited Activities',
      content: `You agree not to: use automated tools or bots; attempt unauthorized access to our systems; use the platform for illegal purposes; resell our signals; share login credentials; or attempt to reverse-engineer any part of our service.`
    },
    {
      title: '11. Termination',
      content: `We may suspend or terminate your account at any time for violating these terms, fraudulent activity, or at our sole discretion. You may close your account by contacting support.globalhub.team@gmail.com.`
    },
    {
      title: '12. Changes to Terms',
      content: `We may update these terms at any time. Continued use after changes are posted constitutes acceptance of the new terms. We will notify users of significant changes via email.`
    },
    {
      title: '13. Contact',
      content: `For questions about these Terms:\n\nEmail: support.globalhub.team@gmail.com\nResponse time: Within 24 hours`
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a1628',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>
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
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <div style={{
              width: '40px', height: '40px',
              background: '#22c55e', borderRadius: '10px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Trophy size={20} color="black" />
            </div>
            <div>
              <h1 style={{
                fontWeight: 900, fontSize: '22px',
                letterSpacing: '-0.5px', color: 'white', margin: 0
              }}>
                Terms of Service
              </h1>
              <p style={{
                color: '#6b7280', fontSize: '13px', margin: 0
              }}>
                GlobalHub — Please read before using our services
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '800px', margin: '0 auto',
        padding: '40px 16px 80px'
      }}>
        <div style={{
          background: 'rgba(34,197,94,0.06)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '14px', padding: '20px',
          marginBottom: '40px'
        }}>
          <p style={{
            color: '#86efac', fontSize: '14px',
            lineHeight: 1.7, margin: 0
          }}>
            Welcome to GlobalHub. By creating an account or
            purchasing signals, you agree to these terms.
            Questions? Contact{' '}
            <a href="mailto:support.globalhub.team@gmail.com"
              style={{ color: '#22c55e', fontWeight: 700 }}>
              support.globalhub.team@gmail.com
            </a>
          </p>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: '32px'
        }}>
          {sections.map(section => (
            <div key={section.title}>
              <h2 style={{
                fontWeight: 900, fontSize: '17px',
                color: '#22c55e',
                margin: '0 0 12px'
              }}>
                {section.title}
              </h2>
              <p style={{
                color: '#9ca3af', fontSize: '15px',
                lineHeight: 1.8, whiteSpace: 'pre-line',
                margin: 0
              }}>
                {section.content}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '48px',
          background: '#0f1f33',
          border: '1px solid #1a2740',
          borderRadius: '14px', padding: '20px',
          textAlign: 'center'
        }}>
          <p style={{
            color: '#6b7280', fontSize: '14px',
            marginBottom: '12px'
          }}>
            Questions about our Terms of Service?
          </p>
          <a href="mailto:support.globalhub.team@gmail.com"
            style={{
              display: 'inline-block',
              background: '#22c55e', color: 'black',
              padding: '12px 24px', borderRadius: '10px',
              fontWeight: 900, fontSize: '14px',
              textDecoration: 'none'
            }}>
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}