import {useEffect,useState} from 'react';
import api from '../api';
export default function NotifBell(){
  const [list,setList]=useState([]); const [open,setOpen]=useState(false);
  const load=async()=>{ try{ const r=await api.get('/shop/notifications'); setList(r.data); }catch{} };
  useEffect(()=>{ load(); const t=setInterval(load,30000); return ()=>clearInterval(t); },[]);
  const unread=list.filter(n=>!n.read).length;
  const readAll=async()=>{ try{ await api.patch('/shop/notifications/read-all'); load(); }catch{} };
  return <div style={{position:'relative'}}>
    <button className="btn sm ghost" style={{width:'auto',fontSize:18,position:'relative'}} onClick={()=>setOpen(!open)}>🔔{unread>0&&<span className="cart-count">{unread}</span>}</button>
    {open&&<div style={{position:'absolute',right:0,top:46,width:300,maxHeight:380,overflowY:'auto',background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,zIndex:80,padding:8,boxShadow:'0 8px 30px rgba(0,0,0,.3)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'4px 8px'}}><b>Notifications</b><button className="btn xs ghost" onClick={readAll}>Mark all read</button></div>
      {list.map(n=><div key={n._id} style={{padding:'8px',borderBottom:'1px solid var(--border)',opacity:n.read?.55:1}}>
        <div style={{fontSize:13,fontWeight:700}}>{n.title}</div><div style={{fontSize:12,opacity:.75}}>{n.body}</div>
        <div style={{fontSize:10,opacity:.5}}>{new Date(n.createdAt).toLocaleString()}</div></div>)}
      {list.length===0&&<p className="empty">No notifications.</p>}
    </div>}
  </div>;
}
