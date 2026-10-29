const nodemailer = require('nodemailer');
module.exports = async (to, subject, html) => {
  const t = nodemailer.createTransport({ service:'gmail', auth:{ user:process.env.EMAIL_USER?.trim(), pass:process.env.EMAIL_PASS?.replace(/\s+/g,'') } });
  await t.sendMail({ from:process.env.EMAIL_USER, to, subject, html });
};
