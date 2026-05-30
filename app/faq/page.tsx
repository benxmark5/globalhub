"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Trophy, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    category: '🚀 Getting Started',
    questions: [
      {
        q: 'What is GlobalHub?',
        a: 'GlobalHub is a professional sports signals platform providing expert football analysis and Aviator game signals to users worldwide. Our team of analysts reviews matches and game patterns daily, delivering data-driven signals to help you make informed decisions.'
      },
      {
        q: 'How do I create an account?',
        a: 'Click "Join Now" on the homepage, enter your name, email, and create a strong password. You must be 18+ and agree to our Terms of Service. Your account is created instantly and you can start browsing signals immediately.'
      },
      {
        q: 'Is GlobalHub available in my country?',
        a: 'Yes! GlobalHub is available worldwide in 100+ countries. Our platform supports multiple currencies and payment methods. Simply register and you will be served in your local context.'
      },
      {
        q: 'What languages does GlobalHub support?',
        a: 'Our website is available in 10 languages: English, Chinese (Mandarin), Hindi, Spanish, French, Arabic, Portuguese, Russian, Swahili, and German. The language is auto-detected based on your browser settings, or you can switch manually.'
      },
    ]
  },
  {
    category: '⚽ Football Signals',
    questions: [
      {
        q: 'What are football signals?',
        a: 'Football signals are expert recommendations for specific match outcomes, including which team to back, the odds range, and our confidence level. Our analysts study team form, head-to-head history, injuries, weather, and other factors to produce each signal.'
      },
      {
        q: 'How accurate are the signals?',
        a: 'Our football signals achieve an accuracy rate of approximately 94% based on historical performance. However, no signal can guarantee a win — all sporting events carry inherent uncertainty. We encourage responsible use of all signals.'
      },
      {
        q: 'How long are signals valid?',
        a: 'All purchased signals are valid for 24 hours from the time of purchase. This covers the match day and evening, giving you ample time to act on the signal.'
      },
      {
        q: 'Can I buy signals for specific games?',
        a: 'Yes! With our cart system, you can select exactly which games you want. Add them to your cart and pay once for all of them. You choose how many and which signals you want — there are no fixed bundles you must commit to.'
      },
      {
        q: 'What leagues do you cover?',
        a: 'We cover all major football leagues worldwide, including Premier League, La Liga, Bundesliga, Serie A, Ligue 1, UEFA Champions League, Europa League, MLS, and many African, Asian, and South American leagues.'
      },
    ]
  },
  {
    category: '✈️ Aviator Signals',
    questions: [
      {
        q: 'What are Aviator signals?',
        a: 'Aviator signals are entry and exit point recommendations for the popular Aviator crash game. Our analysts use pattern analysis on round history to identify likely multiplier ranges for upcoming rounds.'
      },
      {
        q: 'Are Aviator signals guaranteed?',
        a: 'No. Aviator is a random number generator-based game and no outcome can be predicted with certainty. Our signals are based on statistical pattern analysis and provide informed guidance, not guarantees. Always play responsibly.'
      },
      {
        q: 'What does the confidence percentage mean?',
        a: 'The confidence percentage indicates how strongly our pattern analysis supports the signal. Higher confidence means the pattern data more strongly supports that entry/exit range. A 75% confidence signal is not a guarantee — it means our analysis supports it at that level.'
      },
      {
        q: 'How long are Aviator signals active?',
        a: 'Aviator signals are time-sensitive and are active for 2 hours after dispatch. After that, they expire automatically. Check the expiry time shown on each signal.'
      },
    ]
  },
  {
    category: '💳 Payments & Pricing',
    questions: [
      {
        q: 'What currencies do you accept?',
        a: 'We accept payments in most major world currencies through Paystack. The price displayed at checkout will be automatically converted to your local currency based on your location. You will see the exact amount in your currency before confirming payment.'
      },
      {
        q: 'What payment methods are available?',
        a: 'We support Visa, Mastercard, American Express, M-Pesa (Kenya), Airtel Money, bank transfers, and other mobile money options depending on your country. Paystack handles all payments securely with bank-level encryption.'
      },
      {
        q: 'How much do signals cost?',
        a: 'Football signals start from $1.20 per game. Pricing is tiered by game importance: Normal games are $2.50, Big Games are $4.30, and Super fixtures are $6.00. Aviator signals are $3 per signal. See our Pricing page for full details.'
      },
      {
        q: 'Can I get a refund?',
        a: 'Due to the digital and time-sensitive nature of signals, all purchases are non-refundable once unlocked. If you experience a technical issue preventing access to a purchased signal, contact us at support.globalhub.team@gmail.com within 24 hours and we will review your case.'
      },
      {
        q: 'Is my payment information secure?',
        a: 'Absolutely. All payments are processed by Paystack, a PCI-DSS Level 1 certified payment processor. We never store your card details. All transactions use 256-bit SSL encryption.'
      },
      {
        q: 'Is there a subscription or recurring charge?',
        a: 'No. GlobalHub operates on a pay-as-you-go model. You only pay for the signals you choose to unlock. There are no monthly subscriptions, auto-renewals, or hidden charges.'
      },
    ]
  },
  {
    category: '🔐 Account & Security',
    questions: [
      {
        q: 'How do I reset my password?',
        a: 'Click "Login", then "Forgot Password" and enter your email. You will receive a password reset link within a few minutes. Check your spam folder if you do not see it.'
      },
      {
        q: 'Can I share my account with others?',
        a: 'No. Accounts are for individual use only. Sharing your account or purchased signals violates our Terms of Service and may result in immediate account suspension. Each person must have their own account.'
      },
      {
        q: 'How do I delete my account?',
        a: 'To delete your account, email support.globalhub.team@gmail.com with your registered email and request. We will process account deletion within 30 days per our Privacy Policy.'
      },
      {
        q: 'Why do I need a strong password?',
        a: 'A strong password protects your account and any signals you have purchased. We require passwords with at least 8 characters including uppercase, lowercase, numbers, and special characters to prevent unauthorized access.'
      },
    ]
  },
  {
    category: '🛟 Support',
    questions: [
      {
        q: 'How do I contact support?',
        a: 'Email us at support.globalhub.team@gmail.com. You can also use the live chat widget on our website. We respond to all inquiries within 24 hours, often much faster.'
      },
      {
        q: 'What are support hours?',
        a: 'Our support team is available 24/7 for urgent payment issues. For general inquiries, we respond within 24 hours Monday through Sunday.'
      },
      {
        q: 'I paid but my signals are not unlocked. What do I do?',
        a: 'First, refresh your browser and check your account page. If signals are still not showing, contact support.globalhub.team@gmail.com immediately with your payment reference number. We resolve payment issues within 2 hours.'
      },
    ]
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggle = (key: string) => {
    setOpenItems(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

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
              background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              ❓
            </div>
            <div>
              <h1 style={{
                fontWeight: 900, fontSize: '22px',
                letterSpacing: '-0.5px'
              }}>
                Frequently Asked Questions
              </h1>
              <p style={{ color: '#6b7280', fontSize: '13px' }}>
                Everything you need to know about GlobalHub
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '800px', margin: '0 auto',
        padding: '40px 16px 80px'
      }}>

        {/* Search hint */}
        <div style={{
          background: '#0f1f33', border: '1px solid #1a2740',
          borderRadius: '14px', padding: '16px',
          marginBottom: '32px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap',
          gap: '12px'
        }}>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            Can't find your answer? Contact us directly.
          </p>
          <a href="mailto:support.globalhub.team@gmail.com"
            style={{
              background: '#22c55e', color: 'black',
              padding: '9px 18px', borderRadius: '9px',
              fontWeight: 900, fontSize: '13px',
              textDecoration: 'none'
            }}>
            Email Support
          </a>
        </div>

        {/* FAQ Sections */}
        {faqs.map(section => (
          <div key={section.category} style={{ marginBottom: '36px' }}>
            <h2 style={{
              fontWeight: 900, fontSize: '18px',
              marginBottom: '14px', letterSpacing: '-0.3px'
            }}>
              {section.category}
            </h2>
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '8px'
            }}>
              {section.questions.map((item, i) => {
                const key = `${section.category}-${i}`;
                const isOpen = openItems.includes(key);
                return (
                  <div
                    key={i}
                    style={{
                      background: isOpen
                        ? '#0f1f33' : '#0a1628',
                      border: isOpen
                        ? '1px solid rgba(34,197,94,0.3)'
                        : '1px solid #1a2740',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      transition: 'all 0.2s'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(key)}
                      style={{
                        width: '100%', padding: '16px 18px',
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', gap: '12px',
                        background: 'none', border: 'none',
                        color: 'white', cursor: 'pointer',
                        textAlign: 'left',
                        touchAction: 'manipulation'
                      }}
                    >
                      <span style={{
                        fontWeight: 700, fontSize: '15px',
                        lineHeight: 1.4
                      }}>
                        {item.q}
                      </span>
                      {isOpen
                        ? <ChevronUp size={18} color="#22c55e" style={{ flexShrink: 0 }} />
                        : <ChevronDown size={18} color="#6b7280" style={{ flexShrink: 0 }} />
                      }
                    </button>
                    {isOpen && (
                      <div style={{
                        padding: '0 18px 18px',
                        borderTop: '1px solid #1a2740'
                      }}>
                        <p style={{
                          color: '#9ca3af', fontSize: '14px',
                          lineHeight: 1.8, paddingTop: '14px'
                        }}>
                          {item.a}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Still need help */}
        <div style={{
          background: '#0f1f33', border: '1px solid #1a2740',
          borderRadius: '16px', padding: '28px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>
            🛟
          </div>
          <h3 style={{
            fontWeight: 900, fontSize: '18px', marginBottom: '8px'
          }}>
            Still need help?
          </h3>
          <p style={{
            color: '#6b7280', fontSize: '14px',
            marginBottom: '20px', lineHeight: 1.6
          }}>
            Our support team is available 24/7 and responds within 24 hours.
          </p>
          <div style={{
            display: 'flex', gap: '10px', justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <a href="mailto:support.globalhub.team@gmail.com"
              style={{
                background: '#22c55e', color: 'black',
                padding: '12px 24px', borderRadius: '10px',
                fontWeight: 900, fontSize: '14px',
                textDecoration: 'none'
              }}>
              📧 Email Us
            </a>
            <Link href="/support" style={{
              background: '#0a1628', border: '1px solid #1a2740',
              color: '#9ca3af', padding: '12px 24px',
              borderRadius: '10px', fontWeight: 700,
              fontSize: '14px', textDecoration: 'none'
            }}>
              Support Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}