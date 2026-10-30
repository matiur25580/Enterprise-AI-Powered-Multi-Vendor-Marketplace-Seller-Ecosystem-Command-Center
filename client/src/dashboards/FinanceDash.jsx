import {useEffect,useState} from 'react';
import api,{logout} from '../api';
import ThemeToggle from '../components/ThemeToggle';
import NotifBell from '../components/NotifBell';
import AnnounceBar from '../components/AnnounceBar';
import './dash.css';
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,CartesianGrid} from 'recharts';
export default function FinanceDash({user}){
  const [tab,setTab]=useState('overview');
  const [fin,setFin]=useState(null); const [payouts,setPayouts]=useState([]); const [orders,setOrders]=useState([]); const [refunds,setRefunds]=useState([]);
  const [msg,setMsg]=useState(null);
  const load=async()=>{ try{ const [f,p,o,rf]=await Promise.all([api.get('/shop/finance'),api.get('/shop/finance/payouts'),api.get('/shop/orders'),api.get('/shop/finance/refunds')]); setFin(f.data); setPayouts(p.data); setOrders(o.data); setRefunds(rf.data); }catch(e){ setMsg({t:'err',x:'Failed to load finance data'}); } };
  useEffect(()=>{load();},[]);
  const ok=x=>{setMsg({t:'ok',x}); setTimeout(()=>setMsg(null),2500);};
  const er=e=>setMsg({t:'err',x:e.response?.data?.msg||'Failed'});
  const refundDone=async id=>{ if(!confirm('Mark refund as done?')) return; try{ await api.patch('/shop/finance/refunds/'+id); ok('Refund marked as done'); load(); }catch(e){er(e);} };
  const dlCSV=(name,rows)=>{ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([rows.map(r=>r.join(',')).join('\n')],{type:'text/csv'})); a.download=name; a.click(); };
  const expPayouts=()=>dlCSV('payouts.csv',[['Seller','Email','Orders','Gross','Commission','Net','Paid','Pending'],...payouts.map(m=>[m.name,m.email,m.orders,m.gross,m.commission,m.net,m.paid,m.pending])]);
  const expOrders=()=>dlCSV('orders.csv',[['TrackingID','Total','Commission','Status','Date'],...orders.map(o=>[o.trackingId,o.total,o.commission||0,o.status,(o.createdAt||'').slice(0,10)])]);
  const pay=async m=>{ if(!confirm(`Pay ৳${m.pending.toLocaleString()} to ${m.name}?`)) return;
    try{ await api.post('/shop/finance/payouts/pay',{sellerId:m.sellerId,amount:m.pending}); ok('Payout recorded successfully!'); load(); }catch(e){er(e);} };
  if(!fin) return <div className="dash"><p className="empty">Loading...</p></div>;
  const stats=[
    {l:'GMV (Total Sales)',v:'৳'+Math.round(fin.gmv).toLocaleString(),c:'#3b82f6'},
    {l:'Platform Commission (10%)',v:'৳'+Math.round(fin.commission).toLocaleString(),c:'#8b5cf6'},
    {l:'Net to Sellers',v:'৳'+Math.round(fin.gmv-fin.commission).toLocaleString(),c:'#16a34a'},
    {l:'Total Orders',v:fin.orders,c:'#f59e0b'},
    {l:'Fraud Flagged',v:fin.fraud,c:'#ef4444'},{l:'Discounts Given',v:'৳'+Math.round(fin.discount||0).toLocaleString(),c:'#ec4899'},{l:'Refunds Pending',v:refunds.filter(x=>x.refundStatus==='pending').length,c:'#f97316'}];
  const valid=orders.filter(o=>o.status!=='cancelled');
  const months={}; valid.forEach(o=>{ const k=(o.createdAt||'').slice(0,7); if(!k) return; if(!months[k]) months[k]={m:k,gmv:0,commission:0,orders:0}; months[k].gmv+=o.total; months[k].commission+=o.commission||0; months[k].orders++; });
  const mArr=Object.values(months).sort((a,b)=>a.m<b.m?-1:1).slice(-6);
  const days=[...Array(7)].map((_,i)=>{const d=new Date(); d.setDate(d.getDate()-(6-i)); return d;});
  const chart=days.map(d=>{const k=d.toISOString().slice(0,10);
    const os=valid.filter(o=>(o.createdAt||'').slice(0,10)===k);
    return {day:d.toLocaleDateString('en',{weekday:'short'}), gmv:Math.round(os.reduce((s,o)=>s+o.total,0)), commission:Math.round(os.reduce((s,o)=>s+(o.commission||0),0))};});
  return <div className="dash">
    <div className="dash-head"><div><h2>💰 Finance Control</h2><p className="sub">{user.fullName} · {user.uniqueId}</p></div>
      <div className="head-actions"><NotifBell/><ThemeToggle/><button className="btn sm" style={{background:'#6b7280'}} onClick={logout}>Logout</button></div></div>
    {msg&&<div className={`msg ${msg.t}`}>{msg.x}</div>}
    <AnnounceBar/>
    <div className="stat-grid">{stats.map(x=><div className="stat-card" key={x.l}><div className="stat-v" style={{color:x.c}}>{x.v}</div><div className="stat-l">{x.l}</div></div>)}</div>
    <div className="tabs">{['overview','monthly','payouts','refunds'].map(t=><button key={t} className={'tab'+(tab===t?' active':'')} onClick={()=>setTab(t)}>{t==='overview'?'Revenue Overview':t==='monthly'?'Monthly Report':t==='payouts'?'Seller Payouts':'Refunds'}</button>)}</div>
    {tab==='overview'&&<div className="panel"><h3>GMV vs Commission — Last 7 Days</h3>
      <div style={{height:300}}><ResponsiveContainer><BarChart data={chart}>
        <CartesianGrid strokeDasharray="3 3" opacity={.2}/><XAxis dataKey="day"/><YAxis/><Tooltip formatter={v=>['৳'+v]}/>
        <Bar dataKey="gmv" fill="#3b82f6" radius={[6,6,0,0]} name="GMV"/><Bar dataKey="commission" fill="#8b5cf6" radius={[6,6,0,0]} name="Commission"/></BarChart></ResponsiveContainer></div></div>}
    {tab==='monthly'&&<div className="panel"><div className="panel-head"><h3>📅 Monthly Report</h3><div><button className="btn xs" onClick={expOrders}>⬇ Orders CSV</button> <button className="btn xs" onClick={expPayouts}>⬇ Payouts CSV</button></div></div>
      <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Month</th><th>Orders</th><th>GMV</th><th>Commission</th><th>Net to Sellers</th></tr></thead>
      <tbody>{mArr.map(x=><tr key={x.m}><td><b>{x.m}</b></td><td>{x.orders}</td><td>৳{Math.round(x.gmv).toLocaleString()}</td><td>৳{Math.round(x.commission).toLocaleString()}</td><td><b>৳{Math.round(x.gmv-x.commission).toLocaleString()}</b></td></tr>)}</tbody></table></div>
      {mArr.length===0&&<p className="empty">No data yet.</p>}</div>}
    {tab==='payouts'&&<div className="panel"><div className="panel-head"><h3>Seller Payouts ({payouts.length})</h3><button className="btn xs" onClick={expPayouts}>⬇ Export CSV</button></div>
      <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Seller</th><th>Orders</th><th>Gross</th><th>Commission</th><th>Net</th><th>Paid</th><th>Pending</th><th>Action</th></tr></thead>
      <tbody>{payouts.map(m=><tr key={m.sellerId}><td><b>{m.name}</b><br/><span className="muted" style={{fontSize:12}}>{m.email}</span></td>
        <td>{m.orders}</td><td>৳{m.gross.toLocaleString()}</td><td>৳{m.commission.toLocaleString()}</td>
        <td><b>৳{m.net.toLocaleString()}</b></td><td><span className="badge ok">৳{m.paid.toLocaleString()}</span></td>
        <td>{m.pending>0?<span className="badge warn">৳{m.pending.toLocaleString()}</span>:<span className="muted">—</span>}</td>
        <td>{m.pending>0&&<button className="btn xs" style={{background:'#16a34a'}} onClick={()=>pay(m)}>Pay ৳{m.pending.toLocaleString()}</button>}</td></tr>)}</tbody></table></div>
      {payouts.length===0&&<p className="empty">No seller earnings yet.</p>}</div>}
    {tab==='refunds'&&<div className="panel"><div className="panel-head"><h3>💸 Refunds ({refunds.length})</h3></div>
      <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Tracking ID</th><th>Buyer</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>{refunds.map(x=><tr key={x._id}><td className="mono">{x.trackingId}</td><td>{x.buyerId?.fullName}<br/><span className="muted" style={{fontSize:12}}>{x.buyerId?.email}</span></td>
        <td>৳{(+x.total).toLocaleString()}</td><td>{x.refundStatus==='done'?<span className="badge ok">done</span>:<span className="badge warn">pending</span>}</td>
        <td>{x.refundStatus==='pending'&&<button className="btn xs" style={{background:'#16a34a'}} onClick={()=>refundDone(x._id)}>Mark Refunded</button>}</td></tr>)}</tbody></table></div>
      {refunds.length===0&&<p className="empty">No refunds.</p>}</div>}
  </div>;
}
