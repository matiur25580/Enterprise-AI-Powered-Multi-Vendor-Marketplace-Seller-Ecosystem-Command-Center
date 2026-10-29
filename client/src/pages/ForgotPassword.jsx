import { useState, useRef, useEffect } from 'react'; import { useNavigate, Link } from 'react-router-dom'; import axios from 'axios'; import ThemeToggle from '../components/ThemeToggle';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export default function Forgot(){ const nav=useNavigate();
  const [step,setStep]=useState(1); const [email,setEmail]=useState(''); const [boxes,setBoxes]=useState(['','','','','','']);
  const [np,setNp]=useState(''); const [msg,setMsg]=useState(null); const [sec,setSec]=useState(0); const refs=useRef([]);
  useEffect(()=>{ if(sec<=0) return; const t=setTimeout(()=>setSec(s=>s-1),1000); return ()=>clearTimeout(t); },[sec]);
  const send=async e=>{ e.preventDefault(); try{ await axios.post(`${API}/auth/send-otp`,{email}); setStep(2); setSec(300); setMsg({t:'ok',x:'OTP sent to your email'}); }catch(e){ setMsg({t:'err',x:e.response?.data?.msg||'Failed'}); } };
  const ch=(i,v)=>{ if(!/^\d?$/.test(v)) return; const b=[...boxes]; b[i]=v; setBoxes(b); if(v&&i<5) refs.current[i+1]?.focus(); };
  const reset=async()=>{ const otp=boxes.join(''); if(otp.length<6) return setMsg({t:'err',x:'Enter 6-digit OTP'});
    try{ const {data}=await axios.post(`${API}/auth/reset-password`,{email,otp,newPassword:np}); setMsg({t:'ok',x:data.msg+' Go to login...'}); setTimeout(()=>nav('/login'),1400);
    }catch(e){ setMsg({t:'err',x:e.response?.data?.msg||'Reset failed'}); } };
  return <div className="page"><div className="card"><ThemeToggle/>
    <h2>Forgot Password</h2><p className="sub">{step===1?'Enter your registered email':'Enter OTP & new password'}</p>
    {msg&&<div className={`msg ${msg.t}`}>{msg.x}</div>}
    {step===1?<form onSubmit={send}><div className="field"><label>Email</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@mail.com"/></div><button className="btn" type="submit">Send OTP</button></form>:
    <><div className="otp-row">{boxes.map((b,i)=><input key={i} ref={el=>refs.current[i]=el} value={b} onChange={e=>ch(i,e.target.value)} maxLength={1} inputMode="numeric"/>)}</div>
    <div className="timer">{sec>0?`Expires in ${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`:'Expired — resend from step 1'}</div>
    <div className="field"><label>New Password</label><input type="password" value={np} onChange={e=>setNp(e.target.value)} placeholder="••••••••"/></div>
    <button className="btn" onClick={reset}>Reset Password</button></>}
    <div className="link-row"><span></span><Link to="/login">Back to Login</Link></div>
  </div></div>; }
