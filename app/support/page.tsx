import Link from 'next/link';
import { ArrowLeft, Trophy, Mail, Clock, MessageCircle, HelpCircle, BookOpen, Shield } from 'lucide-react';

export default function SupportPage() {
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
              background: 'linear-gradient(135deg,#22c55e,#16a34a)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MessageCircle size={20} color="white" />
            </div>
            <div>
              <h1 style={{
                fontWeight: 900, fontSize: '22px',
                letterSpacing: '-0.5px'
              }}>
                Support Center
              </h1>
              <p style={{ color: '#6b7280', fontSize: '13px' }}>
                We're here to help — 24/7 support worldwide
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '800px', margin: '0 auto',
        padding: '40px 16px 80px'
      }}>

        {/* Response time badge */}
        <div style={{
          background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '14px', padding: '16px 20px',
          marginBottom: '32px',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <div style={{
            width: '10px', height: '10px',
            background: '#22c55e', borderRadius: '50%'
          }} />
          <p style={{ color: '#86efac', fontSize: '14px' }}>
            <strong>Support is online.</strong>{' '}
            Average response time: under 2 hours.
          </p>
        </div>

        {/* Primary contact */}
        <div style={{
          background: '#0f1f33', border: '1px solid #1a2740',
          borderRadius: '18px', padding: '28px',
          marginBottom: '24px', textAlign: 'center'
        }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px'
          }}>
            <Mail size={26} color="#22c55e" />
          </div>
          <h2 style={{
            fontWeight: 900, fontSize: '20px', marginBottom: '8px'
          }}>
            Email Support
          </h2>
          <p style={{
            color: '#6b7280', fontSize: '14px',
            marginBottom: '16px', lineHeight: 1.6
          }}>
            Send us an email and we'll get back to you within 24 hours.
            For urgent payment issues, we respond within 2 hours.
          </p>
          <a href="mailto:support.globalhub.team@gmail.com"
            style={{
              display: 'inline-flex', alignItems: 'center',
              gap: '8px', background: '#22c55e', color: 'black',
              padding: '14px 28px', borderRadius: '12px',
              fontWeight: 900, fontSize: '15px',
              textDecoration: 'none'
            }}>
            <Mail size={18} />
            support.globalhub.team@gmail.com
          </a>
          <p style={{
            color: '#374151', fontSize: '12px', marginTop: '12px'
          }}>
            <Clock size={12}
              style={{ display: 'inline', marginRight: '4px' }} />
            Available 24 hours a day, 7 days a week
          </p>
        </div>

        {/* What to include */}
        <div style={{
          background: '#0f1f33', border: '1px solid #1a2740',
          borderRadius: '16px', padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontWeight: 900, fontSize: '16px',
            marginBottom: '16px', color: '#fbbf24'
          }}>
            📋 When emailing support, please include:
          </h3>
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '10px'
          }}>
            {[
              'Your registered email address',
              'Payment reference number (for payment issues)',
              'Screenshot of any error messages',
              'Description of the issue and when it occurred',
              'Your device type and browser (if relevant)',
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', gap: '10px', alignItems: 'center'
              }}>
                <span style={{
                  color: '#22c55e', fontWeight: 900,
                  fontSize: '14px'
                }}>
                  {i + 1}.
                </span>
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <h2 style={{
          fontWeight: 900, fontSize: '18px',
          marginBottom: '16px', textTransform: 'uppercase'
        }}>
          Quick Help
        </h2>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '12px', marginBottom: '32px'
        }}>
          {[
            {
              icon: HelpCircle, label: 'FAQ',
              desc: 'Common questions answered',
              href: '/faq', color: '#a78bfa'
            },
            {
              icon: Shield, label: 'Privacy Policy',
              desc: 'How we protect your data',
              href: '/privacy', color: '#60a5fa'
            },
            {
              icon: BookOpen, label: 'Terms of Service',
              desc: 'Our platform rules',
              href: '/terms', color: '#22c55e'
            },
            {
              icon: MessageCircle, label: 'Responsible Gaming',
              desc: 'Safe gaming resources',
              href: '/responsible-gaming', color: '#fbbf24'
            },
          ].map(item => {
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href} style={{
                background: '#0f1f33',
                border: '1px solid #1a2740',
                borderRadius: '14px', padding: '18px',
                textDecoration: 'none', color: 'white',
                display: 'flex', flexDirection: 'column',
                gap: '8px'
              }}>
                <Icon size={22} color={item.color} />
                <p style={{ fontWeight: 700, fontSize: '14px' }}>
                  {item.label}
                </p>
                <p style={{
                  color: '#6b7280', fontSize: '12px'
                }}>
                  {item.desc}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Common Issues */}
        <h2 style={{
          fontWeight: 900, fontSize: '18px',
          marginBottom: '16px', textTransform: 'uppercase'
        }}>
          Common Issues & Quick Fixes
        </h2>
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '10px'
        }}>
          {[
            {
              issue: '💳 I paid but signals are not unlocked',
              solution: 'Refresh the page and check your account. If still locked, email us your payment reference at support.globalhub.team@gmail.com'
            },
            {
              issue: '🔐 I cannot log into my account',
              solution: 'Use the "Forgot Password" link on the login page. Check spam folder for the reset email. Still stuck? Email us.'
            },
            {
              issue: '💰 I was charged the wrong currency',
              solution: 'Currency is automatically detected by your location. The amount shown at checkout is always final. Contact us if you believe there was an error.'
            },
            {
              issue: '📧 I am not receiving emails',
              solution: 'Check your spam/junk folder. Add support.globalhub.team@gmail.com to your contacts. Some providers delay emails — wait 10 minutes then check again.'
            },
            {
              issue: '✈️ Aviator signals have expired',
              solution: 'Aviator signals are active for 2 hours after dispatch. Expired signals cannot be refunded. Check the platform regularly for new dispatches.'
            },
          ].map((item, i) => (
            <div key={i} style={{
              background: '#0f1f33', border: '1px solid #1a2740',
              borderRadius: '12px', padding: '16px 18px'
            }}>
              <p style={{
                fontWeight: 700, fontSize: '14px', marginBottom: '6px'
              }}>
                {item.issue}
              </p>
              <p style={{
                color: '#9ca3af', fontSize: '13px', lineHeight: 1.6
              }}>
                {item.solution}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}