import { useState } from 'react'; import { useNavigate, useLocation, Link } from 'react-router-dom'; import ThemeToggle from '../components/ThemeToggle';
const ROLE_LABEL={buyer:'Buyer',seller:'Seller',logistics:'Logistics Partner',finance:'Finance',admin:'Super Admin'};
export default function RegistrationSuccess(){ const nav=useNavigate(); const loc=useLocation();
  const {uniqueId,email,role,fullName}=loc.state||{};
  const [copied,setCopied]=useState(false);
  if(!uniqueId) return <div className="page"><div className="card"><ThemeToggle/><h2>No data found</h2><p className="sub">Please register first</p><div className="link-row"><span></span><Link to="/register">Go to Register</Link></div></div></div>;
  const copy=()=>{ const done=()=>{setCopied(true);setTimeout(()=>setCopied(false),1500);};
    if(navigator.clipboard) navigator.clipboard.writeText(uniqueId).then(done).catch(done);
    else { const t=document.createElement('textarea'); t.value=uniqueId; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); done(); } };
  return <div className="page"><div className="card"><ThemeToggle/>
    <div style={{width:64,height:64,borderRadius:'50%',background:'#16a34a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,color:'#fff',margin:'0 auto 12px'}}>✓</div>
    <h2 style={{textAlign:'center'}}>Account Verified Successfully!</h2>
    <p className="sub" style={{textAlign:'center'}}>Your {(ROLE_LABEL[role]||role)} account is ready{fullName?`, ${fullName}`:''}</p>
    <div className="msg ok">Registration completed — welcome to the marketplace ecosystem!</div>
    <div style={{margin:'14px 0'}}>
      <div style={{fontSize:13,opacity:.75,marginBottom:6}}>Your Unique ID</div>
      <div style={{display:'flex',gap:8,alignItems:'stretch'}}>
        <div style={{flex:1,fontFamily:'monospace',fontSize:20,fontWeight:700,letterSpacing:2,padding:12,border:'2px dashed #3b82f6',borderRadius:10,textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}}>{uniqueId}</div>
        <button className="btn" style={{width:'auto',padding:'12px 16px'}} onClick={copy}>{copied?'Copied!':'Copy'}</button>
      </div>
    </div>
    <div className="msg" style={{border:'1px solid #f59e0b',background:'rgba(245,158,11,.12)'}}>⚠️ Please save your Unique ID for future reference — you will need it for login help and support.</div>
    <div style={{fontSize:14,opacity:.85,margin:'10px 0',lineHeight:1.8}}>Full Name: <b>{fullName}</b><br/>Email: <b>{email}</b><br/>Role: <b>{ROLE_LABEL[role]||role}</b></div>
    <button className="btn" onClick={()=>nav('/login')}>Go to Login</button>
    <div className="link-row"><Link to="/">← Back to Home</Link><span></span></div>
  </div></div>; }
