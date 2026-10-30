import {useEffect,useState} from 'react';
import api,{logout} from '../api';
import ThemeToggle from '../components/ThemeToggle';
import './dash.css';
const CATS=['All','Electronics','Fashion','Home','Grocery','Beauty','Sports'];
export default function BuyerDash({user}){
  const [tab,setTab]=useState('shop');
  const [products,setProducts]=useState([]); const [orders,setOrders]=useState([]);
  const [q,setQ]=useState(''); const [cat,setCat]=useState('All');
  const [cart,setCart]=useState(()=>{try{return JSON.parse(localStorage.getItem('mp-cart')||'[]')}catch{return[]}});
  const [cartOpen,setCartOpen]=useState(false); const [msg,setMsg]=useState(null); const [trackId,setTrackId]=useState('');
  const load=async()=>{ try{ const [p,o]=await Promise.all([api.get('/shop/products'),api.get('/shop/orders')]); setProducts(p.data); setOrders(o.data); }catch(e){ setMsg({t:'err',x:'Failed to load data'}); } };
  useEffect(()=>{load();},[]);
  useEffect(()=>{localStorage.setItem('mp-cart',JSON.stringify(cart));},[cart]);
  const ok=x=>{setMsg({t:'ok',x}); setTimeout(()=>setMsg(null),3000);};
  const er=e=>setMsg({t:'err',x:e.response?.data?.msg||'Failed'});
  const add=p=>{ if(p.stock<=0) return; setCart(c=>{ const ex=c.find(i=>i._id===p._id);
      if(ex){ if(ex.qty>=p.stock){ ok('Max available stock reached'); return c; } return c.map(i=>i._id===p._id?{...i,qty:i.qty+1}:i); }
      return [...c,{_id:p._id,name:p.name,price:p.price,stock:p.stock,sellerId:p.sellerId||null,warehouse:p.warehouse,qty:1}]; }); ok(p.name+' added to cart'); };
  const chQty=(id,d)=>setCart(c=>c.map(i=>i._id===id?{...i,qty:Math.max(1,Math.min(i.stock,i.qty+d))}:i));
  const rm=id=>setCart(c=>c.filter(i=>i._id!==id));
  const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const checkout=async()=>{ if(!cart.length) return; try{
      const groups={}; cart.forEach(i=>{const k=i.sellerId||'noseller'; (groups[k]=groups[k]||[]).push(i);});
      for(const k of Object.keys(groups)){ const items=groups[k].map(i=>({name:i.name,price:i.price,qty:i.qty}));
        await api.post('/shop/orders',{items,sellerId:k==='noseller'?undefined:k,warehouse:groups[k][0].warehouse}); }
      setCart([]); setCartOpen(false); ok('Order placed successfully!'); load(); setTab('orders');
    }catch(e){er(e);} };
  const cancel=async id=>{ if(!confirm('Cancel this order?')) return; try{ await api.patch('/shop/orders/'+id+'/cancel'); ok('Order cancelled successfully'); load(); }catch(e){er(e);} };
  const filtered=products.filter(p=>(cat==='All'||p.category===cat)&&p.name.toLowerCase().includes(q.toLowerCase()));
  const spent=orders.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+o.total,0);
  const stats=[{l:'Products Live',v:products.length,c:'#3b82f6'},{l:'My Orders',v:orders.length,c:'#8b5cf6'},
    {l:'Total Spent',v:'৳'+Math.round(spent).toLocaleString(),c:'#16a34a'},{l:'In Transit',v:orders.filter(o=>o.status==='shipped').length,c:'#f59e0b'}];
  const tOrder=orders.find(o=>(o.trackingId||'').toUpperCase()===(trackId||'').trim().toUpperCase());
  const steps=['placed','shipped','delivered'];
  return <div className="dash">
    <div className="dash-head"><div><h2>🛒 Buyer Hub</h2><p className="sub">{user.fullName} · {user.uniqueId}</p></div>
      <div className="head-actions"><button className="btn sm cart-fab" onClick={()=>setCartOpen(true)}>🧺 Cart{cart.length>0&&<span className="cart-count">{cart.reduce((s,i)=>s+i.qty,0)}</span>}</button><ThemeToggle/><button className="btn sm" style={{background:'#6b7280'}} onClick={logout}>Logout</button></div></div>
    {msg&&<div className={`msg ${msg.t}`}>{msg.x}</div>}
    <div className="stat-grid">{stats.map(x=><div className="stat-card" key={x.l}><div className="stat-v" style={{color:x.c}}>{x.v}</div><div className="stat-l">{x.l}</div></div>)}</div>
    <div className="tabs">{['shop','orders','tracking'].map(t=><button key={t} className={'tab'+(tab===t?' active':'')} onClick={()=>setTab(t)}>{t[0].toUpperCase()+t.slice(1)}</button>)}</div>
    {tab==='shop'&&<>
      <div className="shop-bar"><input placeholder="🔍 Search products..." value={q} onChange={e=>setQ(e.target.value)}/>
        <select value={cat} onChange={e=>setCat(e.target.value)}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
      <div className="prod-grid">{filtered.map(p=><div className="prod-card" key={p._id}>
        <div className="prod-cat">{p.category}</div><h4>{p.name}</h4>
        <div className="prod-price">৳{(+p.price).toLocaleString()}</div>
        <div className="prod-meta">{p.stock>0?`${p.stock} in stock`:'Out of stock'} · {p.warehouse}</div>
        <button className="btn sm" disabled={p.stock<=0} style={p.stock<=0?{opacity:.5}:null} onClick={()=>add(p)}>{p.stock>0?'Add to Cart':'Sold Out'}</button>
      </div>)}</div>
      {filtered.length===0&&<p className="empty">No products found.</p>}</>}
    {tab==='orders'&&<div className="panel"><div className="panel-head"><h3>My Orders ({orders.length})</h3></div>
      <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Tracking ID</th><th>Items</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>{orders.map(o=><tr key={o._id}><td className="mono">{o.trackingId||'-'}</td><td>{o.items.map(i=>i.name+'×'+i.qty).join(', ')}</td>
        <td>৳{(+o.total).toLocaleString()}</td><td><span className={'badge '+o.status}>{o.status}</span></td>
        <td>{o.status==='placed'&&<button className="btn xs danger" onClick={()=>cancel(o._id)}>Cancel</button>}</td></tr>)}</tbody></table></div>
      {orders.length===0&&<p className="empty">No orders yet — go shop!</p>}</div>}
    {tab==='tracking'&&<div className="panel"><h3>📦 Track Shipment</h3>
      <div className="shop-bar"><input placeholder="Enter Tracking ID (e.g. TRK...)" value={trackId} onChange={e=>setTrackId(e.target.value)}/></div>
      {!tOrder&&<p className="empty">{trackId?'No order found with this tracking ID.':'Enter your tracking ID above.'}</p>}
      {tOrder&&<><p><b className="mono">{tOrder.trackingId}</b> — <span className={'badge '+tOrder.status}>{tOrder.status}</span></p>
        {tOrder.status==='cancelled'?<p className="empty">This order was cancelled.</p>:
        <div className="timeline">{steps.map(s=>{const idx=steps.indexOf(tOrder.status), i=steps.indexOf(s);
          return <div key={s} className={'t-step '+(i<idx?'done':i===idx?'now':'')}><div className="t-dot">{i<idx?'✓':i+1}</div><div className="t-lbl">{s}</div></div>;})}</div>}
        <p className="muted" style={{fontSize:13}}>Items: {tOrder.items.map(i=>i.name+'×'+i.qty).join(', ')} · Warehouse: {tOrder.warehouse}</p></>}</div>}
    {cartOpen&&<><div className="drawer-bg" onClick={()=>setCartOpen(false)}/><div className="drawer">
      <h3>🧺 My Cart ({cart.length})</h3>
      <div className="cart-items">{cart.map(i=><div className="cart-item" key={i._id}>
        <div><b>{i.name}</b><br/><span className="muted">৳{(+i.price).toLocaleString()} each</span></div>
        <div className="qty"><button onClick={()=>chQty(i._id,-1)}>−</button><b>{i.qty}</b><button onClick={()=>chQty(i._id,1)}>+</button></div>
        <button className="btn xs danger" onClick={()=>rm(i._id)}>✕</button></div>)}
        {cart.length===0&&<p className="empty">Cart is empty.</p>}</div>
      {cart.length>0&&<><div className="cart-total"><span>Total</span><span>৳{total.toLocaleString()}</span></div>
        <button className="btn" onClick={checkout}>Checkout →</button></>}
      <button className="btn ghost" style={{marginTop:8}} onClick={()=>setCartOpen(false)}>Continue Shopping</button>
    </div></>}
  </div>;
}
