import {useEffect,useState} from 'react';
import api,{logout} from '../api';
import ThemeToggle from '../components/ThemeToggle';
import NotifBell from '../components/NotifBell';
import AnnounceBar from '../components/AnnounceBar';
import ClockStrip from '../components/ClockStrip';
import './dash.css';
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,CartesianGrid} from 'recharts';
const CATS=['Electronics','Fashion','Home','Grocery','Beauty','Sports'];
const stars=n=>'★'.repeat(n||0)+'☆'.repeat(5-(n||0));
export default function SellerDash({user}){
  const [tab,setTab]=useState('products');
  const [products,setProducts]=useState([]); const [orders,setOrders]=useState([]);
  const [coupons,setCoupons]=useState([]); const [reviews,setReviews]=useState([]); const [deals,setDeals]=useState([]);
  const [df,setDf]=useState({productId:'',percent:'',endsAt:''});
  const [msg,setMsg]=useState(null); const [showForm,setShowForm]=useState(false);
  const [editing,setEditing]=useState(null);
  const [f,setF]=useState({name:'',price:'',stock:'',category:'Electronics',warehouse:'WH-Dhaka'});
  const [cf,setCf]=useState({code:'',percent:'',minOrder:''});
  const load=async()=>{ try{ const [p,o,c,rv,d]=await Promise.all([api.get('/shop/products/mine'),api.get('/shop/orders'),api.get('/shop/coupons/mine'),api.get('/shop/reviews/mine/seller'),api.get('/shop/deals/mine')]); setProducts(p.data); setOrders(o.data); setCoupons(c.data); setReviews(rv.data); setDeals(d.data);
      try{ const k=await api.get('/shop/kyc'); setKyc(k.data||{}); if(k.data&&k.data.shopName){ setShopN(k.data.shopName); setShopD(k.data.shopDesc||''); } }catch{} }catch(e){ setMsg({t:'err',x:'Failed to load data'}); } };
  useEffect(()=>{load();},[]);
  const ok=x=>{setMsg({t:'ok',x}); setTimeout(()=>setMsg(null),2500);};
  const er=e=>setMsg({t:'err',x:e.response?.data?.msg||'Failed'});
  const openAdd=()=>{setEditing(null); setF({name:'',price:'',stock:'',category:'Electronics',warehouse:'WH-Dhaka'}); setShowForm(true);};
  const openEdit=p=>{setEditing(p._id); setF({name:p.name,price:p.price,stock:p.stock,category:p.category,warehouse:p.warehouse||'WH-Dhaka'}); setShowForm(true);};
  const save=async e=>{ e.preventDefault(); try{
      if(editing){ await api.put('/shop/products/'+editing,{...f,price:+f.price,stock:+f.stock}); ok('Product updated successfully!'); }
      else { await api.post('/shop/products',{...f,price:+f.price,stock:+f.stock}); ok('Product added successfully!'); }
      setShowForm(false); load(); }catch(e){er(e);} };
  const expSales=()=>{ const rows=[['TrackingID','Items','Total','Commission','Net','Status','Date'],
    ...orders.map(o=>[o.trackingId,'"'+o.items.map(i=>i.name+'x'+i.qty).join('; ')+'"',o.total,(o.commission||0),+(o.total-(o.commission||0)).toFixed(2),o.status,(o.createdAt||'').slice(0,10)])];
    const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([rows.map(r=>r.join(',')).join('\n')],{type:'text/csv'})); a.download='sales-report.csv'; a.click(); };
  const del=async id=>{ if(!confirm('Delete this product?')) return; try{ await api.delete('/shop/products/'+id); ok('Product deleted successfully!'); load(); }catch(e){er(e);} };
  const ship=async id=>{ try{ await api.patch('/shop/orders/'+id,{status:'shipped'}); ok('Order marked as shipped!'); load(); }catch(e){er(e);} };
  const addCoupon=async e=>{ e.preventDefault(); try{ await api.post('/shop/coupons',cf); ok('Coupon created!'); setCf({code:'',percent:'',minOrder:''}); load(); }catch(e){er(e);} };
  const toggleCp=async id=>{ try{ const r=await api.patch('/shop/coupons/'+id+'/toggle'); ok(r.data.msg); load(); }catch(e){er(e);} };
  const delCp=async id=>{ if(!confirm('Delete coupon?')) return; try{ await api.delete('/shop/coupons/'+id); ok('Coupon deleted'); load(); }catch(e){er(e);} };
  const addDeal=async e=>{ e.preventDefault(); try{ await api.post('/shop/deals',df); ok('Flash deal created!'); setDf({productId:'',percent:'',endsAt:''}); load(); }catch(e){er(e);} };
  const delDeal=async id=>{ if(!confirm('Delete deal?')) return; try{ await api.delete('/shop/deals/'+id); ok('Deal deleted'); load(); }catch(e){er(e);} };
  const delRv=async id=>{ if(!confirm('Delete review?')) return; try{ await api.delete('/shop/reviews/'+id); ok('Review deleted'); load(); }catch(e){er(e);} };
  const valid=orders.filter(o=>o.status!=='cancelled');
  const revenue=valid.reduce((s,o)=>s+(o.total-(o.commission||0)),0);
  const avgR=reviews.length?(reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1):'—';
  const stats=[
    {l:'Total Products',v:products.length,c:'#3b82f6'},
    {l:'Stock Units',v:products.reduce((s,p)=>s+(+p.stock||0),0),c:'#8b5cf6'},
    {l:'Orders Received',v:orders.length,c:'#f59e0b'},
    {l:'Revenue (Net)',v:'৳'+Math.round(revenue).toLocaleString(),c:'#16a34a'},
    {l:'Avg Rating',v:avgR+' ★',c:'#06b6d4'},
    {l:'Active Coupons',v:coupons.filter(c=>c.active).length,c:'#ec4899'},
    {l:'⚡ Live Deals',v:deals.filter(d=>d.active&&new Date(d.endsAt)>new Date()).length,c:'#f97316'}];
  const days=[...Array(7)].map((_,i)=>{const d=new Date(); d.setDate(d.getDate()-(6-i)); return d;});
  const chart=days.map(d=>{const k=d.toISOString().slice(0,10);
    return {day:d.toLocaleDateString('en',{weekday:'short'}), revenue:Math.round(valid.filter(o=>(o.createdAt||'').slice(0,10)===k).reduce((s,o)=>s+(o.total-(o.commission||0)),0))};});
  const topMap={}; valid.forEach(o=>o.items.forEach(i=>{ if(!topMap[i.name]) topMap[i.name]={name:i.name,qty:0,rev:0}; topMap[i.name].qty+=i.qty; topMap[i.name].rev+=i.price*i.qty; }));
  const top=Object.values(topMap).sort((a,b)=>b.qty-a.qty).slice(0,5);
  const avgDaily=chart.reduce((s,d)=>s+d.revenue,0)/7;
  const forecast=Math.round(avgDaily*7);
  const s=v=>setF({...f,...v});
  return <div className="dash">
    <div className="dash-head"><div><h2>🏪 Seller Command Center</h2><p className="sub">{user.fullName} · <span className="badge shipped">Seller</span> · <span className="mono">{user.uniqueId}</span></p></div>
      <div className="head-actions"><NotifBell/><ThemeToggle/><button className="btn sm" style={{background:'#6b7280'}} onClick={logout}>Logout</button></div></div>
    <ClockStrip/>
    {msg&&<div className={`msg ${msg.t}`}>{msg.x}</div>}
    <AnnounceBar/>
    <div className="stat-grid">{stats.map(x=><div className="stat-card" key={x.l}><div className="stat-v" style={{color:x.c}}>{x.v}</div><div className="stat-l">{x.l}</div></div>)}</div>
    <div className="tabs">{['products','orders','deals','coupons','reviews','analytics','kyc'].map(t=><button key={t} className={'tab'+(tab===t?' active':'')} onClick={()=>setTab(t)}>{t[0].toUpperCase()+t.slice(1)}</button>)}</div>
    {tab==='products'&&<div className="panel">
      <div className="panel-head"><h3>My Products ({products.length})</h3><button className="btn sm" onClick={openAdd}>+ Add Product</button></div>
      <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Warehouse</th><th>Actions</th></tr></thead>
      <tbody>{products.map(p=><tr key={p._id}><td><b>{p.name}</b></td><td>{p.category}</td><td>৳{(+p.price).toLocaleString()}</td>
        <td>{p.stock<=5?<span className="badge warn">Low: {p.stock}</span>:p.stock}</td><td>{p.warehouse}</td>
        <td><button className="btn xs" onClick={()=>openEdit(p)}>Edit</button> <button className="btn xs danger" onClick={()=>del(p._id)}>Delete</button></td></tr>)}</tbody></table></div>
      {products.length===0&&<p className="empty">No products yet — add your first product!</p>}</div>}
    {tab==='orders'&&<div className="panel">
      <div className="panel-head"><h3>Orders Received ({orders.length})</h3><button className="btn xs" onClick={expSales}>⬇ Sales CSV</button></div>
      <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Tracking ID</th><th>Items</th><th>Total</th><th>Coupon</th><th>Status</th><th>Fraud</th><th>Action</th></tr></thead>
      <tbody>{orders.map(o=><tr key={o._id}><td className="mono">{o.trackingId||'-'}</td><td>{o.items.map(i=>i.name+'×'+i.qty).join(', ')}</td>
        <td>৳{(+o.total).toLocaleString()}{o.discount>0&&<span className="muted" style={{fontSize:11}}> (-৳{o.discount})</span>}</td>
        <td>{o.couponCode?<span className="badge ok">{o.couponCode}</span>:<span className="muted">—</span>}</td>
        <td><span className={'badge '+o.status}>{o.status}</span></td>
        <td>{o.fraudFlag?<span className="badge danger">FLAGGED</span>:<span className="muted">—</span>}</td>
        <td>{o.status==='placed'&&<button className="btn xs" onClick={()=>ship(o._id)}>Mark Shipped</button>}</td></tr>)}</tbody></table></div>
      {orders.length===0&&<p className="empty">No orders yet.</p>}</div>}
    {tab==='deals'&&<div className="panel">
      <div className="panel-head"><h3>⚡ Flash Deals ({deals.length})</h3></div>
      <form onSubmit={addDeal} style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
        <select required value={df.productId} onChange={e=>setDf({...df,productId:e.target.value})} style={{padding:10,borderRadius:10,border:'1px solid var(--border)',background:'var(--card)',color:'inherit'}}>
          <option value="">Select product</option>{products.map(p=><option key={p._id} value={p._id}>{p.name} — ৳{p.price}</option>)}</select>
        <input required type="number" min="1" max="90" placeholder="% off" value={df.percent} onChange={e=>setDf({...df,percent:e.target.value})} style={{padding:10,borderRadius:10,border:'1px solid var(--border)',background:'var(--card)',color:'inherit',width:90}}/>
        <input required type="datetime-local" value={df.endsAt} onChange={e=>setDf({...df,endsAt:e.target.value})} style={{padding:10,borderRadius:10,border:'1px solid var(--border)',background:'var(--card)',color:'inherit'}}/>
        <button className="btn sm" type="submit">Launch Deal</button></form>
      <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Product</th><th>Off</th><th>Deal Price</th><th>Ends</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>{deals.map(d=>{const live=d.active&&new Date(d.endsAt)>new Date(); return <tr key={d._id}><td><b>{d.productName}</b></td><td>{d.percent}%</td><td><b>৳{d.dealPrice.toLocaleString()}</b></td>
        <td>{new Date(d.endsAt).toLocaleString()}</td><td>{live?<span className="badge ok">LIVE</span>:<span className="badge warn">ended</span>}</td>
        <td><button className="btn xs danger" onClick={()=>delDeal(d._id)}>Delete</button></td></tr>;})}</tbody></table></div>
      {deals.length===0&&<p className="empty">No flash deals — launch one to boost sales!</p>}</div>}
    {tab==='coupons'&&<div className="panel">
      <div className="panel-head"><h3>🎟️ My Coupons ({coupons.length})</h3></div>
      <form onSubmit={addCoupon} style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
        <input required placeholder="CODE (e.g. EID20)" value={cf.code} onChange={e=>setCf({...cf,code:e.target.value})} style={{padding:10,borderRadius:10,border:'1px solid var(--border)',background:'var(--card)',color:'inherit',textTransform:'uppercase'}}/>
        <input required type="number" min="1" max="90" placeholder="% off" value={cf.percent} onChange={e=>setCf({...cf,percent:e.target.value})} style={{padding:10,borderRadius:10,border:'1px solid var(--border)',background:'var(--card)',color:'inherit',width:100}}/>
        <input type="number" min="0" placeholder="Min order ৳" value={cf.minOrder} onChange={e=>setCf({...cf,minOrder:e.target.value})} style={{padding:10,borderRadius:10,border:'1px solid var(--border)',background:'var(--card)',color:'inherit',width:130}}/>
        <button className="btn sm" type="submit">Create</button></form>
      <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Code</th><th>Discount</th><th>Min Order</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>{coupons.map(c=><tr key={c._id}><td><b className="mono">{c.code}</b></td><td>{c.percent}%</td><td>৳{(+c.minOrder).toLocaleString()}</td>
        <td>{c.active?<span className="badge ok">active</span>:<span className="badge warn">off</span>}</td>
        <td><button className="btn xs" onClick={()=>toggleCp(c._id)}>{c.active?'Deactivate':'Activate'}</button> <button className="btn xs danger" onClick={()=>delCp(c._id)}>Delete</button></td></tr>)}</tbody></table></div>
      {coupons.length===0&&<p className="empty">No coupons yet — create one to boost sales!</p>}</div>}
    {tab==='reviews'&&<div className="panel"><div className="panel-head"><h3>⭐ Customer Reviews ({reviews.length})</h3></div>
      {reviews.map(rv=><div key={rv._id} style={{borderBottom:'1px solid var(--border)',padding:'10px 0'}}>
        <div style={{display:'flex',justifyContent:'space-between'}}><b>{rv.productName}</b><button className="btn xs danger" onClick={()=>delRv(rv._id)}>Delete</button></div>
        <div style={{color:'#f59e0b'}}>{stars(rv.rating)} <span className="muted" style={{color:'inherit',opacity:.6}}>by {rv.buyerName}</span></div>
        <div style={{fontSize:14,marginTop:4}}>{rv.comment}</div></div>)}
      {reviews.length===0&&<p className="empty">No reviews yet.</p>}</div>}
    {tab==='kyc'&&<div className="panel"><div className="panel-head"><h3>✅ Shop Verification (KYC)</h3>{kyc.kycStatus&&<span className={'badge '+(kyc.kycStatus==='verified'?'ok':kyc.kycStatus==='rejected'?'danger':'warn')}>{kyc.kycStatus}</span>}</div><form onSubmit={subKyc} className="form-grid" style={{maxWidth:500}}><div className="field"><label>Shop Name</label><input required value={shopN} onChange={e=>setShopN(e.target.value)} placeholder="Amar Dokan"/></div><div className="field"><label>Shop Description</label><textarea rows="3" value={shopD} onChange={e=>setShopD(e.target.value)} placeholder="Ki sell koro?"/></div><button className="btn" type="submit">Submit for Verification</button></form><p className="muted" style={{fontSize:13,marginTop:10}}>Verified shop pele buyer ra tomar product e ✓ badge dekhte pabe!</p></div>}
    {tab==='analytics'&&<>
      <div className="panel" style={{borderLeft:'4px solid #8b5cf6'}}><h3>🤖 AI Sales Forecast</h3>
        <p style={{fontSize:15}}>Based on your last 7 days trend, projected revenue for <b>next 7 days</b>:</p>
        <div className="stat-v" style={{color:'#8b5cf6',fontSize:28}}>৳{forecast.toLocaleString()}</div>
        <p className="muted" style={{fontSize:12}}>Avg daily: ৳{Math.round(avgDaily).toLocaleString()} · Moving-average model</p></div>
      <div className="panel"><h3>Revenue — Last 7 Days (Net)</h3>
        <div style={{height:260}}><ResponsiveContainer><BarChart data={chart}>
          <CartesianGrid strokeDasharray="3 3" opacity={.2}/><XAxis dataKey="day"/><YAxis/><Tooltip formatter={v=>['৳'+v,'Revenue']}/><Bar dataKey="revenue" fill="#3b82f6" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div></div>
      <div className="panel"><div className="panel-head"><h3>🏆 Top Selling Products</h3></div>
        <div className="tbl-wrap"><table className="tbl"><thead><tr><th>#</th><th>Product</th><th>Units Sold</th><th>Revenue</th></tr></thead>
        <tbody>{top.map((t,i)=><tr key={t.name}><td>{i+1}</td><td><b>{t.name}</b></td><td>{t.qty}</td><td>৳{t.rev.toLocaleString()}</td></tr>)}</tbody></table></div>
        {top.length===0&&<p className="empty">No sales yet.</p>}</div></>}
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
