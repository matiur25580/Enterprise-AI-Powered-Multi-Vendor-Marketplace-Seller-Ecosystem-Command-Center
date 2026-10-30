import { useState } from 'react'; import { useNavigate, Link } from 'react-router-dom'; import axios from 'axios'; import ThemeToggle from '../components/ThemeToggle';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const ROLES=[['buyer','Buyer'],['seller','Seller'],['logistics','Logistics Partner'],['finance','Finance'],['admin','Super Admin']];
export default function Register(){ const nav=useNavigate();
  const [f,setF]=useState({fullName:'',email:'',contact:'',dob:'',role:'buyer',password:'',confirm:''}); const [msg,setMsg]=useState(null); const [loading,setLoading]=useState(false);
  const submit=async e=>{ e.preventDefault(); setMsg(null);
    if(f.password!==f.confirm) return setMsg({t:'err',x:'Passwords do not match'});
    if(!/^\d{8}$/.test(f.dob)) return setMsg({t:'err',x:'DOB must be DDMMYYYY (8 digits)'});
    setLoading(true);
    try{ const {data}=await axios.post(`${API}/auth/register`,{fullName:f.fullName,email:f.email,contact:f.contact,dob:f.dob,role:f.role,password:f.password});
      localStorage.setItem('mp-pending',JSON.stringify({email:f.email,role:f.role}));
      if(data.resend){ setMsg({t:'ok',x:data.msg}); setTimeout(()=>nav('/verify-otp',{state:{email:f.email,role:f.role}}),1200); }
      else nav('/registration-success',{state:{uniqueId:data.uniqueId,email:f.email,role:f.role,fullName:f.fullName}});
    }catch(e){ setMsg({t:'err',x:e.response?.data?.msg||'Registration failed'}); } finally{ setLoading(false); } };
  const s=v=>setF({...f,...v});
  return <div className="page"><div className="card"><ThemeToggle/>
    <h2>Create Account</h2><p className="sub">Join the marketplace ecosystem</p>
    {msg&&<div className={`msg ${msg.t}`}>{msg.x}</div>}
    <form onSubmit={submit}>
      <div className="field"><label>Full Name</label><input required value={f.fullName} onChange={e=>s({fullName:e.target.value})} placeholder="Rahim Uddin"/></div>
      <div className="field"><label>Email</label><input type="email" required value={f.email} onChange={e=>s({email:e.target.value})} placeholder="you@mail.com"/></div>
      <div className="field"><label>Contact Number</label><input required value={f.contact} onChange={e=>s({contact:e.target.value})} placeholder="01XXXXXXXXX"/></div>
      <div className="field"><label>Date of Birth (DDMMYYYY)</label><input required value={f.dob} onChange={e=>s({dob:e.target.value})} placeholder="29081998" maxLength={8} inputMode="numeric"/></div>
      <div className="field"><label>Account Role</label><select value={f.role} onChange={e=>s({role:e.target.value})}>{ROLES.map(r=><option key={r[0]} value={r[0]}>{r[1]}</option>)}</select></div>
      <div className="field"><label>Password</label><input type="password" required value={f.password} onChange={e=>s({password:e.target.value})} placeholder="••••••••"/></div>
      <div className="field"><label>Confirm Password</label><input type="password" required value={f.confirm} onChange={e=>s({confirm:e.target.value})} placeholder="••••••••"/></div>
      <button className="btn" type="submit" disabled={loading} style={loading?{opacity:.6}:null}>{loading?'Please wait...':'SUBMIT'}</button>
    </form>
    <div className="link-row"><span></span><Link to="/login">Already have account? Login</Link></div>
  </div></div>; }
