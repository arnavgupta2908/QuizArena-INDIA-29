import nodemailer from 'nodemailer';
import { db, Participant, Payment, EmailAlertLog } from './db.ts';

function createTransporter() {
  const emailSettings = db.getEmailSettings();
  if (emailSettings.smtp_host && emailSettings.smtp_user && emailSettings.smtp_pass) {
    return nodemailer.createTransport({
      host: emailSettings.smtp_host,
      port: emailSettings.smtp_port || 587,
      secure: emailSettings.smtp_secure || false,
      auth: {
        user: emailSettings.smtp_user,
        pass: emailSettings.smtp_pass
      }
    });
  }
  return null;
}

export async function triggerNewRegistrationEmailAlert(
  participant: Participant,
  payment: Payment,
  baseUrl: string = ''
): Promise<{ success: boolean; status: 'SENT' | 'SIMULATED' | 'FAILED'; log: EmailAlertLog }> {
  const emailSettings = db.getEmailSettings();
  const recipient = emailSettings.admin_notification_email || 'arnavgupta2580@gmail.com';
  const now = new Date().toISOString();
  const logId = `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (!emailSettings.enabled) {
    const log: EmailAlertLog = {
      id: logId,
      registration_id: participant.registration_id,
      participant_name: participant.full_name,
      recipient_email: recipient,
      subject: `[DISABLED] New Registration Alert: ${participant.full_name} (${participant.registration_id})`,
      content: 'Email notifications are currently disabled in Admin Settings.',
      sent_at: now,
      status: 'SIMULATED'
    };
    db.addEmailLog(log);
    return { success: true, status: 'SIMULATED', log };
  }

  const adminUrl = baseUrl ? `${baseUrl}/#admin` : 'https://quizarena.in/#admin';
  const subject = `⚡ [NEW REGISTRATION] ${participant.full_name} (${participant.registration_id}) - Payment Verification Required`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New QuizArena Registration Alert</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050814; color: #f1f5f9; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background-color: #0c1228; border: 1px solid #d97706; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #101a42 0%, #070c1e 100%); padding: 24px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .badge { display: inline-block; background-color: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 12px; }
    .title { font-size: 22px; font-weight: 800; color: #ffffff; margin: 0; }
    .subtitle { font-size: 13px; color: #94a3b8; margin-top: 4px; }
    .content { padding: 24px; }
    .alert-box { background-color: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; color: #fde68a; }
    .table-details { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .table-details td { padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; }
    .label { color: #94a3b8; width: 40%; font-weight: 600; }
    .value { color: #ffffff; font-weight: 700; }
    .utr { font-family: monospace; color: #fbbf24; font-size: 14px; background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px; }
    .btn-container { text-align: center; margin: 28px 0 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #020617; font-weight: 900; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 14px; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3); }
    .footer { background-color: #050814; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.05); }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="badge">⚡ ACTION REQUIRED: NEW REGISTRATION</div>
      <h1 class="title">QUIZARENA INDIA</h1>
      <p class="subtitle">Real-Time Administrator Payment Verification Alert</p>
    </div>
    <div class="content">
      <div class="alert-box">
        A new participant has just registered and submitted their UPI payment proof. Please review the details below and verify in your admin dashboard.
      </div>
      <table class="table-details">
        <tr>
          <td class="label">Registration ID:</td>
          <td class="value" style="color: #fbbf24; font-family: monospace; font-size: 15px;">${participant.registration_id}</td>
        </tr>
        <tr>
          <td class="label">Participant Name:</td>
          <td class="value">${participant.full_name}</td>
        </tr>
        <tr>
          <td class="label">Mobile Number:</td>
          <td class="value">+91 ${participant.mobile}</td>
        </tr>
        <tr>
          <td class="label">Email Address:</td>
          <td class="value">${participant.email}</td>
        </tr>
        <tr>
          <td class="label">Location:</td>
          <td class="value">${participant.city}, ${participant.state}</td>
        </tr>
        <tr>
          <td class="label">Age:</td>
          <td class="value">${participant.age} years</td>
        </tr>
        <tr>
          <td class="label">Amount Paid:</td>
          <td class="value" style="color: #4ade80;">₹${payment.amount}</td>
        </tr>
        <tr>
          <td class="label">UPI UTR / Trans ID:</td>
          <td class="value"><span class="utr">${payment.utr_number}</span></td>
        </tr>
        <tr>
          <td class="label">Payment Status:</td>
          <td class="value" style="color: #fbbf24;">PENDING VERIFICATION</td>
        </tr>
        <tr>
          <td class="label">Submission Time:</td>
          <td class="value">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td>
        </tr>
      </table>

      <div class="btn-container">
        <a href="${adminUrl}" class="btn">OPEN ADMIN DASHBOARD TO VERIFY</a>
      </div>
    </div>
    <div class="footer">
      QuizArena India Administrative Alert System • Access URL: ${adminUrl}
    </div>
  </div>
</body>
</html>
`;

  const plainTextContent = `
[QUIZARENA INDIA - NEW REGISTRATION ALERT]

A new participant has submitted their registration and payment:

Registration ID: ${participant.registration_id}
Participant: ${participant.full_name}
Mobile: +91 ${participant.mobile}
Email: ${participant.email}
Location: ${participant.city}, ${participant.state}
Amount: ₹${payment.amount}
UPI UTR: ${payment.utr_number}
Status: PENDING VERIFICATION

To verify or reject this payment, open the Admin Console:
${adminUrl}
`;

  const transporter = createTransporter();

  if (transporter) {
    try {
      await transporter.sendMail({
        from: emailSettings.from_email || `"QuizArena India" <${emailSettings.smtp_user}>`,
        to: recipient,
        subject,
        text: plainTextContent,
        html: htmlContent
      });

      const log: EmailAlertLog = {
        id: logId,
        registration_id: participant.registration_id,
        participant_name: participant.full_name,
        recipient_email: recipient,
        subject,
        content: plainTextContent,
        sent_at: now,
        status: 'SENT'
      };
      db.addEmailLog(log);
      console.log(`[EMAIL ALERT] Real SMTP email sent to ${recipient} for ${participant.registration_id}`);
      return { success: true, status: 'SENT', log };
    } catch (err: any) {
      console.error('[EMAIL ALERT] SMTP Error sending email:', err.message);
      const log: EmailAlertLog = {
        id: logId,
        registration_id: participant.registration_id,
        participant_name: participant.full_name,
        recipient_email: recipient,
        subject,
        content: plainTextContent,
        sent_at: now,
        status: 'FAILED',
        error_message: err.message
      };
      db.addEmailLog(log);
      return { success: false, status: 'FAILED', log };
    }
  } else {
    // Simulated / Dispatched to internal audit log
    const log: EmailAlertLog = {
      id: logId,
      registration_id: participant.registration_id,
      participant_name: participant.full_name,
      recipient_email: recipient,
      subject,
      content: plainTextContent,
      sent_at: now,
      status: 'SIMULATED'
    };
    db.addEmailLog(log);
    console.log(`[EMAIL ALERT DISPATCHED] Triggered alert to ${recipient} for ${participant.registration_id}`);
    return { success: true, status: 'SIMULATED', log };
  }
}

export async function sendTestEmailAlert(toEmail?: string, baseUrl: string = ''): Promise<{
  success: boolean;
  status: 'SENT' | 'SIMULATED' | 'FAILED';
  message: string;
  log: EmailAlertLog;
}> {
  const emailSettings = db.getEmailSettings();
  const recipient = toEmail || emailSettings.admin_notification_email || 'arnavgupta2580@gmail.com';
  const now = new Date().toISOString();
  const logId = `test_${Date.now()}`;
  const subject = `🔔 [TEST ALERT] QuizArena India Notification Trigger Verified`;

  const sampleParticipant: Participant = {
    id: 'test_sample',
    registration_id: 'QAI-TEST-99999',
    full_name: 'Test Candidate (Sample)',
    mobile: '9876543210',
    email: recipient,
    age: 21,
    state: 'Delhi (NCT)',
    city: 'New Delhi',
    competition_id: 'comp_national_2026',
    status: 'PENDING',
    created_at: now
  };

  const samplePayment: Payment = {
    id: 'test_pay',
    registration_id: 'QAI-TEST-99999',
    amount: 50,
    utr_number: '439201948201',
    payment_screenshot: '',
    payment_status: 'PENDING',
    verified_at: null,
    verified_by: null,
    rejection_reason: null
  };

  const res = await triggerNewRegistrationEmailAlert(sampleParticipant, samplePayment, baseUrl);
  return {
    success: res.success,
    status: res.status,
    message: res.status === 'SENT'
      ? `Real test email successfully sent to ${recipient} via your configured SMTP server!`
      : `Test notification alert generated and recorded in the alert inbox for ${recipient}! To send live external emails via SMTP, configure your SMTP server details in the settings below.`,
    log: res.log
  };
}
