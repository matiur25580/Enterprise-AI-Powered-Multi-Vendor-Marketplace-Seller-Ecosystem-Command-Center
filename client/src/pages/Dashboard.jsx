import ThemeToggle from '../components/ThemeToggle';
import BuyerDash from '../dashboards/BuyerDash'; import SellerDash from '../dashboards/SellerDash';
import LogisticsDash from '../dashboards/LogisticsDash'; import FinanceDash from '../dashboards/FinanceDash'; import AdminDash from '../dashboards/AdminDash';
const TITLES={buyer:'Buyer Dashboard',seller:'Seller Dashboard',logistics:'Logistics Dashboard',finance:'Finance Dashboard',admin:'Super Admin Dashboard'};
export default function Dashboard(){ const u=JSON.parse(localStorage.getItem('mp-user')||'null');
  if(!u){ location.href='/login'; return null; }
  const R={buyer:<BuyerDash/>,seller:<SellerDash/>,logistics:<LogisticsDash/>,finance:<FinanceDash/>,admin:<AdminDash/>}[u.role]||<BuyerDash/>;
  return <div style={{padding:20,maxWidth:900,margin:'0 auto'}}><div className="card" style={{maxWidth:'100%',marginBottom:14,display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><b>{TITLES[u.role]}</b><br/><small style={{color:'var(--muted)'}}>{u.fullName} | {u.uniqueId}</small></div><ThemeToggle/></div><div className="card" style={{maxWidth:'100%'}}>{R}<button className="btn" style={{marginTop:18,background:'#6b7280'}} onClick={()=>{localStorage.clear();location.href='/login';}}>Logout</button></div></div>; }
