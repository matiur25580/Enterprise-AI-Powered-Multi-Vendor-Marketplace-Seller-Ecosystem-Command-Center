const nodemailer = require('nodemailer');
module.exports = async (to, subject, html) => {
  const t = nodemailer.createTransport({ service:'gmail',
    auth:{ user:process.env.EMAIL_USER?.trim(), pass:(process.env.EMAIL_PASS||'').replace(/\s+/g,'') },
    connectionTimeout:10000, greetingTimeout:10000, socketTimeout:15000 });
  await t.sendMail({ from:process.env.EMAIL_USER, to, subject, html });
};
