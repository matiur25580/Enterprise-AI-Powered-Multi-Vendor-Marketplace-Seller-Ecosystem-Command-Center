import { useState, useRef, useEffect } from 'react'; import { useNavigate } from 'react-router-dom'; import axios from 'axios'; import ThemeToggle from '../components/ThemeToggle';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export default function VerifyOtp(){ const nav=useNavigate(); const email=localStorage.getItem('mp-pending-email');
  const [boxes,setBoxes]=useState(['','','','','','']); const [msg,setMsg]=useState(null); const [sec,setSec]=useState(300); const refs=useRef([]);
  useEffect(()=>{ if(sec<=0) return; const t=setTimeout(()=>setSec(s=>s-1),1000); return ()=>clearTimeout(t); },[sec]);
  const ch=(i,v)=>{ if(!/^\d?$/.test(v)) return; const b=[...boxes]; b[i]=v; setBoxes(b); if(v&&i<5) refs.current[i+1]?.focus(); };
  const verify=async()=>{ const otp=boxes.join(''); if(otp.length<6) return setMsg({t:'err',x:'Enter 6-digit OTP'});
    try{ const {data}=await axios.post(`${API}/auth/verify-register`,{email,otp}); setMsg({t:'ok',x:data.msg+' Redirecting to login...'}); setTimeout(()=>nav('/login'),1200);
    }catch(e){ setMsg({t:'err',x:e.response?.data?.msg||'Verification failed'}); } };
  const resend=async()=>{ try{ await axios.post(`${API}/auth/resend-verification`,{email}); setSec(300); setMsg({t:'ok',x:'New OTP sent!'}); }catch(e){ setMsg({t:'err',x:'Resend failed'}); } };
  const mm=String(Math.floor(sec/60)).padStart(2,'0'), ss=String(sec%60).padStart(2,'0');
  return <div className="page"><div className="card"><ThemeToggle/>
    <h2>Verify OTP</h2><p className="sub">Sent to {email}</p>
    {msg&&<div className={`msg ${msg.t}`}>{msg.x}</div>}
    <div className="otp-row">{boxes.map((b,i)=><input key={i} ref={el=>refs.current[i]=el} value={b} onChange={e=>ch(i,e.target.value)} maxLength={1} inputMode="numeric"/>)}</div>
    <div className="timer">{sec>0?`Resend available in ${mm}:${ss}`:'OTP expired'}</div>
    <button className="btn" onClick={verify}>Verify</button>
    {sec===0&&<button className="btn" style={{background:'#6b7280',marginTop:8}} onClick={resend}>Resend OTP</button>}
  </div></div>; }
