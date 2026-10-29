import { useState } from 'react'; import { useNavigate, Link } from 'react-router-dom'; import axios from 'axios'; import ThemeToggle from '../components/ThemeToggle';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const ROLES=[['buyer','Buyer'],['seller','Seller'],['logistics','Logistics Partner'],['finance','Finance'],['admin','Super Admin']];
export default function Login(){ const nav=useNavigate();
  const [f,setF]=useState({role:'buyer',email:'',password:''}); const [show,setShow]=useState(false); const [msg,setMsg]=useState(null); const [needResend,setNeedResend]=useState(false);
  const submit=async e=>{ e.preventDefault(); setMsg(null); setNeedResend(false);
    try{ const {data}=await axios.post(`${API}/auth/login`,f);
      localStorage.setItem('mp-token',data.token); localStorage.setItem('mp-user',JSON.stringify(data.user));
      setMsg({t:'ok',x:'Login successful! Redirecting...'}); setTimeout(()=>nav('/dashboard'),900);
    }catch(e){ const m=e.response?.data?.msg||'Login failed'; setMsg({t:'err',x:m});
      if(m.toLowerCase().includes('verify')){ localStorage.setItem('mp-pending-email',f.email); setNeedResend(true); } } };
  return <div className="page"><div className="card"><ThemeToggle/>
    <h2>Welcome Back</h2><p className="sub">Login to Marketplace Command Center</p>
    {msg&&<div className={`msg ${msg.t}`}>{msg.x}</div>}
    {needResend&&<button className="btn" style={{background:'#7c3aed',marginBottom:12}} onClick={()=>nav('/verify-otp')}>Resend OTP & Verify</button>}
    <form onSubmit={submit}>
      <div className="field"><label>Account Role</label><select value={f.role} onChange={e=>setF({...f,role:e.target.value})}>{ROLES.map(r=><option key={r[0]} value={r[0]}>{r[1]}</option>)}</select></div>
      <div className="field"><label>Email</label><input type="email" required value={f.email} onChange={e=>setF({...f,email:e.target.value})} placeholder="you@mail.com"/></div>
      <div className="field"><label>Password</label><div className="pass-wrap"><input type={show?'text':'password'} required value={f.password} onChange={e=>setF({...f,password:e.target.value})} placeholder="••••••••"/><button type="button" className="eye" onClick={()=>setShow(s=>!s)}>{show?'🙈':'👁️'}</button></div></div>
      <button className="btn" type="submit">Login</button>
    </form>
    <div className="link-row"><Link to="/forgot">Forgot password?</Link><Link to="/register">New here? Register</Link></div>
  </div></div>; }
