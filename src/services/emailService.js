const nodemailer = require('nodemailer');

/**
 * Creates and returns configured nodemailer transporter.
 * If credentials are missing, falls back to a safe simulated logger so the server never crashes.
 */
function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
  }

  // Fallback simulator transporter
  return null;
}

/**
 * Send an email with HTML template and optional attachments
 */
async function sendMail({ to, subject, html, text, attachments = [] }) {
  const fromName = process.env.SMTP_FROM_NAME || 'Aayup Technologies HR';
  const fromEmail = process.env.SMTP_FROM_EMAIL || 'hr@aayup.com';
  const from = `"${fromName}" <${fromEmail}>`;

  const transporter = getTransporter();

  if (!transporter) {
    console.log(`\n📧 [EMAIL SIMULATION MODE] (Configure SMTP_USER & SMTP_PASS in backend/.env to send live emails)`);
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Attachments: ${attachments.length} file(s)`);
    console.log(`   Sent timestamp: ${new Date().toISOString()}\n`);
    return {
      success: true,
      simulated: true,
      message: 'Email processed in simulation mode (SMTP credentials not yet configured).',
    };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || '',
      html,
      attachments,
    });
    console.log(`✅ Email sent successfully to ${to}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Generate formatted HTML template for Official Corporate Documents
 */
function getDocumentEmailTemplate({ employeeName, documentTitle, category, remarks, downloadUrl }) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
      .header { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
      .header p { margin: 6px 0 0; font-size: 14px; opacity: 0.9; }
      .content { padding: 32px 24px; }
      .badge { display: inline-block; background: #eff6ff; color: #2563eb; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; margin-bottom: 12px; }
      .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0; }
      .card-item { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
      .card-item:last-child { margin-bottom: 0; }
      .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 10px; margin-top: 10px; }
      .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Aayup Technologies</h1>
        <p>Official Employee Document Issuance</p>
      </div>
      <div class="content">
        <span class="badge">${category || 'Corporate HR'}</span>
        <h2 style="margin: 0 0 12px; font-size: 20px; color: #0f172a;">Dear ${employeeName || 'Team Member'},</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px;">
          HR Operations has issued an official document for your records: <strong>${documentTitle}</strong>.
        </p>

        <div class="card">
          <div style="font-size: 13px; margin-bottom: 6px;"><strong>Document:</strong> ${documentTitle}</div>
          <div style="font-size: 13px; margin-bottom: 6px;"><strong>Type:</strong> ${category}</div>
          <div style="font-size: 13px; margin-bottom: 6px;"><strong>Issued On:</strong> ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          ${remarks ? `<div style="font-size: 13px; color: #64748b; margin-top: 8px;"><strong>Note:</strong> ${remarks}</div>` : ''}
        </div>

        <p style="font-size: 13px; line-height: 1.5; color: #64748b;">
          This document is also available directly in your <strong>AayupOnes Mobile App</strong> under the <em>Documents</em> section for anytime access and download.
        </p>

        ${downloadUrl ? `<div style="text-align: center; margin-top: 24px;"><a href="${downloadUrl}" class="btn" target="_blank">Download Document</a></div>` : ''}
      </div>
      <div class="footer">
        <p style="margin: 0 0 4px;">Aayup Technologies Private Limited &bull; Cyber Heights, Vibhuti Khand, Lucknow</p>
        <p style="margin: 0;">This is an automated system email. Please do not reply directly to this message.</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Generate formatted HTML template for Payslip
 */
function getPayslipEmailTemplate({ employeeName, employeeId, month, year, grossPay, netPay, payslipNumber, downloadUrl }) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
      .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px 24px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 22px; font-weight: 800; }
      .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.85; }
      .content { padding: 30px 24px; }
      .salary-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
      .net-amount { font-size: 28px; font-weight: 800; color: #15803d; margin: 8px 0; }
      .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
      .details-table td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
      .btn { display: inline-block; background: #15803d; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 10px; }
      .footer { background: #f8fafc; padding: 18px 24px; text-align: center; font-size: 12px; color: #94a3b8; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Aayup Technologies</h1>
        <p>Salary Disbursement Advice &bull; ${month} ${year || 2026}</p>
      </div>
      <div class="content">
        <h2 style="margin: 0 0 8px; font-size: 18px; color: #0f172a;">Hello ${employeeName || 'Team Member'},</h2>
        <p style="font-size: 13px; color: #64748b; margin: 0;">
          Your salary slip for <strong>${month}</strong> has been generated and disbursed successfully.
        </p>

        <div class="salary-box">
          <div style="font-size: 12px; font-weight: 700; color: #166534; text-transform: uppercase;">Net Pay Credited</div>
          <div class="net-amount">₹ ${Number(netPay || 0).toLocaleString('en-IN')}</div>
          <div style="font-size: 12px; color: #15803d;">Slip No: ${payslipNumber || 'PAY-2026'}</div>
        </div>

        <table class="details-table">
          <tr>
            <td style="color: #64748b;">Employee ID</td>
            <td style="text-align: right; font-weight: 600;">${employeeId}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Gross Earnings</td>
            <td style="text-align: right; font-weight: 600;">₹ ${Number(grossPay || 0).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Payment Month</td>
            <td style="text-align: right; font-weight: 600;">${month}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Status</td>
            <td style="text-align: right; font-weight: 700; color: #15803d;">DISBURSED</td>
          </tr>
        </table>

        <p style="font-size: 13px; color: #64748b; margin: 0 0 16px;">
          You can also view, print, and download this payslip anytime from the <strong>AayupOnes Mobile App</strong> under the <em>Payslips</em> tab.
        </p>

        ${downloadUrl ? `<div style="text-align: center; margin-top: 16px;"><a href="${downloadUrl}" class="btn" target="_blank">View / Download Payslip</a></div>` : ''}
      </div>
      <div class="footer">
        Aayup Technologies Private Limited &bull; Confidential Payroll Communication
      </div>
    </div>
  </body>
  </html>
  `;
}

module.exports = {
  sendMail,
  getDocumentEmailTemplate,
  getPayslipEmailTemplate,
};

