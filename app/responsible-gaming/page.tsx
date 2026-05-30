import Link from 'next/link';
import { Trophy, ArrowLeft, AlertTriangle, Heart, Phone } from 'lucide-react';

export default function ResponsibleGamingPage() {
  const warningSignsItems = [
    'Spending more than you can afford to lose',
    'Chasing losses by increasing stakes',
    'Neglecting work, family, or personal responsibilities',
    'Borrowing money to fund betting or gaming',
    'Feeling anxious, irritable, or depressed when not gaming',
    'Lying to family or friends about gaming habits',
    'Gambling as an escape from problems or negative emotions',
    'Failed attempts to control or stop gambling',
    'Jeopardizing important relationships due to gambling',
    'Feeling the need to gamble with increasing amounts for excitement',
  ];

  const resources = [
    {
      name: 'Gamblers Anonymous',
      url: 'www.gamblersanonymous.org',
      note: 'Free support groups worldwide',
      available: 'Global'
    },
    {
      name: 'Gambling Therapy',
      url: 'www.gamblingtherapy.org',
      note: 'Free online support and counseling',
      available: 'Global'
    },
    {
      name: 'BeGambleAware',
      url: 'www.begambleaware.org',
      note: 'Resources and live chat support',
      available: 'UK & International'
    },
    {
      name: 'National Problem Gambling Helpline',
      url: '1-800-522-4700',
      note: '24/7 free helpline',
      available: 'USA'
    },
    {
      name: 'GamCare',
      url: 'www.gamcare.org.uk',
      note: 'Free advice and support',
      available: 'UK'
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
              background: 'linear-gradient(135deg,#f59e0b,#d97706)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Heart size={20} color="white" />
            </div>
            <div>
              <h1 style={{
                fontWeight: 900, fontSize: '22px',
                letterSpacing: '-0.5px'
              }}>
                Responsible Gaming
              </h1>
              <p style={{ color: '#6b7280', fontSize: '13px' }}>
                GlobalHub — Our commitment to safe and responsible gaming
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '800px', margin: '0 auto',
        padding: '40px 16px 80px'
      }}>

        {/* Critical warning */}
        <div style={{
          background: 'rgba(251,191,36,0.08)',
          border: '2px solid rgba(251,191,36,0.3)',
          borderRadius: '16px', padding: '24px',
          marginBottom: '40px',
          display: 'flex', gap: '16px', alignItems: 'flex-start'
        }}>
          <AlertTriangle size={28} color="#fbbf24"
            style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h2 style={{
              fontWeight: 900, fontSize: '18px',
              color: '#fbbf24', marginBottom: '10px'
            }}>
              Important Notice
            </h2>
            <p style={{
              color: '#fde68a', fontSize: '14px', lineHeight: 1.7
            }}>
              GlobalHub provides sports and game signals for informational and entertainment purposes only. Betting and gaming carry significant financial risk. <strong>Never bet more than you can afford to lose.</strong> If you or someone you know is struggling with gambling, please reach out to one of the support resources listed on this page.
            </p>
          </div>
        </div>

        {/* Our Commitment */}
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontWeight: 900, fontSize: '20px',
            marginBottom: '20px', textTransform: 'uppercase',
            letterSpacing: '-0.5px'
          }}>
            Our Commitment to You
          </h2>
          <p style={{
            color: '#9ca3af', fontSize: '15px',
            lineHeight: 1.8, marginBottom: '16px'
          }}>
            At GlobalHub, we believe that enjoyment and responsibility go hand in hand. We are committed to providing a safe, transparent environment that supports informed decision-making. We actively promote responsible gaming practices and provide tools and resources to help our users maintain healthy habits.
          </p>
        </div>

        {/* Tips Grid */}
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontWeight: 900, fontSize: '20px',
            marginBottom: '24px', textTransform: 'uppercase'
          }}>
            Tips for Responsible Gaming
          </h2>
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '14px'
          }}>
            {[
              {
                icon: '💰', title: 'Set a Budget',
                desc: 'Decide exactly how much money you can afford to spend before you start. Treat it like entertainment spending — once it\'s gone, stop. Never use money meant for essential expenses like rent, food, or bills.'
              },
              {
                icon: '⏰', title: 'Set Time Limits',
                desc: 'Decide in advance how long you will engage with gaming activities each day. Set alarms or use device features to track time. Regular breaks help maintain perspective and enjoyment.'
              },
              {
                icon: '🧠', title: 'Stay in Control',
                desc: 'Never gamble when you are stressed, emotional, intoxicated, or under pressure. Make decisions with a clear and calm mind. Remember that gaming should be entertaining, not a way to solve financial problems.'
              },
              {
                icon: '📊', title: 'Understand the Risks',
                desc: 'Our signals are based on expert analysis, but no prediction is guaranteed. Sports results and Aviator outcomes involve uncertainty. Always treat signals as one input among many, not as certainties.'
              },
              {
                icon: '🚫', title: 'Never Chase Losses',
                desc: 'If you\'ve had a losing streak, resist the urge to bet more to recover losses. Chasing losses is one of the most common paths to problem gambling. Accept losses as part of the activity and walk away.'
              },
              {
                icon: '👨‍👩‍👧', title: 'Protect Your Family',
                desc: 'Keep your devices and accounts secure to prevent minors from accessing gaming platforms. Talk openly with family about healthy entertainment choices. GlobalHub is strictly for adults aged 18 and over.'
              },
              {
                icon: '🤝', title: 'Talk to Someone',
                desc: 'If gaming is causing stress, financial problems, or relationship difficulties, please talk to someone you trust. Seeking help early is a sign of strength, not weakness. Professional support is available and confidential.'
              },
              {
                icon: '📱', title: 'Use Platform Controls',
                desc: 'Most gaming and betting platforms offer self-exclusion, deposit limits, and cooling-off periods. We encourage you to use these tools if you ever feel your gaming is becoming less controlled.'
              },
            ].map(item => (
              <div key={item.title} style={{
                background: '#0f1f33',
                border: '1px solid #1a2740',
                borderRadius: '14px', padding: '18px 20px',
                display: 'flex', gap: '16px',
                alignItems: 'flex-start'
              }}>
                <span style={{ fontSize: '28px', flexShrink: 0 }}>
                  {item.icon}
                </span>
                <div>
                  <h3 style={{
                    fontWeight: 900, fontSize: '15px',
                    marginBottom: '8px'
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    color: '#9ca3af', fontSize: '14px',
                    lineHeight: 1.7
                  }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warning Signs */}
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontWeight: 900, fontSize: '20px',
            marginBottom: '8px', textTransform: 'uppercase',
            color: '#f87171'
          }}>
            Warning Signs of Problem Gambling
          </h2>
          <p style={{
            color: '#9ca3af', fontSize: '14px',
            marginBottom: '20px', lineHeight: 1.6
          }}>
            Seek help if you recognize any of the following in yourself or someone you know:
          </p>
          <div style={{
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '14px', padding: '20px'
          }}>
            {warningSignsItems.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start',
                gap: '12px', marginBottom: '12px',
                paddingBottom: '12px',
                borderBottom: i < warningSignsItems.length - 1
                  ? '1px solid rgba(239,68,68,0.1)' : 'none'
              }}>
                <span style={{
                  color: '#f87171', fontWeight: 900,
                  fontSize: '14px', flexShrink: 0,
                  marginTop: '1px'
                }}>
                  ⚠
                </span>
                <p style={{
                  color: '#fca5a5', fontSize: '14px',
                  lineHeight: 1.6
                }}>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Help Resources */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontWeight: 900, fontSize: '20px',
            marginBottom: '8px', textTransform: 'uppercase',
            color: '#22c55e'
          }}>
            Help & Support Resources
          </h2>
          <p style={{
            color: '#9ca3af', fontSize: '14px',
            marginBottom: '20px'
          }}>
            Free, confidential help is available worldwide:
          </p>
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '12px'
          }}>
            {resources.map(r => (
              <div key={r.name} style={{
                background: '#0f1f33',
                border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: '12px', padding: '16px',
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', gap: '12px',
                flexWrap: 'wrap'
              }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '15px' }}>
                    {r.name}
                  </p>
                  <p style={{
                    color: '#22c55e', fontSize: '13px',
                    fontFamily: 'monospace', marginTop: '2px'
                  }}>
                    {r.url}
                  </p>
                  <p style={{
                    color: '#6b7280', fontSize: '12px',
                    marginTop: '2px'
                  }}>
                    {r.note}
                  </p>
                </div>
                <span style={{
                  background: 'rgba(34,197,94,0.1)',
                  color: '#22c55e', fontSize: '11px',
                  fontWeight: 700, padding: '4px 10px',
                  borderRadius: '20px', flexShrink: 0
                }}>
                  {r.available}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div style={{
          background: '#0f1f33', border: '1px solid #1a2740',
          borderRadius: '14px', padding: '20px',
          textAlign: 'center'
        }}>
          <Heart size={24} color="#f87171"
            style={{ margin: '0 auto 12px' }} />
          <p style={{
            fontWeight: 900, fontSize: '16px', marginBottom: '8px'
          }}>
            Need to talk to someone at GlobalHub?
          </p>
          <p style={{
            color: '#6b7280', fontSize: '14px',
            marginBottom: '16px'
          }}>
            Our support team can help you access resources or discuss your account.
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