import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const {
      email, name, reference,
      signalType, signalsCount,
      bonusSignals, amount,
      currency, planLabel
    } = await request.json();

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log('Resend not configured — skipping email');
      return Response.json({ success: true, skipped: true });
    }

    const fromEmail = process.env.EMAIL_FROM ||
      'onboarding@resend.dev';

    const signalEmoji = signalType === 'football' ? '⚽' : '✈️';
    const signalName = signalType === 'football'
      ? 'Football' : 'Aviator';
    const totalSignals = signalsCount + (bonusSignals || 0);
    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric',
      month: 'long', day: 'numeric'
    });

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Payment Receipt - GlobalHub</title>
</head>
<body style="margin:0;padding:0;background:#0a1628;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:10px;background:#0f1f33;border:1px solid #1a2740;border-radius:16px;padding:16px 28px;">
        <div style="width:36px;height:36px;background:#22c55e;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;">
          <span style="color:black;font-size:18px;font-weight:900;">G</span>
        </div>
        <span style="color:white;font-weight:900;font-size:22px;letter-spacing:-0.5px;">
          GLOBAL<span style="color:#22c55e;">HUB</span>
        </span>
      </div>
    </div>

    <!-- Success Banner -->
    <div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.25);border-radius:16px;padding:28px;text-align:center;margin-bottom:24px;">
      <div style="font-size:48px;margin-bottom:12px;">✅</div>
      <h1 style="color:#22c55e;font-size:26px;font-weight:900;margin:0 0 8px;letter-spacing:-0.5px;">
        Payment Successful!
      </h1>
      <p style="color:#86efac;font-size:15px;margin:0;">
        Your ${signalName} signals are now unlocked and ready!
      </p>
    </div>

    <!-- Receipt Card -->
    <div style="background:#0f1f33;border:1px solid #1a2740;border-radius:16px;padding:24px;margin-bottom:20px;">
      <p style="color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 16px;">
        Payment Receipt
      </p>

      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #1a2740;color:#6b7280;font-size:13px;">Date</td>
          <td style="padding:10px 0;border-bottom:1px solid #1a2740;color:white;font-size:13px;font-weight:700;text-align:right;">${date}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #1a2740;color:#6b7280;font-size:13px;">Reference</td>
          <td style="padding:10px 0;border-bottom:1px solid #1a2740;color:#9ca3af;font-size:12px;font-family:monospace;text-align:right;">${reference}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #1a2740;color:#6b7280;font-size:13px;">Plan</td>
          <td style="padding:10px 0;border-bottom:1px solid #1a2740;color:white;font-size:13px;font-weight:700;text-align:right;">${planLabel}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #1a2740;color:#6b7280;font-size:13px;">Signals</td>
          <td style="padding:10px 0;border-bottom:1px solid #1a2740;color:white;font-size:13px;font-weight:700;text-align:right;">
            ${signalEmoji} ${totalSignals} ${signalName} Signal${totalSignals > 1 ? 's' : ''}
            ${bonusSignals > 0 ? `<br><span style="color:#fbbf24;font-size:11px;">+${bonusSignals} FREE bonus!</span>` : ''}
          </td>
        </tr>
        <tr>
          <td style="padding:14px 0 0;color:#6b7280;font-size:14px;font-weight:700;">Total Paid</td>
          <td style="padding:14px 0 0;color:#22c55e;font-size:22px;font-weight:900;font-family:monospace;text-align:right;">
            ${currency} ${amount.toLocaleString()}
          </td>
        </tr>
      </table>
    </div>

    <!-- Validity Notice -->
    <div style="background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.2);border-radius:12px;padding:16px;margin-bottom:20px;text-align:center;">
      <p style="color:#fde68a;font-size:13px;margin:0;">
        ⏰ <strong>Valid for 24 hours</strong> from time of purchase.
        Access your signals before they expire!
      </p>
    </div>

    <!-- CTA Buttons -->
    <div style="margin-bottom:28px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/${signalType}"
        style="display:block;background:#22c55e;color:black;text-align:center;padding:16px;border-radius:12px;font-weight:900;font-size:16px;text-decoration:none;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:10px;">
        ${signalEmoji} View My ${signalName} Signals
      </a>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/account"
        style="display:block;background:#0f1f33;color:#9ca3af;text-align:center;padding:14px;border-radius:12px;font-weight:700;font-size:14px;text-decoration:none;border:1px solid #1a2740;">
        Go to My Account
      </a>
    </div>

    <!-- Tips -->
    <div style="background:#0f1f33;border:1px solid #1a2740;border-radius:14px;padding:20px;margin-bottom:24px;">
      <p style="color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">
        Tips For Best Results
      </p>
      ${signalType === 'football' ? `
      <p style="color:#9ca3af;font-size:13px;margin:0 0 8px;">⚽ Check odds before match kicks off</p>
      <p style="color:#9ca3af;font-size:13px;margin:0 0 8px;">📊 Follow our recommended stake sizes</p>
      <p style="color:#9ca3af;font-size:13px;margin:0;">🏆 Use a reputable betting platform</p>
      ` : `
      <p style="color:#9ca3af;font-size:13px;margin:0 0 8px;">✈️ Enter at the exact multiplier shown</p>
      <p style="color:#9ca3af;font-size:13px;margin:0 0 8px;">⚡ Cash out at the exit point — don't be greedy!</p>
      <p style="color:#9ca3af;font-size:13px;margin:0;">🛡️ Never risk more than you can afford to lose</p>
      `}
    </div>

    <!-- Support -->
    <div style="text-align:center;margin-bottom:24px;">
      <p style="color:#6b7280;font-size:13px;margin:0 0 8px;">
        Need help? Contact our support team
      </p>
      <a href="mailto:support@globalhub.com"
        style="color:#22c55e;font-size:13px;font-weight:700;text-decoration:none;">
        support@globalhub.com
      </a>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #1a2740;padding-top:20px;text-align:center;">
      <p style="color:#374151;font-size:11px;margin:0 0 6px;">
        © 2026 GlobalHub. All rights reserved.
      </p>
      <p style="color:#374151;font-size:11px;margin:0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/terms"
          style="color:#374151;text-decoration:none;">Terms</a>
        &nbsp;·&nbsp;
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/privacy"
          style="color:#374151;text-decoration:none;">Privacy</a>
        &nbsp;·&nbsp;
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/responsible-gaming"
          style="color:#374151;text-decoration:none;">Responsible Gaming</a>
      </p>
    </div>

  </div>
</body>
</html>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `GlobalHub <${fromEmail}>`,
        to: [email],
        subject: `✅ Payment Confirmed — ${planLabel} | GlobalHub`,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Resend error:', data);
      return Response.json({
        success: false,
        error: data.message
      });
    }

    return Response.json({
      success: true,
      emailId: data.id
    });

  } catch (error) {
    console.error('Email error:', error);
    return Response.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}