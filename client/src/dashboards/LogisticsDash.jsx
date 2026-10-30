import {useEffect,useState} from 'react';
import api,{logout} from '../api';
import ThemeToggle from '../components/ThemeToggle';
import NotifBell from '../components/NotifBell';
import AnnounceBar from '../components/AnnounceBar';
import './dash.css';
export default function LogisticsDash({user}){
  const [tab,setTab]=useState('active');
  const [ships,setShips]=useState([]); const [all,setAll]=useState([]);
  const [msg,setMsg]=useState(null); const [f,setF]=useState('all');
  const load=async()=>{ try{ const [s,a]=await Promise.all([api.get('/shop/logistics/shipments'),api.get('/shop/orders')]); setShips(s.data); setAll(a.data); }catch(e){ setMsg({t:'err',x:'Failed to load shipments'}); } };
  useEffect(()=>{load();},[]);
  const ok=x=>{setMsg({t:'ok',x}); setTimeout(()=>setMsg(null),2500);};
  const er=e=>setMsg({t:'err',x:e.response?.data?.msg||'Failed'});
  const upd=async(id,st)=>{ let note='';
    if(st==='delivered'){ note=prompt('Delivery note (optional):','')||''; if(note===null) return; }
    try{ await api.patch('/shop/orders/'+id,{status:st,deliveryNote:note||undefined}); ok(st==='shipped'?'Shipment dispatched!':'Delivered successfully!'); load(); }catch(e){er(e);} };
  const stats=[
    {l:'Pending Pickup',v:ships.filter(o=>o.status==='placed').length,c:'#f59e0b'},
    {l:'In Transit',v:ships.filter(o=>o.status==='shipped').length,c:'#3b82f6'},
    {l:'Delivered Total',v:all.filter(o=>o.status==='delivered').length,c:'#16a34a'},
    {l:'Fraud Flagged',v:ships.filter(o=>o.fraudFlag).length,c:'#ef4444'},
    {l:'⏱️ Avg Delivery Time',v:avgHrs?avgHrs.toFixed(1)+' hrs':'—',c:'#06b6d4'}];
  const delivered=all.filter(o=>o.status==='delivered');
  const avgHrs=delivered.length?delivered.reduce((t,o)=>t+((new Date(o.updatedAt)-new Date(o.createdAt))/36e5),0)/delivered.length:0;
  const list=(tab==='active'?ships:delivered).filter(o=>f==='all'||o.status===f||o.warehouse===f);
  const Row=o=><tr key={o._id}><td className="mono">{o.trackingId||'-'}</td>
    <td>{o.buyerId?.fullName||'—'}</td><td>{o.items.map(i=>i.name+'×'+i.qty).join(', ')}</td>
    <td>{o.warehouse}</td><td><span className={'badge '+o.status}>{o.status}</span>{o.deliveryNote&&<div className="muted" style={{fontSize:11}}>📝 {o.deliveryNote}</div>}</td>
    <td>{o.fraudFlag?<span className="badge danger">FLAGGED</span>:<span className="muted">—</span>}</td>
    <td>{o.status==='placed'&&<button className="btn xs" onClick={()=>upd(o._id,'shipped')}>🚚 Dispatch</button>}
        {o.status==='shipped'&&<button className="btn xs" style={{background:'#16a34a'}} onClick={()=>upd(o._id,'delivered')}>✓ Deliver</button>}</td></tr>;
  return <div className="dash">
    <div className="dash-head"><div><h2>🚚 Logistics Command</h2><p className="sub">{user.fullName} · {user.uniqueId}</p></div>
      <div className="head-actions"><NotifBell/><ThemeToggle/><button className="btn sm" style={{background:'#6b7280'}} onClick={logout}>Logout</button></div></div>
    {msg&&<div className={`msg ${msg.t}`}>{msg.x}</div>}
    <AnnounceBar/>
    <div className="stat-grid">{stats.map(x=><div className="stat-card" key={x.l}><div className="stat-v" style={{color:x.c}}>{x.v}</div><div className="stat-l">{x.l}</div></div>)}</div>
    <div className="tabs">{['active','delivered'].map(t=><button key={t} className={'tab'+(tab===t?' active':'')} onClick={()=>setTab(t)}>{t==='active'?'Active Shipments':'Delivered History'}</button>)}</div>
    <div className="panel">
      <div className="panel-head"><h3>{tab==='active'?'Shipments to Handle':'Delivery History'} ({list.length})</h3>
        <select value={f} onChange={e=>setF(e.target.value)} style={{padding:'8px 12px',borderRadius:10,border:'1px solid var(--border)',background:'var(--card)',color:'inherit'}}>
          <option value="all">All</option><option value="placed">Placed</option><option value="shipped">Shipped</option>
          <option value="WH-Dhaka">WH-Dhaka</option><option value="WH-Chattogram">WH-Chattogram</option><option value="WH-Sylhet">WH-Sylhet</option>
        </select></div>
      <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Tracking ID</th><th>Buyer</th><th>Items</th><th>Warehouse</th><th>Status</th><th>Fraud</th><th>Action</th></tr></thead>
      <tbody>{list.map(Row)}</tbody></table></div>
      {list.length===0&&<p className="empty">No shipments here.</p>}</div>
  </div>;
}
