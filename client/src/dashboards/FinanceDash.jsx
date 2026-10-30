import {useEffect,useState} from 'react';
import api,{logout} from '../api';
import ThemeToggle from '../components/ThemeToggle';
import './dash.css';
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,CartesianGrid} from 'recharts';
export default function FinanceDash({user}){
  const [tab,setTab]=useState('overview');
  const [fin,setFin]=useState(null); const [payouts,setPayouts]=useState([]); const [orders,setOrders]=useState([]);
  const [msg,setMsg]=useState(null);
  const load=async()=>{ try{ const [f,p,o]=await Promise.all([api.get('/shop/finance'),api.get('/shop/finance/payouts'),api.get('/shop/orders')]); setFin(f.data); setPayouts(p.data); setOrders(o.data); }catch(e){ setMsg({t:'err',x:'Failed to load finance data'}); } };
  useEffect(()=>{load();},[]);
  const ok=x=>{setMsg({t:'ok',x}); setTimeout(()=>setMsg(null),2500);};
  const er=e=>setMsg({t:'err',x:e.response?.data?.msg||'Failed'});
  const pay=async m=>{ if(!confirm(`Pay ৳${m.pending.toLocaleString()} to ${m.name}?`)) return;
    try{ await api.post('/shop/finance/payouts/pay',{sellerId:m.sellerId,amount:m.pending}); ok('Payout recorded successfully!'); load(); }catch(e){er(e);} };
  if(!fin) return <div className="dash"><p className="empty">Loading...</p></div>;
  const stats=[
    {l:'GMV (Total Sales)',v:'৳'+Math.round(fin.gmv).toLocaleString(),c:'#3b82f6'},
    {l:'Platform Commission (10%)',v:'৳'+Math.round(fin.commission).toLocaleString(),c:'#8b5cf6'},
    {l:'Net to Sellers',v:'৳'+Math.round(fin.gmv-fin.commission).toLocaleString(),c:'#16a34a'},
    {l:'Total Orders',v:fin.orders,c:'#f59e0b'},
    {l:'Fraud Flagged',v:fin.fraud,c:'#ef4444'}];
  const valid=orders.filter(o=>o.status!=='cancelled');
  const days=[...Array(7)].map((_,i)=>{const d=new Date(); d.setDate(d.getDate()-(6-i)); return d;});
  const chart=days.map(d=>{const k=d.toISOString().slice(0,10);
    const os=valid.filter(o=>(o.createdAt||'').slice(0,10)===k);
    return {day:d.toLocaleDateString('en',{weekday:'short'}), gmv:Math.round(os.reduce((s,o)=>s+o.total,0)), commission:Math.round(os.reduce((s,o)=>s+(o.commission||0),0))};});
  return <div className="dash">
    <div className="dash-head"><div><h2>💰 Finance Control</h2><p className="sub">{user.fullName} · {user.uniqueId}</p></div>
      <div className="head-actions"><ThemeToggle/><button className="btn sm" style={{background:'#6b7280'}} onClick={logout}>Logout</button></div></div>
    {msg&&<div className={`msg ${msg.t}`}>{msg.x}</div>}
    <div className="stat-grid">{stats.map(x=><div className="stat-card" key={x.l}><div className="stat-v" style={{color:x.c}}>{x.v}</div><div className="stat-l">{x.l}</div></div>)}</div>
    <div className="tabs">{['overview','payouts'].map(t=><button key={t} className={'tab'+(tab===t?' active':'')} onClick={()=>setTab(t)}>{t==='overview'?'Revenue Overview':'Seller Payouts'}</button>)}</div>
    {tab==='overview'&&<div className="panel"><h3>GMV vs Commission — Last 7 Days</h3>
      <div style={{height:300}}><ResponsiveContainer><BarChart data={chart}>
        <CartesianGrid strokeDasharray="3 3" opacity={.2}/><XAxis dataKey="day"/><YAxis/><Tooltip formatter={v=>['৳'+v]}/>
        <Bar dataKey="gmv" fill="#3b82f6" radius={[6,6,0,0]} name="GMV"/><Bar dataKey="commission" fill="#8b5cf6" radius={[6,6,0,0]} name="Commission"/></BarChart></ResponsiveContainer></div></div>}
    {tab==='payouts'&&<div className="panel"><div className="panel-head"><h3>Seller Payouts ({payouts.length})</h3></div>
      <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Seller</th><th>Orders</th><th>Gross</th><th>Commission</th><th>Net</th><th>Paid</th><th>Pending</th><th>Action</th></tr></thead>
      <tbody>{payouts.map(m=><tr key={m.sellerId}><td><b>{m.name}</b><br/><span className="muted" style={{fontSize:12}}>{m.email}</span></td>
        <td>{m.orders}</td><td>৳{m.gross.toLocaleString()}</td><td>৳{m.commission.toLocaleString()}</td>
        <td><b>৳{m.net.toLocaleString()}</b></td><td><span className="badge ok">৳{m.paid.toLocaleString()}</span></td>
        <td>{m.pending>0?<span className="badge warn">৳{m.pending.toLocaleString()}</span>:<span className="muted">—</span>}</td>
        <td>{m.pending>0&&<button className="btn xs" style={{background:'#16a34a'}} onClick={()=>pay(m)}>Pay ৳{m.pending.toLocaleString()}</button>}</td></tr>)}</tbody></table></div>
      {payouts.length===0&&<p className="empty">No seller earnings yet.</p>}</div>}
  </div>;
}
