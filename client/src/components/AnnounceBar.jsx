import {useEffect,useState} from 'react';
import api from '../api';
export default function AnnounceBar(){
  const [list,setList]=useState([]);
  useEffect(()=>{ api.get('/shop/announcements/active').then(r=>setList(r.data)).catch(()=>{}); },[]);
  if(!list.length) return null;
  return <div style={{marginBottom:12}}>{list.map(a=><div key={a._id} className="panel" style={{borderLeft:'4px solid #3b82f6',marginBottom:8,padding:'10px 14px'}}>
    <b>📢 {a.title}</b><div style={{fontSize:13,opacity:.8}}>{a.body}</div></div>)}</div>;
}
