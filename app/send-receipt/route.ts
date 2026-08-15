import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const {
      email, name, reference,
      signalType, signalsCount, bonusSignals,
      amount, currency, planLabel,
      appUrl, signalsLink, availableSignals
    } = await request.json();

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('❌ Critical: RESEND_API_KEY is missing from environment variables.');
      return Response.json({ success: false, error: 'Email service unconfigured' }, { status: 500 });
    }

    const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

    const signalEmoji = signalType === 'football' ? '⚽' : '✈️';
    const signalName = signalType === 'football' ? 'Football' : 'Aviator';
    const totalSignals = Number(signalsCount || 0) + Number(bonusSignals || 0);

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a1628;font-family:-apple-system,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 20px;">

  <div style="text-align:center;margin-bottom:28px;">
    <div style="background:#0f1f33;border:1px solid #1a2740;border-radius:16px;padding:16px 24px;display:inline-block;">
      <span style="font-weight:900;font-size:22px;color:white;">GLOBAL<span style="color:#22c55e;">HUB</span></span>
    </div>
  </div>

  <div style="background:rgba(34,197,94,0.08);border:2px solid rgba(34,197,94,0.25);border-radius:16px;padding:28px;text-align:center;margin-bottom:20px;">
    <div style="font-size:52px;margin-bottom:12px;">✅</div>
    <h1 style="color:#22c55e;font-size:24px;font-weight:900;margin:0 0 8px;">Payment Successful!</h1>
    <p style="color:#86efac;font-size:15px;margin:0;">Your ${signalName} signals are unlocked and ready!</p>
  </div>

  <div style="text-align:center;margin-bottom:20px;">
    <a href="${signalsLink || appUrl}"
      style="display:inline-block;background:#22c55e;color:black;padding:16px 36px;border-radius:12px;font-weight:900;font-size:16px;text-decoration:none;text-transform:uppercase;">
      ${signalEmoji} View Your Signals Now
    </a>
    <p style="color:#6b7280;font-size:12px;margin-top:10px;">
      Click above to access your ${totalSignals} unlocked signal${totalSignals > 1 ? 's' : ''}
    </p>
  </div>

  <div style="background:#0f1f33;border:1px solid #1a2740;border-radius:16px;padding:22px;margin-bottom:20px;">
    <p style="color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 14px;">Payment Receipt</p>
    <table style="width:100%;border-collapse:collapse;">
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
        <td style="padding:12px 0 0;color:#6b7280;font-size:14px;font-weight:700;">Amount Paid</td>
        <td style="padding:12px 0 0;color:#22c55e;font-size:22px;font-weight:900;font-family:monospace;text-align:right;">${currency} ${amount?.toLocaleString()}</td>
      </tr>
    </table>
  </div>

  <div style="background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.2);border-radius:12px;padding:16px;margin-bottom:20px;text-align:center;">
    <p style="color:#fde68a;font-size:13px;margin:0;">
      ⏰ <strong>Your signals are valid for ${signalType === 'aviator' ? '2 hours' : '24 hours'}</strong> from purchase time.
      Access them before they expire!
    </p>
  </div>

  <div style="background:#0f1f33;border:1px solid #1a2740;border-radius:14px;padding:18px;margin-bottom:24px;">
    <p style="color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;margin:0 0 12px;">Quick Tips</p>
    ${signalType === 'football' ? `
    <p style="color:#9ca3af;font-size:13px;margin:0 0 8px;">⚽ Check the odds before the match starts</p>
    <p style="color:#9ca3af;font-size:13px;margin:0 0 8px;">📊 Follow our recommended signal</p>
    <p style="color:#9ca3af;font-size:13px;margin:0;">🏆 Use a licensed betting platform</p>
    ` : `
    <p style="color:#9ca3af;font-size:13px;margin:0 0 8px;">✈️ Enter at the exact multiplier shown</p>
    <p style="color:#9ca3af;font-size:13px;margin:0 0 8px;">⚡ Cash out at the exit point</p>
    <p style="color:#9ca3af;font-size:13px;margin:0;">🛡️ Never risk more than you can afford</p>
    `}
  </div>

  <div style="text-align:center;margin-bottom:24px;">
    <p style="color:#6b7280;font-size:13px;margin:0 0 8px;">Issues? We respond within 2 hours.</p>
    <a href="mailto:support.globalhub.team@gmail.com" style="color:#22c55e;font-size:14px;font-weight:700;text-decoration:none;">
      support.globalhub.team@gmail.com
    </a>
  </div>

  <div style="border-top:1px solid #1a2740;padding-top:20px;text-align:center;">
    <p style="color:#374151;font-size:11px;margin:0 0 6px;">© 2026 GlobalHub. All rights reserved.</p>
    <p style="color:#374151;font-size:11px;margin:0;">
      <a href="${appUrl}/terms" style="color:#374151;text-decoration:none;">Terms</a> ·
      <a href="${appUrl}/privacy" style="color:#374151;text-decoration:none;"> Privacy</a> ·
      <a href="${appUrl}/responsible-gaming" style="color:#374151;text-decoration:none;"> Responsible Gaming</a>
    </p>
  </div>

</div>
</body>
</html>`;

    // STRATEGIC FIX: Auto-adjust payload criteria if using the default Resend sandbox domain
    const isSandboxMode = fromEmail === 'onboarding@resend.dev';
    
    const formattedFrom = isSandboxMode 
      ? 'onboarding@resend.dev' 
      : `GlobalHub <${fromEmail}>`;

    // In Sandbox Mode, emails to external users fail. Re-route them to your dashboard test recipient email profile.
    const finalRecipient = isSandboxMode
      ? 'support.globalhub.team@gmail.com' // Ensure this is the email you signed up to Resend with!
      : email;

    if (isSandboxMode) {
      console.warn(`⚠️ API Route running in Sandbox Mode. Redirecting receipt from client [${email}] to verified owner [${finalRecipient}]`);
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: formattedFrom,
        to: [finalRecipient],
        subject: `✅ Payment Confirmed — ${planLabel} | GlobalHub`,
        html,
      }),
    });

    const responseData = await res.json();
    if (!res.ok) {
      console.error('❌ Resend API dispatch failure logs:', responseData);
      return Response.json({ success: false, error: responseData }, { status: res.status });
    }

    return Response.json({ success: true, emailId: responseData.id, sandboxRedirect: isSandboxMode });

  } catch (error) {
    console.error('❌ Internal Server Exception:', error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}