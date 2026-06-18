import nodemailer from 'nodemailer';

/**
 * Sends an email using nodemailer.
 * Falls back to console logging in development when SMTP is not configured.
 *
 * @param {object} options - { to, subject, html, text }
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  // Development fallback: log to console if SMTP is not configured
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log('\n========================================');
    console.log('📧  DEV EMAIL FALLBACK (no SMTP configured)');
    console.log(`TO:      ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`BODY:    ${text || html}`);
    console.log('========================================\n');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: smtpUser, pass: smtpPass },
  });

  await transporter.sendMail({
    from: `"Mireakart" <${smtpUser}>`,
    to,
    subject,
    text,
    html,
  });
};

export default sendEmail;
