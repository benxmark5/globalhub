import Link from 'next/link';
import { Trophy, ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
  const sections = [
    {
      title: '1. Introduction',
      content: `GlobalHub ("we", "us", "our") is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights regarding your information. We comply with applicable data protection laws worldwide, including GDPR principles where applicable. By using GlobalHub, you agree to the practices described in this policy.`
    },
    {
      title: '2. Information We Collect',
      content: `We collect the following categories of information:\n\n• Account Information: Your name and email address when you register.\n• Payment Data: Payment references and transaction amounts. We never store card numbers or full payment details — these are handled by Paystack, our PCI-DSS compliant payment processor.\n• Phone Numbers: Only when processing M-Pesa or mobile money transactions.\n• Usage Data: Pages visited, features used, and session duration to improve our service.\n• Device Information: Browser type, operating system, and IP address for security and analytics purposes.`
    },
    {
      title: '3. How We Use Your Information',
      content: `We use your information solely to:\n\n• Create and manage your GlobalHub account\n• Process payments and deliver purchased signals\n• Send transaction confirmations and receipts\n• Provide customer support when you contact us\n• Improve our platform and signal quality\n• Detect and prevent fraud or abuse\n• Comply with legal obligations\n\nWe do not use your information for any other purpose without your explicit consent.`
    },
    {
      title: '4. How We Share Your Information',
      content: `We do not sell, rent, or trade your personal information to third parties. We share data only in the following limited circumstances:\n\n• Payment Processors: Paystack receives necessary payment information to process transactions securely.\n• Legal Compliance: We may disclose information when required by law, court order, or government authority.\n• Business Protection: To protect our rights, property, or the safety of our users.\n\nAll third parties we work with are required to maintain appropriate security standards.`
    },
    {
      title: '5. Data Security',
      content: `We implement industry-standard security measures to protect your data:\n\n• All data transmitted between your browser and our servers is encrypted using SSL/TLS\n• Passwords are hashed using secure algorithms — we never store plain-text passwords\n• Payment processing is handled by Paystack with bank-level security\n• Our database infrastructure uses Supabase with role-based access controls\n• We conduct regular security reviews\n\nWhile we take every reasonable precaution, no internet transmission is 100% secure. We encourage you to use a strong, unique password for your account.`
    },
    {
      title: '6. Data Retention',
      content: `We retain your personal data for as long as your account is active or as needed to provide our services. Transaction records are retained for 7 years to comply with financial regulations. If you delete your account, we will remove your personal data within 30 days, except where retention is required by law.`
    },
    {
      title: '7. Your Rights',
      content: `Depending on your location, you may have the following rights regarding your personal data:\n\n• Access: Request a copy of the personal data we hold about you\n• Correction: Request correction of inaccurate or incomplete data\n• Deletion: Request deletion of your personal data ("right to be forgotten")\n• Portability: Request your data in a structured, machine-readable format\n• Objection: Object to certain types of data processing\n• Withdrawal: Withdraw consent where processing is based on consent\n\nTo exercise any of these rights, contact us at support.globalhub.team@gmail.com. We will respond within 30 days.`
    },
    {
      title: '8. Cookies and Tracking',
      content: `We use essential cookies to maintain your login session and remember your preferences. We may use analytics cookies to understand how users interact with our platform. These help us improve the experience for everyone.\n\nYou can control cookie settings through your browser. Disabling cookies may affect certain functionality. We do not use cookies for advertising purposes.`
    },
    {
      title: '9. International Data Transfers',
      content: `GlobalHub operates globally and your data may be processed in different countries. We ensure appropriate safeguards are in place for international transfers. Our primary infrastructure uses secure, reputable cloud providers with strong data protection practices. By using GlobalHub, you consent to your data being processed in accordance with this policy regardless of your location.`
    },
    {
      title: '10. Children\'s Privacy',
      content: `GlobalHub is strictly for users aged 18 and above. We do not knowingly collect personal information from anyone under 18. If we discover that a child has provided us with personal information, we will immediately delete it. If you believe a minor has registered, please contact us at support.globalhub.team@gmail.com.`
    },
    {
      title: '11. Third-Party Links',
      content: `Our platform may contain links to third-party websites. We are not responsible for the privacy practices or content of those sites. We encourage you to review the privacy policies of any third-party sites you visit.`
    },
    {
      title: '12. Changes to This Policy',
      content: `We may update this Privacy Policy to reflect changes in our practices or legal requirements. We will notify registered users of significant changes via email. Your continued use of GlobalHub after changes are posted constitutes your acceptance of the updated policy.`
    },
    {
      title: '13. Contact Us',
      content: `For any privacy-related questions, data requests, or concerns:\n\nEmail: support.globalhub.team@gmail.com\nSupport Center: globalhub.com/support\n\nWe take privacy seriously and will respond to all inquiries within 48 hours.`
    },
  ];

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
              background: '#60a5fa',
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

      {/* Content */}
      <div style={{
        maxWidth: '800px', margin: '0 auto',
        padding: '40px 16px 80px'
      }}>
        {/* Commitment box */}
        <div style={{
          background: 'rgba(96,165,250,0.06)',
          border: '1px solid rgba(96,165,250,0.2)',
          borderRadius: '14px', padding: '20px',
          marginBottom: '40px',
          display: 'flex', gap: '14px', alignItems: 'flex-start'
        }}>
          <Shield size={22} color="#60a5fa"
            style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{
            color: '#bfdbfe', fontSize: '14px', lineHeight: 1.7
          }}>
            Your privacy is fundamental to us. GlobalHub is designed with privacy-first principles. We collect only what we need, protect it carefully, and never sell it. This policy is written in plain language so you know exactly what happens with your data.
          </p>
        </div>

        {/* Sections */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '32px'
        }}>
          {sections.map(section => (
            <div key={section.title}>
              <h2 style={{
                fontWeight: 900, fontSize: '17px',
                color: '#60a5fa', marginBottom: '12px'
              }}>
                {section.title}
              </h2>
              <p style={{
                color: '#9ca3af', fontSize: '15px',
                lineHeight: 1.8, whiteSpace: 'pre-line'
              }}>
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div style={{
          marginTop: '48px', background: '#0f1f33',
          border: '1px solid #1a2740',
          borderRadius: '14px', padding: '20px',
          textAlign: 'center'
        }}>
          <p style={{
            color: '#6b7280', fontSize: '14px',
            marginBottom: '12px'
          }}>
            Questions about your privacy or data rights?
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