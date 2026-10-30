import {useEffect,useState} from 'react';
import api,{logout} from '../api';
import ThemeToggle from '../components/ThemeToggle';
import './dash.css';
const CATS=['All','Electronics','Fashion','Home','Grocery','Beauty','Sports'];
const stars=n=>'★'.repeat(n||0)+'☆'.repeat(5-(n||0));
export default function BuyerDash({user}){
  const [tab,setTab]=useState('shop');
  const [products,setProducts]=useState([]); const [orders,setOrders]=useState([]); const [ratings,setRatings]=useState({});
  const [q,setQ]=useState(''); const [cat,setCat]=useState('All');
  const [cart,setCart]=useState(()=>{try{return JSON.parse(localStorage.getItem('mp-cart')||'[]')}catch{return[]}});
  const [wish,setWish]=useState(()=>{try{return JSON.parse(localStorage.getItem('mp-wish')||'[]')}catch{return[]}});
  const [cartOpen,setCartOpen]=useState(false); const [msg,setMsg]=useState(null); const [trackId,setTrackId]=useState('');
  const [coupon,setCoupon]=useState(''); const [applied,setApplied]=useState(null);
  const [viewP,setViewP]=useState(null); const [pReviews,setPReviews]=useState([]);
  const [rvP,setRvP]=useState(null); const [rvR,setRvR]=useState(5); const [rvC,setRvC]=useState('');
  const load=async()=>{ try{ const [p,o,rt]=await Promise.all([api.get('/shop/products'),api.get('/shop/orders'),api.get('/shop/ratings')]); setProducts(p.data); setOrders(o.data); setRatings(rt.data); }catch(e){ setMsg({t:'err',x:'Failed to load data'}); } };
  useEffect(()=>{load();},[]);
  useEffect(()=>{localStorage.setItem('mp-cart',JSON.stringify(cart));},[cart]);
  useEffect(()=>{localStorage.setItem('mp-wish',JSON.stringify(wish));},[wish]);
  const ok=x=>{setMsg({t:'ok',x}); setTimeout(()=>setMsg(null),3000);};
  const er=e=>setMsg({t:'err',x:e.response?.data?.msg||'Failed'});
  const add=(p,qty=1)=>{ if(p.stock<=0) return; setCart(c=>{ const ex=c.find(i=>i._id===p._id);
      if(ex){ if(ex.qty+qty>p.stock){ ok('Max available stock reached'); return c; } return c.map(i=>i._id===p._id?{...i,qty:i.qty+qty}:i); }
      return [...c,{_id:p._id,name:p.name,price:p.price,stock:p.stock,sellerId:p.sellerId||null,warehouse:p.warehouse,qty}]; }); };
  const toggleWish=p=>{ setWish(w=>w.includes(p._id)?w.filter(x=>x!==p._id):[...w,p._id]); };
  const chQty=(id,d)=>setCart(c=>c.map(i=>i._id===id?{...i,qty:Math.max(1,Math.min(i.stock,i.qty+d))}:i));
  const rm=id=>setCart(c=>c.filter(i=>i._id!==id));
  const subtotal=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const applyCoupon=async()=>{ if(!coupon.trim()) return;
    try{ const r=await api.get('/shop/coupons/active'); const cp=r.data.find(c=>c.code===coupon.trim().toUpperCase());
      if(!cp) return er({response:{data:{msg:'Invalid coupon code'}}});
      if(subtotal<cp.minOrder) return er({response:{data:{msg:`Min order ৳${cp.minOrder} for this coupon`}}});
      setApplied(cp); ok(`Coupon ${cp.code} applied — ${cp.percent}% off!`);
    }catch(e){er(e);} };
  const checkout=async()=>{ if(!cart.length) return; try{
      const groups={}; cart.forEach(i=>{const k=i.sellerId||'noseller'; (groups[k]=groups[k]||[]).push(i);});
      let msg='Order placed successfully!';
      for(const k of Object.keys(groups)){ const items=groups[k].map(i=>({name:i.name,price:i.price,qty:i.qty}));
        let cpCode=null;
        if(applied){ const gSub=items.reduce((s,i)=>s+i.price*i.qty,0);
          if(gSub>=applied.minOrder&&(!applied.sellerId||String(applied.sellerId)===k)) cpCode=applied.code; }
        const r=await api.post('/shop/orders',{items,sellerId:k==='noseller'?undefined:k,warehouse:groups[k][0].warehouse,couponCode:cpCode});
        msg=r.data.msg; }
      setCart([]); setApplied(null); setCoupon(''); setCartOpen(false); ok(msg); load(); setTab('orders');
    }catch(e){er(e);} };
  const cancel=async id=>{ if(!confirm('Cancel this order?')) return; try{ await api.patch('/shop/orders/'+id+'/cancel'); ok('Order cancelled. Refund will be processed.'); load(); }catch(e){er(e);} };
  const openProduct=async p=>{ setViewP(p); try{ const r=await api.get('/shop/reviews/'+p._id); setPReviews(r.data); }catch{ setPReviews([]); } };
  const submitReview=async e=>{ e.preventDefault(); try{ await api.post('/shop/reviews',{productId:rvP._id,rating:rvR,comment:rvC}); ok('Review submitted! Thank you.'); setRvP(null); setRvC(''); setRvR(5); load(); }catch(e){er(e);} };
  const filtered=products.filter(p=>(cat==='All'||p.category===cat)&&p.name.toLowerCase().includes(q.toLowerCase()));
  const wishPs=products.filter(p=>wish.includes(p._id));
  const spent=orders.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+o.total,0);
  const stats=[{l:'Products Live',v:products.length,c:'#3b82f6'},{l:'My Orders',v:orders.length,c:'#8b5cf6'},
    {l:'Total Spent',v:'৳'+Math.round(spent).toLocaleString(),c:'#16a34a'},{l:'Wishlist',v:wish.length,c:'#ec4899'}];
  const tOrder=orders.find(o=>(o.trackingId||'').toUpperCase()===(trackId||'').trim().toUpperCase());
  const steps=['placed','shipped','delivered'];
  const disc=applied?+((subtotal*applied.percent)/100).toFixed(2):0;
  const Card=p=>{const rt=ratings[p._id];return <div className="prod-card" key={p._id}>
    <div className="prod-cat">{p.category}</div>
    <h4 style={{cursor:'pointer'}} onClick={()=>openProduct(p)}>{p.name}</h4>
    {rt&&<div style={{color:'#f59e0b',fontSize:13}}>{stars(Math.round(rt.avg))} <span className="muted" style={{color:'inherit',opacity:.6}}>({rt.avg} · {rt.count})</span></div>}
    <div className="prod-price">৳{(+p.price).toLocaleString()}</div>
    <div className="prod-meta">{p.stock>0?`${p.stock} in stock`:'Out of stock'} · {p.warehouse}</div>
    <div className="row"><button className="btn sm" style={{flex:1}} disabled={p.stock<=0} onClick={()=>{add(p); ok(p.name+' added to cart');}}>{p.stock>0?'Add to Cart':'Sold Out'}</button>
    <button className="btn sm ghost" style={{width:'auto'}} onClick={()=>toggleWish(p)}>{wish.includes(p._id)?'❤️':'🤍'}</button></div></div>;};
  return <div className="dash">
    <div className="dash-head"><div><h2>🛒 Buyer Hub</h2><p className="sub">{user.fullName} · {user.uniqueId}</p></div>
      <div className="head-actions"><button className="btn sm cart-fab" onClick={()=>setCartOpen(true)}>🧺 Cart{cart.length>0&&<span className="cart-count">{cart.reduce((s,i)=>s+i.qty,0)}</span>}</button><ThemeToggle/><button className="btn sm" style={{background:'#6b7280'}} onClick={logout}>Logout</button></div></div>
    {msg&&<div className={`msg ${msg.t}`}>{msg.x}</div>}
    <div className="stat-grid">{stats.map(x=><div className="stat-card" key={x.l}><div className="stat-v" style={{color:x.c}}>{x.v}</div><div className="stat-l">{x.l}</div></div>)}</div>
    <div className="tabs">{['shop','wishlist','orders','tracking'].map(t=><button key={t} className={'tab'+(tab===t?' active':'')} onClick={()=>setTab(t)}>{t[0].toUpperCase()+t.slice(1)}</button>)}</div>
    {tab==='shop'&&<>
      <div className="shop-bar"><input placeholder="🔍 Search products..." value={q} onChange={e=>setQ(e.target.value)}/>
        <select value={cat} onChange={e=>setCat(e.target.value)}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
      <div className="prod-grid">{filtered.map(Card)}</div>
      {filtered.length===0&&<p className="empty">No products found.</p>}</>}
    {tab==='wishlist'&&<>
      {wishPs.length===0?<p className="empty">Wishlist empty — tap 🤍 on products to save.</p>:
      <div className="prod-grid">{wishPs.map(Card)}</div>}</>}
    {tab==='orders'&&<div className="panel"><div className="panel-head"><h3>My Orders ({orders.length})</h3></div>
      <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Tracking ID</th><th>Items</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>{orders.map(o=><tr key={o._id}><td className="mono">{o.trackingId||'-'}</td><td>{o.items.map(i=>i.name+'×'+i.qty).join(', ')}</td>
        <td>৳{(+o.total).toLocaleString()}{o.discount>0&&<span className="muted" style={{fontSize:11}}> (-৳{o.discount})</span>}</td>
        <td><span className={'badge '+o.status}>{o.status}</span></td>
        <td>{o.status==='placed'&&<button className="btn xs danger" onClick={()=>cancel(o._id)}>Cancel</button>}
            {o.status==='delivered'&&<button className="btn xs" style={{background:'#f59e0b'}} onClick={()=>setRvP(o)}>⭐ Review</button>}
            {o.status==='cancelled'&&<span className={'badge '+(o.refundStatus==='done'?'ok':'warn')}>refund: {o.refundStatus}</span>}</td></tr>)}</tbody></table></div>
      {orders.length===0&&<p className="empty">No orders yet — go shop!</p>}</div>}
    {tab==='tracking'&&<div className="panel"><h3>📦 Track Shipment</h3>
      <div className="shop-bar"><input placeholder="Enter Tracking ID (e.g. TRK...)" value={trackId} onChange={e=>setTrackId(e.target.value)}/></div>
      {!tOrder&&<p className="empty">{trackId?'No order found with this tracking ID.':'Enter your tracking ID above.'}</p>}
      {tOrder&&<><p><b className="mono">{tOrder.trackingId}</b> — <span className={'badge '+tOrder.status}>{tOrder.status}</span></p>
        {tOrder.status==='cancelled'?<p className="empty">This order was cancelled.</p>:
        <div className="timeline">{steps.map(s=>{const idx=steps.indexOf(tOrder.status), i=steps.indexOf(s);
          return <div key={s} className={'t-step '+(i<idx?'done':i===idx?'now':'')}><div className="t-dot">{i<idx?'✓':i+1}</div><div className="t-lbl">{s}</div></div>;})}</div>}
        {tOrder.deliveryNote&&<p style={{fontSize:13}}>📝 <i>{tOrder.deliveryNote}</i></p>}
        <p className="muted" style={{fontSize:13}}>Items: {tOrder.items.map(i=>i.name+'×'+i.qty).join(', ')} · Warehouse: {tOrder.warehouse}</p></>}</div>}
    {cartOpen&&<><div className="drawer-bg" onClick={()=>setCartOpen(false)}/><div className="drawer">
      <h3>🧺 My Cart ({cart.length})</h3>
      <div className="cart-items">{cart.map(i=><div className="cart-item" key={i._id}>
        <div><b>{i.name}</b><br/><span className="muted">৳{(+i.price).toLocaleString()} each</span></div>
        <div className="qty"><button onClick={()=>chQty(i._id,-1)}>−</button><b>{i.qty}</b><button onClick={()=>chQty(i._id,1)}>+</button></div>
        <button className="btn xs danger" onClick={()=>rm(i._id)}>✕</button></div>)}
        {cart.length===0&&<p className="empty">Cart is empty.</p>}</div>
      {cart.length>0&&<>
        <div className="shop-bar" style={{marginBottom:8}}><input placeholder="🎟️ Coupon code" value={coupon} onChange={e=>setCoupon(e.target.value)} disabled={!!applied}/>
          {applied?<button className="btn sm ghost" onClick={()=>{setApplied(null); setCoupon('');}}>✕ {applied.code}</button>
          :<button className="btn sm" onClick={applyCoupon}>Apply</button>}</div>
        {applied&&<div style={{fontSize:13,color:'#16a34a',marginBottom:8}}>✓ {applied.percent}% off applied (-৳{disc.toLocaleString()})</div>}
        <div className="cart-total"><span>Total</span><span>৳{(subtotal-disc).toLocaleString()}</span></div>
        <button className="btn" onClick={checkout}>Checkout →</button></>}
      <button className="btn ghost" style={{marginTop:8}} onClick={()=>setCartOpen(false)}>Continue Shopping</button>
    </div></>}
    {viewP&&<div className="modal-bg" onClick={()=>setViewP(null)}><div className="modal" onClick={e=>e.stopPropagation()}>
      <h3>{viewP.name}</h3>
      <p className="muted">{viewP.category} · ৳{(+viewP.price).toLocaleString()} · {viewP.stock} in stock · {viewP.warehouse}</p>
      <h4>⭐ Reviews ({pReviews.length})</h4>
      {pReviews.map(rv=><div key={rv._id} style={{borderBottom:'1px solid var(--border)',padding:'8px 0'}}>
        <div style={{color:'#f59e0b'}}>{stars(rv.rating)} <span className="muted" style={{color:'inherit',opacity:.6,fontSize:12}}>by {rv.buyerName}</span></div>
        <div style={{fontSize:14}}>{rv.comment}</div></div>)}
      {pReviews.length===0&&<p className="empty">No reviews yet.</p>}
      <div className="row" style={{marginTop:10}}><button className="btn" onClick={()=>{add(viewP); setViewP(null); ok(viewP.name+' added to cart');}}>Add to Cart</button>
      <button className="btn ghost" onClick={()=>setViewP(null)}>Close</button></div></div></div>}
    {rvP&&<div className="modal-bg" onClick={()=>setRvP(null)}><div className="modal" onClick={e=>e.stopPropagation()}>
      <h3>⭐ Review Order <span className="mono" style={{fontSize:14}}>{rvP.trackingId}</span></h3>
      <form onSubmit={submitReview}>
        <div className="field"><label>Rating</label><div style={{fontSize:28}}>{[1,2,3,4,5].map(n=><span key={n} style={{cursor:'pointer',color:n<=rvR?'#f59e0b':'#555'}} onClick={()=>setRvR(n)}>★</span>)}</div></div>
        <div className="field"><label>Comment</label><textarea required rows="3" value={rvC} onChange={e=>setRvC(e.target.value)} placeholder="Product kemon chilo?" style={{padding:10,borderRadius:10,border:'1px solid var(--border)',background:'var(--card)',color:'inherit',width:'100%'}}/></div>
        <div className="row"><button className="btn" type="submit">Submit Review</button><button className="btn ghost" type="button" onClick={()=>setRvP(null)}>Cancel</button></div>
      </form></div></div>}
  </div>;
}
