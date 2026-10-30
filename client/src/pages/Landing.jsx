import {Link} from 'react-router-dom';
import {useEffect,useState} from 'react';
const pad=n=>String(n).padStart(2,'0');
const btn=c=>({background:c,color:'#fff',padding:'12px 34px',borderRadius:999,textDecoration:'none',fontWeight:800,fontSize:15});
export default function Landing(){
  const [now,setNow]=useState(new Date());
  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),1000);return ()=>clearInterval(t);},[]);
  const date=`${pad(now.getDate())}.${pad(now.getMonth()+1)}.${now.getFullYear()}`;
  const hr=now.getHours(),ap=hr>=12?'PM':'AM',h12=hr%12||12;
  const time=`${pad(h12)}.${pad(now.getMinutes())}.${pad(now.getSeconds())} ${ap}`;
  const roles=[
    {icon:'\u{1F3EA}',name:'Seller',desc:'Products, flash deals, coupons, reviews & AI sales forecast'},
    {icon:'\u{1F6D2}',name:'Buyer',desc:'AI recommendations, wishlist, wallet cashback & live tracking'},
    {icon:'\u{1F69A}',name:'Logistics',desc:'Dispatch flow, delivery notes, fraud alerts & performance'},
    {icon:'\u{1F4B0}',name:'Finance',desc:'GMV, commissions, payouts, refunds & monthly reports'},
    {icon:'\u{1F451}',name:'Super Admin',desc:'Users, KYC, announcements, coupons & full control'},
  ];
  return <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0f172a,#1e1b4b 55%,#0f172a)',color:'#fff'}}>
    <div style={{maxWidth:1020,margin:'0 auto',padding:'36px 20px'}}>
      <div style={{display:'flex',justifyContent:'center',marginBottom:26}}>
        <div style={{display:'flex',gap:22,background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.16)',padding:'10px 26px',borderRadius:999,fontWeight:700,fontSize:15}}>
          <span>📅 {date}</span><span>🕐 {time}</span>
        </div>
      </div>
      <div style={{textAlign:'center',marginBottom:34}}>
        <div style={{fontSize:58,marginBottom:6}}>🏪</div>
        <h1 style={{fontSize:42,margin:'0 0 10px',background:'linear-gradient(90deg,#60a5fa,#a78bfa,#f472b6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontWeight:900}}>Enterprise Marketplace</h1>
        <p style={{opacity:.72,fontSize:16,maxWidth:660,margin:'0 auto',lineHeight:1.6}}>AI-powered multi-vendor marketplace &amp; seller ecosystem — 5 role-based command centers, flash deals, wallet cashback, fraud detection &amp; real-time notifications.</p>
      </div>
      <div style={{display:'flex',gap:12,justifyContent:'center',marginBottom:42,flexWrap:'wrap'}}>
        <Link to="/login" style={btn('#3b82f6')}>Login</Link>
        <Link to="/register" style={btn('#8b5cf6')}>Create Account</Link>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:14}}>
        {roles.map(r=><div key={r.name} style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.12)',borderRadius:14,padding:18}}>
          <div style={{fontSize:30}}>{r.icon}</div>
          <div style={{fontWeight:800,margin:'8px 0 4px'}}>{r.name}</div>
          <div style={{fontSize:13,opacity:.62,lineHeight:1.5}}>{r.desc}</div>
        </div>)}
      </div>
      <p style={{textAlign:'center',opacity:.38,fontSize:12,marginTop:44}}>MERN · OTP secured · Enterprise grade</p>
    </div>
  </div>;
}
