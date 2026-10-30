import {useEffect,useState} from 'react';
import {getUser,logout} from '../api';
import ThemeToggle from '../components/ThemeToggle';
import SellerDash from '../dashboards/SellerDash';
import BuyerDash from '../dashboards/BuyerDash';
import LogisticsDash from '../dashboards/LogisticsDash';
import FinanceDash from '../dashboards/FinanceDash';
import AdminDash from '../dashboards/AdminDash';
const Soon=({role})=>{const u=getUser();return <div className="page"><div className="card"><ThemeToggle/><h2>{role} Dashboard</h2><p className="sub">{u?.fullName} · {u?.uniqueId}</p><p style={{textAlign:'center',opacity:.6}}>Coming in next step...</p><button className="btn" style={{background:'#6b7280'}} onClick={logout}>Logout</button></div></div>;};
export default function Dashboard(){
  const [u,setU]=useState(null);
  useEffect(()=>{const x=getUser(); if(!x) location.href='/login'; else setU(x);},[]);
  if(!u) return null;
  if(u.role==='seller') return <SellerDash user={u}/>;
  if(u.role==='buyer') return <BuyerDash user={u}/>;
  if(u.role==='logistics') return <LogisticsDash user={u}/>;
  if(u.role==='finance') return <FinanceDash user={u}/>;
  if(u.role==='admin') return <AdminDash user={u}/>;
  const label=u.role;
  return <Soon role={label}/>;
}
