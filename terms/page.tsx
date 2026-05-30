import Link from 'next/link';
import { Trophy, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `By accessing or using GlobalHub ("the Platform", "we", "us", or "our"), you confirm that you are at least 18 years of age, have read and understood these Terms of Service, and agree to be bound by them. If you do not agree, please do not use GlobalHub. These terms apply to all users worldwide regardless of location.`
    },
    {
      title: '2. Description of Service',
      content: `GlobalHub provides sports analysis signals and Aviator game pattern signals for informational and entertainment purposes only. Our signals are produced by expert analysts using statistical methods. We do not guarantee any specific outcomes, profits, or results. Past performance does not guarantee future results. All signals are opinion-based and should not be treated as financial advice.`
    },
    {
      title: '3. Eligibility',
      content: `You must be at least 18 years old (or the legal age of majority in your jurisdiction, whichever is higher) to use GlobalHub. By using our service, you confirm you meet this requirement. We reserve the right to request age verification at any time and to terminate accounts of users who do not comply. It is your responsibility to ensure that using our service is legal in your jurisdiction.`
    },
    {
      title: '4. Account Registration',
      content: `You agree to provide accurate, complete, and current information when creating your account. You are responsible for maintaining the confidentiality of your login credentials. You are fully responsible for all activity that occurs under your account. Notify us immediately at support.globalhub.team@gmail.com if you suspect unauthorized access. We reserve the right to terminate accounts that violate these terms.`
    },
    {
      title: '5. Payment Terms',
      content: `All payments are processed securely through Paystack, our trusted payment partner. Payments are charged in your local currency where supported. Signals are digital goods delivered instantly upon payment confirmation. Due to the digital and time-sensitive nature of our signals, all sales are final and non-refundable once a signal has been unlocked. If you experience a technical issue preventing signal delivery, contact our support team within 24 hours.`
    },
    {
      title: '6. Signal Usage Policy',
      content: `Signals purchased on GlobalHub are licensed for personal use only. You may not resell, redistribute, share, or broadcast our signals to third parties. Each purchase unlocks signals for a single user account for the specified validity period. Sharing account credentials or signal content is a violation of these terms and may result in immediate account suspension without refund.`
    },
    {
      title: '7. Responsible Use',
      content: `GlobalHub strongly promotes responsible gaming. Our signals are tools to inform decisions, not guarantees of profit. Never stake money you cannot afford to lose. We encourage users to set personal spending limits and take breaks. If you believe you have a gambling problem, please contact a professional support service immediately. We support responsible gaming initiatives worldwide.`
    },
    {
      title: '8. Disclaimer of Warranties',
      content: `GlobalHub services are provided "as is" without warranties of any kind. We do not guarantee that signals will be accurate, profitable, or error-free. We are not liable for any losses, damages, or costs arising from your use of our signals. Market conditions, game mechanics, and external factors can affect outcomes in ways beyond our control or prediction.`
    },
    {
      title: '9. Limitation of Liability',
      content: `To the maximum extent permitted by applicable law, GlobalHub and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, or consequential damages, including but not limited to loss of profits, data, or goodwill, arising from your use of the platform. Our total liability to you shall not exceed the amount you paid for signals in the 30 days preceding the claim.`
    },
    {
      title: '10. Intellectual Property',
      content: `All content on GlobalHub, including signals, analysis, reports, design elements, logos, and software, is the exclusive intellectual property of GlobalHub. You may not copy, reproduce, distribute, or create derivative works without our express written permission. Unauthorized use may result in legal action.`
    },
    {
      title: '11. Privacy',
      content: `Your use of GlobalHub is also governed by our Privacy Policy, which is incorporated into these Terms by reference. By using our service, you consent to the data practices described in our Privacy Policy. We are committed to protecting your personal information and will never sell it to third parties.`
    },
    {
      title: '12. Prohibited Activities',
      content: `You agree not to: use automated tools, bots, or scripts to access our platform; attempt to gain unauthorized access to our systems; use our platform for any illegal purpose; harass, abuse, or harm other users; impersonate any person or entity; circumvent any security or access control measures; or attempt to reverse-engineer any part of our service.`
    },
    {
      title: '13. Termination',
      content: `We reserve the right to suspend or terminate your account at any time for violation of these terms, fraudulent activity, abuse of our systems, or at our sole discretion. Termination does not entitle you to refunds for unused signal credits. You may close your account at any time by contacting support.globalhub.team@gmail.com.`
    },
    {
      title: '14. Changes to Terms',
      content: `We may update these Terms of Service at any time. Continued use of GlobalHub after changes are posted constitutes your acceptance of the new terms. We will make reasonable efforts to notify users of significant changes via email or platform notifications.`
    },
    {
      title: '15. Governing Law & Disputes',
      content: `These terms are governed by applicable international law. Any disputes arising from these terms or your use of GlobalHub shall first be attempted to be resolved through good-faith negotiation. Contact us at support.globalhub.team@gmail.com to raise any concerns. We are committed to fair and transparent resolution of all disputes.`
    },
    {
      title: '16. Contact Information',
      content: `For any questions, concerns, or disputes regarding these Terms of Service, please contact us at:\n\nEmail: support.globalhub.team@gmail.com\nSupport: globalhub.com/support\nResponse time: Within 24 hours`
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
              background: '#22c55e', borderRadius: '10px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Trophy size={20} color="black" />
            </div>
            <div>
              <h1 style={{
                fontWeight: 900, fontSize: '22px',
                letterSpacing: '-0.5px'
              }}>
                Terms of Service
              </h1>
              <p style={{ color: '#6b7280', fontSize: '13px' }}>
                GlobalHub — Please read carefully before using our services
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
        {/* Intro box */}
        <div style={{
          background: 'rgba(34,197,94,0.06)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '14px', padding: '20px',
          marginBottom: '40px'
        }}>
          <p style={{
            color: '#86efac', fontSize: '14px',
            lineHeight: 1.7
          }}>
            Welcome to GlobalHub. These Terms of Service govern your use of our platform and services worldwide. By creating an account or purchasing signals, you agree to these terms. If you have questions, contact us at{' '}
            <a href="mailto:support.globalhub.team@gmail.com"
              style={{ color: '#22c55e', fontWeight: 700 }}>
              support.globalhub.team@gmail.com
            </a>
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
                color: '#22c55e', marginBottom: '12px',
                letterSpacing: '-0.3px'
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

        {/* Footer */}
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
            Have questions about our Terms of Service?
          </p>
          
            href="mailto:support.globalhub.team@gmail.com"
            style={{
              display: 'inline-flex', alignItems: 'center',
              gap: '8px', background: '#22c55e',
              color: 'black', padding: '12px 24px',
              borderRadius: '10px', fontWeight: 900,
              fontSize: '14px', textDecoration: 'none'
            }}
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}