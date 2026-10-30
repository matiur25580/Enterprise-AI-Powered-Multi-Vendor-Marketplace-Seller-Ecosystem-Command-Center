const axios=require('axios');
module.exports=async(to,subject,html)=>{ if(!to) return;
  const key=process.env.BREVO_API_KEY||process.env.BREVO_KEY;
  const from=process.env.EMAIL_FROM||process.env.BREVO_FROM||process.env.EMAIL_USER;
  if(!key||!from) return;
  try{ await axios.post('https://api.brevo.com/v3/smtp/email',{sender:{email:from,name:'Marketplace'},to:[{email:to}],subject,htmlContent:html},{headers:{'api-key':key,'Content-Type':'application/json'},timeout:15000}); }
  catch(e){ console.log('email fail:',e.response?.data?.message||e.message); } };
