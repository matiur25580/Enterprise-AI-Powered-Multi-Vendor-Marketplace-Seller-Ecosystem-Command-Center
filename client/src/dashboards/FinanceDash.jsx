import {useEffect,useState} from 'react'; import axios from 'axios';
const API=import.meta.env.VITE_API_URL||'http://localhost:5000/api';
export default function FinanceDash(){ const [d,setD]=useState(null);
  useEffect(()=>{ axios.get(`${API}/shop/finance`,{headers:{Authorization:'Bearer '+localStorage.getItem('mp-token')}}).then(r=>setD(r.data)); },[]);
  if(!d) return <p>Loading...</p>;
  return <div><h3>💰 Finance — Command Center</h3><div className="feats" style={{padding:0,marginTop:12,justifyContent:'flex-start'}}>
  <div className="feat"><div className="ic">📈</div><h4>৳{d.gmv}</h4><p>Total GMV</p></div>
  <div className="feat"><div className="ic">💸</div><h4>৳{d.commission}</h4><p>Commission (10%)</p></div>
  <div className="feat"><div className="ic">🧾</div><h4>{d.orders}</h4><p>Total Orders</p></div>
  <div className="feat"><div className="ic">⚠️</div><h4>{d.fraud}</h4><p>Fraud-flagged</p></div></div></div>; }
