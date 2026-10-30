import {useEffect,useState} from 'react';
import api,{logout} from '../api';
import ThemeToggle from '../components/ThemeToggle';
import NotifBell from '../components/NotifBell';
import AnnounceBar from '../components/AnnounceBar';
import './dash.css';
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,CartesianGrid,PieChart,Pie,Cell,Legend} from 'recharts';
const COLORS=['#3b82f6','#8b5cf6','#16a34a','#f59e0b','#ef4444'];
export default function AdminDash({user}){
  const [tab,setTab]=useState('overview');
  const [stats,setStats]=useState(null); const [users,setUsers]=useState([]); const [products,setProducts]=useState([]); const [reviews,setReviews]=useState([]); const [coupons,setCoupons]=useState([]); const [anns,setAnns]=useState([]); const [acts,setActs]=useState([]);
  const [af,setAf]=useState({title:'',body:''});
  const [msg,setMsg]=useState(null);
  const load=async()=>{ try{ const [s,u,p,rv,cp]=await Promise.all([api.get('/shop/admin/stats'),api.get('/shop/admin/users'),api.get('/shop/products'),api.get('/shop/reviews/all/list'),api.get('/shop/coupons/all/list'),api.get('/shop/announcements/all'),api.get('/shop/admin/activity')]); setStats(s.data); setUsers(u.data); setProducts(p.data); setReviews(rv.data); setCoupons(cp.data); setAnns(an[4].data); setActs(an[5].data); }catch(e){ setMsg({t:'err',x:'Failed to load admin data'}); } };
  useEffect(()=>{load();},[]);
  const ok=x=>{setMsg({t:'ok',x}); setTimeout(()=>setMsg(null),2500);};
  const er=e=>setMsg({t:'err',x:e.response?.data?.msg||'Failed'});
  const toggleBlock=async u=>{ if(!confirm((u.isBlocked?'Unblock ':'Block ')+u.fullName+'?')) return;
    try{ const r=await api.patch('/shop/admin/users/'+u._id); ok(r.data.msg); load(); }catch(e){er(e);} };
  const seed=async()=>{ try{ const r=await api.get('/shop/seed'); ok(r.data.msg); load(); }catch(e){er(e);} };
  const delRv=async id=>{ if(!confirm('Delete review?')) return; try{ await api.delete('/shop/reviews/'+id); ok('Review deleted'); load(); }catch(e){er(e);} };
  const toggleCp=async id=>{ try{ const r=await api.patch('/shop/coupons/'+id+'/toggle'); ok(r.data.msg); load(); }catch(e){er(e);} };
  const delCp=async id=>{ if(!confirm('Delete coupon?')) return; try{ await api.delete('/shop/coupons/'+id); ok('Coupon deleted'); load(); }catch(e){er(e);} };
  const addAnn=async e=>{ e.preventDefault(); try{ await api.post('/shop/announcements',af); ok('Announcement published!'); setAf({title:'',body:''}); load(); }catch(e){er(e);} };
  const delAnn=async id=>{ if(!confirm('Delete announcement?')) return; try{ await api.delete('/shop/announcements/'+id); ok('Deleted'); load(); }catch(e){er(e);} };
  const delP=async id=>{ if(!confirm('Delete this product?')) return; try{ await api.delete('/shop/products/'+id); ok('Product deleted successfully!'); load(); }catch(e){er(e);} };
  if(!stats) return <div className="dash"><p className="empty">Loading...</p></div>;
  const cards=[
    {l:'Total Users',v:stats.users,c:'#3b82f6'},{l:'Products',v:stats.products,c:'#8b5cf6'},
    {l:'Orders',v:stats.orders,c:'#f59e0b'},{l:'GMV',v:'৳'+Math.round(stats.gmv).toLocaleString(),c:'#16a34a'},
    {l:'Commission Earned',v:'৳'+Math.round(stats.commission).toLocaleString(),c:'#06b6d4'},
    {l:'Fraud Flagged',v:stats.fraud,c:'#ef4444'},{l:'Reviews',v:stats.reviews||0,c:'#f59e0b'},{l:'Coupons',v:stats.coupons||0,c:'#ec4899'}];
  const rolePie=Object.entries(stats.byRole||{}).map(([name,value])=>({name,value}));
  const statusBar=Object.entries(stats.byStatus||{}).map(([s,v])=>({status:s,orders:v}));
  return <div className="dash">
    <div className="dash-head"><div><h2>👑 Super Admin</h2><p className="sub">{user.fullName} · {user.uniqueId}</p></div>
      <div className="head-actions"><button className="btn sm" onClick={seed}>🌱 Seed Demo Products</button><ThemeToggle/><button className="btn sm" style={{background:'#6b7280'}} onClick={logout}>Logout</button></div></div>
    {msg&&<div className={`msg ${msg.t}`}>{msg.x}</div>}
    <AnnounceBar/>
    <div className="stat-grid">{cards.map(x=><div className="stat-card" key={x.l}><div className="stat-v" style={{color:x.c}}>{x.v}</div><div className="stat-l">{x.l}</div></div>)}</div>
    <div className="tabs">{['overview','activity','users','products','reviews','coupons','announce'].map(t=><button key={t} className={'tab'+(tab===t?' active':'')} onClick={()=>setTab(t)}>{t[0].toUpperCase()+t.slice(1)}</button>)}</div>
    {tab==='activity'&&<div className="panel"><div className="panel-head"><h3>📋 Live Activity Feed</h3></div>
      {acts.map((a,i)=><div key={i} style={{borderBottom:'1px solid var(--border)',padding:'10px 4px',display:'flex',gap:10}}>
        <span style={{fontSize:20}}>{a.icon}</span><div><div style={{fontSize:14}}>{a.text}</div><div className="muted" style={{fontSize:11}}>{new Date(a.at).toLocaleString()}</div></div></div>)}
      {acts.length===0&&<p className="empty">No activity yet.</p>}</div>}
    {tab==='overview'&&<div className="prod-grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))'}}>
      <div className="panel"><h3>Users by Role</h3><div style={{height:260}}><ResponsiveContainer><PieChart>
        <Pie data={rolePie} dataKey="value" nameKey="name" outerRadius={90} label>{rolePie.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie>
        <Tooltip/><Legend/></PieChart></ResponsiveContainer></div></div>
      <div className="panel"><h3>Orders by Status</h3><div style={{height:260}}><ResponsiveContainer><BarChart data={statusBar}>
        <CartesianGrid strokeDasharray="3 3" opacity={.2}/><XAxis dataKey="status"/><YAxis allowDecimals={false}/><Tooltip/>
        <Bar dataKey="orders" fill="#3b82f6" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div></div></div>}
    {tab==='users'&&<div className="panel"><div className="panel-head"><h3>All Users ({users.length})</h3></div>
      <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Unique ID</th><th>Verified</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>{users.map(u=><tr key={u._id}><td><b>{u.fullName}</b></td><td>{u.email}</td>
        <td><span className="badge shipped">{u.role}</span></td><td className="mono">{u.uniqueId}</td>
        <td>{u.isVerified?<span className="badge ok">✓</span>:<span className="badge warn">pending</span>}</td>
        <td>{u.isBlocked?<span className="badge danger">BLOCKED</span>:<span className="badge ok">active</span>}</td>
        <td><button className="btn xs" style={u.isBlocked?{background:'#16a34a'}:{background:'#ef4444'}} onClick={()=>toggleBlock(u)}>{u.isBlocked?'Unblock':'Block'}</button></td></tr>)}</tbody></table></div></div>}
    {tab==='products'&&<div className="panel"><div className="panel-head"><h3>All Products ({products.length})</h3></div>
      <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Warehouse</th><th>Action</th></tr></thead>
      <tbody>{products.map(p=><tr key={p._id}><td><b>{p.name}</b></td><td>{p.category}</td><td>৳{(+p.price).toLocaleString()}</td><td>{p.stock}</td><td>{p.warehouse}</td>
        <td><button className="btn xs danger" onClick={()=>delP(p._id)}>Delete</button></td></tr>)}</tbody></table></div></div>}
  </div>;
}
