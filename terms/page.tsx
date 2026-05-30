import Link from 'next/link';
import { Trophy, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  const sections = [
    { title: '1. Acceptance of Terms', content: 'By accessing or using GlobalHub ("the Platform", "we", "us", or "our"), you confirm that you are at least 18 years of age, have read and understood these Terms of Service, and agree to be bound by them. If you do not agree, please do not use GlobalHub. These terms apply to all users worldwide regardless of location.' },
    { title: '2. Description of Service', content: 'GlobalHub provides sports analysis signals and Aviator game pattern signals for informational and entertainment purposes only. Our signals are produced by expert analysts using statistical methods. We do not guarantee any specific outcomes, profits, or results. Past performance does not guarantee future results. All signals are opinion-based and should not be treated as financial advice.' },
    { title: '3. Eligibility', content: 'You must be at least 18 years old (or the legal age of majority in your jurisdiction, whichever is higher) to use GlobalHub. By using our service, you confirm you meet this requirement. We reserve the right to request age verification at any time and to terminate accounts of users who do not comply.' },
    { title: '4. Account Registration', content: 'You agree to provide accurate, complete, and current information when creating your account. You are responsible for maintaining the confidentiality of your login credentials. You are fully responsible for all activity that occurs under your account.' },
    { title: '5. Payment Terms', content: 'All payments are processed securely through Paystack. Signals are digital goods delivered instantly upon payment confirmation. Due to the digital nature of our signals, all sales are final and non-refundable once a signal has been unlocked.' },
    { title: '6. Signal Usage Policy', content: 'Signals purchased on GlobalHub are licensed for personal use only. You may not resell, redistribute, share, or broadcast our signals to third parties. Sharing account credentials is a violation of these terms.' },
    { title: '7. Responsible Use', content: 'GlobalHub strongly promotes responsible gaming. Our signals are tools to inform decisions, not guarantees of profit. Never stake money you cannot afford to lose.' },
    { title: '8. Disclaimer of Warranties', content: 'GlobalHub services are provided "as is" without warranties of any kind. We do not guarantee that signals will be accurate, profitable, or error-free.' },
    { title: '9. Limitation of Liability', content: 'To the maximum extent permitted by applicable law, GlobalHub shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.' },
    { title: '10. Intellectual Property', content: 'All content on GlobalHub, including signals, analysis, reports, design elements, logos, and software, is the exclusive intellectual property of GlobalHub.' },
    { title: '11. Privacy', content: 'Your use of GlobalHub is governed by our Privacy Policy, which is incorporated into these Terms by reference.' },
    { title: '12. Prohibited Activities', content: 'You agree not to: use automated tools, bots, or scripts to access our platform; attempt to gain unauthorized access; use our platform for any illegal purpose.' },
    { title: '13. Termination', content: 'We reserve the right to suspend or terminate your account at any time for violation of these terms, fraudulent activity, or abuse of our systems.' },
    { title: '14. Changes to Terms', content: 'We may update these Terms of Service at any time. Continued use of GlobalHub after changes are posted constitutes your acceptance of the new terms.' },
    { title: '15. Governing Law & Disputes', content: 'These terms are governed by applicable international law. Any disputes shall first be attempted to be resolved through good-faith negotiation.' },
    { title: '16. Contact Information', content: 'For any questions, concerns, or disputes, please contact us at: support.globalhub.team@gmail.com' },
  ];

  return (
    <div style={{ minHeight: '100dvh', background: '#0a1628', color: 'white', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ background: '#0f1f33', borderBottom: '1px solid #1a2740', padding: '16px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#9ca3af', marginBottom: '12px', fontSize: '13px', fontWeight: 700 }}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: '#22c55e', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={20} color="black" />
            </div>
            <div>
              <h1 style={{ fontWeight: 900, fontSize: '22px', letterSpacing: '-0.5px' }}>Terms of Service</h1>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 16px 80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {sections.map((section) => (
            <div key={section.title}>
              <h2 style={{ fontWeight: 900, fontSize: '17px', color: '#22c55e', marginBottom: '12px' }}>{section.title}</h2>
              <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: 1.8 }}>{section.content}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '48px', background: '#0f1f33', border: '1px solid #1a2740', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>Have questions about our Terms?</p>
          <a href="mailto:support.globalhub.team@gmail.com"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#22c55e', color: 'black', padding: '12px 24px', borderRadius: '10px', fontWeight: 900, fontSize: '14px', textDecoration: 'none' }}
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}