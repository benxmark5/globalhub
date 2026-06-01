import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
  const sections = [
    {
      title: '1. Introduction',
      content: `GlobalHub is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights. We comply with applicable data protection laws worldwide including GDPR principles. By using GlobalHub, you agree to the practices described here.`
    },
    {
      title: '2. Information We Collect',
      content: `We collect:\n\n• Account Info: Name and email when you register\n• Payment Data: Transaction references and amounts only — never card numbers\n• Phone Numbers: Only for M-Pesa/mobile money transactions\n• Usage Data: Pages visited and features used to improve our service\n• Device Info: Browser type and IP address for security purposes`
    },
    {
      title: '3. How We Use Your Information',
      content: `We use your data to:\n\n• Create and manage your account\n• Process payments and deliver purchased signals\n• Send transaction confirmations and receipts\n• Provide customer support\n• Improve our platform and signal quality\n• Detect and prevent fraud\n• Comply with legal obligations`
    },
    {
      title: '4. How We Share Your Information',
      content: `We do not sell, rent, or trade your personal information. We share data only with:\n\n• Paystack: To process payments securely\n• Legal authorities: When required by law\n• No other third parties receive your personal data`
    },
    {
      title: '5. Data Security',
      content: `We protect your data with:\n\n• SSL/TLS encryption for all data transmission\n• Hashed passwords — never stored in plain text\n• Bank-level payment security via Paystack\n• Role-based database access controls\n• Regular security reviews and updates`
    },
    {
      title: '6. Data Retention',
      content: `We retain your data as long as your account is active. Transaction records are kept for 7 years for financial compliance. If you delete your account, personal data is removed within 30 days except where law requires longer retention.`
    },
    {
      title: '7. Your Rights',
      content: `You have the right to:\n\n• Access a copy of your personal data\n• Correct inaccurate information\n• Delete your account and data\n• Receive your data in portable format\n• Object to certain data processing\n\nContact support.globalhub.team@gmail.com to exercise any right. We respond within 30 days.`
    },
    {
      title: '8. Cookies',
      content: `We use essential cookies to maintain login sessions and remember your preferences. We may use analytics cookies to improve user experience. You can control cookies through your browser settings. Disabling essential cookies may affect functionality.`
    },
    {
      title: '9. International Transfers',
      content: `GlobalHub operates globally. Your data may be processed in different countries. We ensure appropriate safeguards are in place. By using GlobalHub, you consent to your data being processed in accordance with this policy regardless of your location.`
    },
    {
      title: '10. Children\'s Privacy',
      content: `GlobalHub is strictly for users aged 18 and above. We do not knowingly collect data from anyone under 18. If you believe a minor has registered, contact support.globalhub.team@gmail.com immediately and we will delete the account.`
    },
    {
      title: '11. Changes to This Policy',
      content: `We may update this policy to reflect changes in our practices or legal requirements. We will notify registered users of significant changes via email. Continued use after changes are posted means you accept the updated policy.`
    },
    {
      title: '12. Contact',
      content: `For privacy questions or data requests:\n\nEmail: support.globalhub.team@gmail.com\nResponse time: Within 48 hours`
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a1628',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      padding: '0'
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
              background: '#3b82f6',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={20} color="white" />
            </div>
            <div>
              <h1 style={{
                fontWeight: 900, fontSize: '22px',
                letterSpacing: '-0.5px', color: 'white',
                margin: 0
              }}>
                Privacy Policy
              </h1>
              <p style={{
                color: '#6b7280', fontSize: '13px', margin: 0
              }}>
                GlobalHub — How we protect and handle your data
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
          background: 'rgba(59,130,246,0.08)',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '14px', padding: '20px',
          marginBottom: '40px',
          display: 'flex', gap: '14px', alignItems: 'flex-start'
        }}>
          <Shield size={22} color="#60a5fa"
            style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{
            color: '#bfdbfe', fontSize: '14px',
            lineHeight: 1.7, margin: 0
          }}>
            Your privacy is fundamental to us. We collect only
            what we need, protect it carefully, and never sell it.
            Questions? Email{' '}
            <a href="mailto:support.globalhub.team@gmail.com"
              style={{ color: '#60a5fa', fontWeight: 700 }}>
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
                color: '#60a5fa', marginBottom: '12px',
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
            Questions about your privacy?
          </p>
          <a href="mailto:support.globalhub.team@gmail.com"
            style={{
              display: 'inline-block',
              background: '#3b82f6', color: 'white',
              padding: '12px 24px', borderRadius: '10px',
              fontWeight: 900, fontSize: '14px',
              textDecoration: 'none'
            }}>
            Contact Privacy Team
          </a>
        </div>
      </div>
    </div>
  );
}