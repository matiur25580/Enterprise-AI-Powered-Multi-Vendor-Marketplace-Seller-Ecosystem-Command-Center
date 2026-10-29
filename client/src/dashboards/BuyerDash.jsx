import {useEffect,useState} from 'react'; import axios from 'axios';
const API=import.meta.env.VITE_API_URL||'http://localhost:5000/api';
export default function BuyerDash(){ const [ps,setPs]=useState([]); const [cart,setCart]=useState([]); const [msg,setMsg]=useState(null);
  useEffect(()=>{ axios.get(`${API}/shop/products`).then(r=>setPs(r.data)); },[]);
  const tok=()=>({headers:{Authorization:'Bearer '+localStorage.getItem('mp-token')}});
  const order=async()=>{ try{ const {data}=await axios.post(`${API}/shop/orders`,{items:cart,sellerId:ps[0]?.sellerId},tok()); setMsg({t:'ok',x:data.msg}); setCart([]); }catch(e){ setMsg({t:'err',x:'Order failed'}); } };
  return <div><h3>🛍️ Buyer — Marketplace</h3>{msg&&<div className={`msg ${msg.t}`}>{msg.x}</div>}
  <div style={{display:'grid',gap:10,marginTop:12}}>{ps.map(p=><div key={p._id} className="feat" style={{maxWidth:'100%',display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><b>{p.name}</b><br/><small>৳{p.price} | Stock:{p.stock}</small></div><button className="btn" style={{width:'auto',padding:'8px 16px'}} onClick={()=>setCart([...cart,{name:p.name,price:p.price,qty:1}])}>Add</button></div>)}</div>
  {cart.length>0&&<div className="card" style={{marginTop:14}}><b>Cart ({cart.length})</b><p>Total: ৳{cart.reduce((s,i)=>s+i.price*i.qty,0)}</p><button className="btn" onClick={order}>Place Order</button></div>}</div>; }
