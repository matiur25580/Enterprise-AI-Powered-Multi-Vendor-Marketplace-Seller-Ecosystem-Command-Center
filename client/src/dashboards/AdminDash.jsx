import {useEffect,useState} from 'react'; import axios from 'axios';
const API=import.meta.env.VITE_API_URL||'http://localhost:5000/api';
export default function AdminDash(){ const [d,setD]=useState(null); const [ps,setPs]=useState([]);
  const tok=()=>({headers:{Authorization:'Bearer '+localStorage.getItem('mp-token')}});
  useEffect(()=>{ axios.get(`${API}/shop/finance`,tok()).then(r=>setD(r.data)); axios.get(`${API}/shop/products`).then(r=>setPs(r.data)); },[]);
  return <div><h3>👑 Super Admin — Full Command</h3>
  {d&&<div className="feats" style={{padding:0,marginTop:12,justifyContent:'flex-start'}}>
  <div className="feat"><h4>৳{d.gmv}</h4><p>GMV</p></div><div className="feat"><h4>৳{d.commission}</h4><p>Commission</p></div>
  <div className="feat"><h4>{d.orders}</h4><p>Orders</p></div><div className="feat"><h4>{d.fraud}</h4><p>Fraud flags</p></div>
  <div className="feat"><h4>{ps.length}</h4><p>Products live</p></div></div>}
  <p style={{marginTop:14,color:'var(--muted)'}}>Fraud detection: 10+ qty in one order auto-flagged. Seller KYC, disputes & announcements — next step.</p></div>; }
