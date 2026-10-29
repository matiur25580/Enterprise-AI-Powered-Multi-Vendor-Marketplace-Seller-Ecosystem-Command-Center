import {useEffect,useState} from 'react'; import axios from 'axios';
const API=import.meta.env.VITE_API_URL||'http://localhost:5000/api';
export default function SellerDash(){ const [ps,setPs]=useState([]); const [orders,setOrders]=useState([]); const [f,setF]=useState({name:'',price:'',stock:'',category:'Electronics'}); const [msg,setMsg]=useState(null);
  const tok=()=>({headers:{Authorization:'Bearer '+localStorage.getItem('mp-token')}});
  const load=()=>{ axios.get(`${API}/shop/products`).then(r=>setPs(r.data)); axios.get(`${API}/shop/orders`,tok()).then(r=>setOrders(r.data)); };
  useEffect(load,[]);
  const add=async e=>{ e.preventDefault(); const {data}=await axios.post(`${API}/shop/products`,{...f,price:+f.price,stock:+f.stock},tok()); setMsg({t:'ok',x:data.msg}); setF({name:'',price:'',stock:'',category:'Electronics'}); load(); };
  const del=async id=>{ const {data}=await axios.delete(`${API}/shop/products/${id}`,tok()); setMsg({t:'ok',x:data.msg}); load(); };
  return <div><h3>🏪 Seller — My Store</h3>{msg&&<div className={`msg ${msg.t}`}>{msg.x}</div>}
  <form onSubmit={add} className="card" style={{marginTop:12}}><div className="field"><label>Product Name</label><input required value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></div><div className="field"><label>Price</label><input required type="number" value={f.price} onChange={e=>setF({...f,price:e.target.value})}/></div><div className="field"><label>Stock</label><input required type="number" value={f.stock} onChange={e=>setF({...f,stock:e.target.value})}/></div><button className="btn">Add Product</button></form>
  <h4 style={{marginTop:14}}>My Products ({ps.length})</h4>{ps.map(p=><div key={p._id} className="feat" style={{maxWidth:'100%',display:'flex',justifyContent:'space-between',marginTop:8}}><span>{p.name} — ৳{p.price} (Stock {p.stock})</span><button onClick={()=>del(p._id)} style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:8,padding:'6px 12px'}}>Delete</button></div>)}
  <h4 style={{marginTop:14}}>Orders ({orders.length})</h4>{orders.map(o=><div key={o._id} className="feat" style={{maxWidth:'100%',marginTop:8}}><b>৳{o.total}</b> — {o.status} {o.fraudFlag&&<span style={{color:'red'}}>⚠️ fraud-flagged</span>}</div>)}</div>; }
