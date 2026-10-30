// Brevo HTTP API (Render free tier e kaaj kore - SMTP port okhane blocked)
// Local Termux test er jonno Gmail SMTP fallback
const nodemailer = require('nodemailer');
async function viaBrevo(to, subject, html) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender: { email: process.env.EMAIL_USER, name: 'Marketplace Command Center' }, to: [{ email: to }], subject, htmlContent: html }),
  });
  if (!res.ok) throw new Error('Brevo ' + res.status + ': ' + (await res.text()).slice(0,150));
}
async function viaSmtp(to, subject, html) {
  const t = nodemailer.createTransport({ service: 'gmail',
    auth: { user: process.env.EMAIL_USER?.trim(), pass: (process.env.EMAIL_PASS||'').replace(/\s+/g,'') },
    connectionTimeout:10000, greetingTimeout:10000, socketTimeout:15000 });
  await t.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
}
module.exports = async (to, subject, html) => {
  if (process.env.BREVO_API_KEY) return viaBrevo(to, subject, html);
  return viaSmtp(to, subject, html);
};
