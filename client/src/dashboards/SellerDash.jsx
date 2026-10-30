import {useEffect,useState} from 'react';
import api,{logout} from '../api';
import ThemeToggle from '../components/ThemeToggle';
import './dash.css';
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,CartesianGrid} from 'recharts';
const CATS=['Electronics','Fashion','Home','Grocery','Beauty','Sports'];
export default function SellerDash({user}){
  const [tab,setTab]=useState('products');
  const [products,setProducts]=useState([]); const [orders,setOrders]=useState([]);
  const [msg,setMsg]=useState(null); const [showForm,setShowForm]=useState(false);
  const [editing,setEditing]=useState(null);
  const [f,setF]=useState({name:'',price:'',stock:'',category:'Electronics',warehouse:'WH-Dhaka'});
  const load=async()=>{ try{ const [p,o]=await Promise.all([api.get('/shop/products/mine'),api.get('/shop/orders')]); setProducts(p.data); setOrders(o.data); }catch(e){ setMsg({t:'err',x:'Failed to load data'}); } };
  useEffect(()=>{load();},[]);
  const ok=x=>{setMsg({t:'ok',x}); setTimeout(()=>setMsg(null),2500);};
  const er=e=>setMsg({t:'err',x:e.response?.data?.msg||'Failed'});
  const openAdd=()=>{setEditing(null); setF({name:'',price:'',stock:'',category:'Electronics',warehouse:'WH-Dhaka'}); setShowForm(true);};
  const openEdit=p=>{setEditing(p._id); setF({name:p.name,price:p.price,stock:p.stock,category:p.category,warehouse:p.warehouse||'WH-Dhaka'}); setShowForm(true);};
  const save=async e=>{ e.preventDefault(); try{
      if(editing){ await api.put('/shop/products/'+editing,{...f,price:+f.price,stock:+f.stock}); ok('Product updated successfully!'); }
      else { await api.post('/shop/products',{...f,price:+f.price,stock:+f.stock}); ok('Product added successfully!'); }
      setShowForm(false); load(); }catch(e){er(e);} };
  const del=async id=>{ if(!confirm('Delete this product?')) return; try{ await api.delete('/shop/products/'+id); ok('Product deleted successfully!'); load(); }catch(e){er(e);} };
  const ship=async id=>{ try{ await api.patch('/shop/orders/'+id,{status:'shipped'}); ok('Order marked as shipped!'); load(); }catch(e){er(e);} };
  const valid=orders.filter(o=>o.status!=='cancelled');
  const revenue=valid.reduce((s,o)=>s+(o.total-(o.commission||0)),0);
  const stats=[
    {l:'Total Products',v:products.length,c:'#3b82f6'},
    {l:'Stock Units',v:products.reduce((s,p)=>s+(+p.stock||0),0),c:'#8b5cf6'},
    {l:'Orders Received',v:orders.length,c:'#f59e0b'},
    {l:'Revenue (Net)',v:'৳'+Math.round(revenue).toLocaleString(),c:'#16a34a'},
    {l:'Pending Shipment',v:orders.filter(o=>o.status==='placed').length,c:'#ef4444'}];
  const days=[...Array(7)].map((_,i)=>{const d=new Date(); d.setDate(d.getDate()-(6-i)); return d;});
  const chart=days.map(d=>{const k=d.toISOString().slice(0,10);
    return {day:d.toLocaleDateString('en',{weekday:'short'}), revenue:Math.round(valid.filter(o=>(o.createdAt||'').slice(0,10)===k).reduce((s,o)=>s+(o.total-(o.commission||0)),0))};});
  const s=v=>setF({...f,...v});
  return <div className="dash">
    <div className="dash-head"><div><h2>🏪 Seller Command Center</h2><p className="sub">{user.fullName} · {user.uniqueId}</p></div>
      <div className="head-actions"><ThemeToggle/><button className="btn sm" style={{background:'#6b7280'}} onClick={logout}>Logout</button></div></div>
    {msg&&<div className={`msg ${msg.t}`}>{msg.x}</div>}
    <div className="stat-grid">{stats.map(x=><div className="stat-card" key={x.l}><div className="stat-v" style={{color:x.c}}>{x.v}</div><div className="stat-l">{x.l}</div></div>)}</div>
    <div className="tabs">{['products','orders','analytics'].map(t=><button key={t} className={'tab'+(tab===t?' active':'')} onClick={()=>setTab(t)}>{t[0].toUpperCase()+t.slice(1)}</button>)}</div>
    {tab==='products'&&<div className="panel">
      <div className="panel-head"><h3>My Products ({products.length})</h3><button className="btn sm" onClick={openAdd}>+ Add Product</button></div>
      <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Warehouse</th><th>Actions</th></tr></thead>
      <tbody>{products.map(p=><tr key={p._id}><td><b>{p.name}</b></td><td>{p.category}</td><td>৳{(+p.price).toLocaleString()}</td>
        <td>{p.stock<=5?<span className="badge warn">Low: {p.stock}</span>:p.stock}</td><td>{p.warehouse}</td>
        <td><button className="btn xs" onClick={()=>openEdit(p)}>Edit</button> <button className="btn xs danger" onClick={()=>del(p._id)}>Delete</button></td></tr>)}</tbody></table></div>
      {products.length===0&&<p className="empty">No products yet — add your first product!</p>}</div>}
    {tab==='orders'&&<div className="panel">
      <div className="panel-head"><h3>Orders Received ({orders.length})</h3></div>
      <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Tracking ID</th><th>Items</th><th>Total</th><th>Status</th><th>Fraud</th><th>Action</th></tr></thead>
      <tbody>{orders.map(o=><tr key={o._id}><td className="mono">{o.trackingId||'-'}</td><td>{o.items.map(i=>i.name+'×'+i.qty).join(', ')}</td>
        <td>৳{(+o.total).toLocaleString()}</td><td><span className={'badge '+o.status}>{o.status}</span></td>
        <td>{o.fraudFlag?<span className="badge danger">FLAGGED</span>:<span className="muted">—</span>}</td>
        <td>{o.status==='placed'&&<button className="btn xs" onClick={()=>ship(o._id)}>Mark Shipped</button>}</td></tr>)}</tbody></table></div>
      {orders.length===0&&<p className="empty">No orders yet.</p>}</div>}
    {tab==='analytics'&&<div className="panel"><h3>Revenue — Last 7 Days (Net)</h3>
      <div style={{height:280}}><ResponsiveContainer><BarChart data={chart}>
        <CartesianGrid strokeDasharray="3 3" opacity={.2}/><XAxis dataKey="day"/><YAxis/><Tooltip formatter={v=>['৳'+v,'Revenue']}/><Bar dataKey="revenue" fill="#3b82f6" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div></div>}
    {showForm&&<div className="modal-bg" onClick={()=>setShowForm(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
      <h3>{editing?'Edit Product':'Add Product'}</h3>
      <form onSubmit={save}>
        <div className="field"><label>Product Name</label><input required value={f.name} onChange={e=>s({name:e.target.value})} placeholder="Wireless Headphone"/></div>
        <div className="field"><label>Price (৳)</label><input required type="number" min="1" value={f.price} onChange={e=>s({price:e.target.value})} placeholder="2500"/></div>
        <div className="field"><label>Stock</label><input required type="number" min="0" value={f.stock} onChange={e=>s({stock:e.target.value})} placeholder="50"/></div>
        <div className="field"><label>Category</label><select value={f.category} onChange={e=>s({category:e.target.value})}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
        <div className="field"><label>Warehouse</label><select value={f.warehouse} onChange={e=>s({warehouse:e.target.value})}><option>WH-Dhaka</option><option>WH-Chattogram</option><option>WH-Sylhet</option></select></div>
        <div className="row"><button className="btn" type="submit">{editing?'Update':'Add Product'}</button><button className="btn ghost" type="button" onClick={()=>setShowForm(false)}>Cancel</button></div>
      </form></div></div>}
  </div>;
}
