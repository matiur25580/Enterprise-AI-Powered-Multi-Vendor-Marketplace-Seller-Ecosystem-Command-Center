import {useEffect,useState} from 'react'; import axios from 'axios';
const API=import.meta.env.VITE_API_URL||'http://localhost:5000/api';
export default function LogisticsDash(){ const [orders,setOrders]=useState([]); const [msg,setMsg]=useState(null);
  const tok=()=>({headers:{Authorization:'Bearer '+localStorage.getItem('mp-token')}});
  useEffect(()=>{ axios.get(`${API}/shop/orders`,tok()).then(r=>setOrders(r.data)); },[]);
  const upd=async(id,status)=>{ const {data}=await axios.patch(`${API}/shop/orders/${id}`,{status},tok()); setMsg({t:'ok',x:data.msg}); setOrders(orders.map(o=>o._id===id?{...o,status}:o)); };
  return <div><h3>🚚 Logistics — Shipments</h3>{msg&&<div className={`msg ${msg.t}`}>{msg.x}</div>}
  {orders.map(o=><div key={o._id} className="feat" style={{maxWidth:'100%',marginTop:10}}><b>Order ৳{o.total}</b> — Status: <b>{o.status}</b><div style={{marginTop:8,display:'flex',gap:8}}>{['shipped','delivered','cancelled'].map(s=><button key={s} onClick={()=>upd(o._id,s)} className="btn" style={{width:'auto',padding:'8px 14px'}}>{s}</button>)}</div></div>)}
  {orders.length===0&&<p style={{color:'var(--muted)',marginTop:12}}>No shipments assigned yet.</p>}</div>; }
