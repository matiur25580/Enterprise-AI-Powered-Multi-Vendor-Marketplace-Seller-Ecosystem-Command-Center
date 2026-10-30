module.exports=async(to,subject,html)=>{ if(!to) return;
  const key=process.env.BREVO_API_KEY||process.env.BREVO_KEY;
  const from=process.env.EMAIL_FROM||process.env.BREVO_FROM||process.env.EMAIL_USER;
  if(!key||!from) return;
  try{
    const ctrl=new AbortController(); const t=setTimeout(()=>ctrl.abort(),15000);
    const r=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',signal:ctrl.signal,
      headers:{'api-key':key,'Content-Type':'application/json'},
      body:JSON.stringify({sender:{email:from,name:'Marketplace'},to:[{email:to}],subject,htmlContent:html})});
    clearTimeout(t);
    if(!r.ok){ const d=await r.text(); console.log('email fail:',d.slice(0,200)); }
  }catch(e){ console.log('email fail:',e.message); }
};
