import { useLocation, Link, useNavigate } from 'react-router-dom'; import ThemeToggle from '../components/ThemeToggle';
const ROLE_LABEL={buyer:'Buyer',seller:'Seller',logistics:'Logistics Partner',finance:'Finance',admin:'Super Admin'};
export default function RegistrationSuccess(){ const nav=useNavigate(); const loc=useLocation();
  const {uniqueId,email,role,fullName}=loc.state||{};
  if(!uniqueId) return <div className="page"><div className="card"><ThemeToggle/><h2>No data found</h2><p className="sub">Please register first</p><div className="link-row"><span></span><Link to="/register">Go to Register</Link></div></div></div>;
  return <div className="page"><div className="card"><ThemeToggle/>
    <div style={{fontSize:52,textAlign:'center',marginBottom:4}}>🎉</div>
    <h2 style={{textAlign:'center'}}>Successfully Registered!</h2>
    <p className="sub" style={{textAlign:'center'}}>Welcome, <b>{fullName}</b> ({ROLE_LABEL[role]||role})</p>
    <div style={{textAlign:'center',opacity:.75,margin:'14px 0 8px'}}>Your Unique ID</div>
    <div style={{fontFamily:'monospace',fontSize:30,fontWeight:800,letterSpacing:3,color:'#38bdf8',border:'2px dashed #38bdf8',borderRadius:12,padding:'14px 8px',textAlign:'center',marginBottom:14}}>{uniqueId}</div>
    <div className="msg ok" style={{textAlign:'left'}}>ℹ️ Please <b>save this ID</b> for future reference. You will need it to login and for all marketplace services.</div>
    <button className="btn" onClick={()=>nav('/login')}>Go to Login →</button>
    <div className="link-row"><Link to="/">← Back to Home</Link><span></span></div>
  </div></div>; }
