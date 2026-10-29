import { useNavigate } from 'react-router-dom'; import ThemeToggle from '../components/ThemeToggle'; import { useTheme } from '../context/ThemeContext';
export default function Landing(){ const nav=useNavigate(); const {dark,toggle}=useTheme();
  return <div className="landing"><div className="nav"><div className="logo">🛒 MarketPlace Command Center</div><button onClick={toggle} className="theme-btn" style={{position:'static'}}>{dark?'☀️':'🌙'}</button></div>
  <div className="hero"><h1>Enterprise Multi-Vendor Marketplace</h1><p>Buyer, Seller, Logistics Partner, Finance ar Super Admin — 5 role er full ecosystem ek platform e. Real-time orders, fraud detection, commission analytics.</p><button className="btn" onClick={()=>nav('/login')}>Login</button></div>
  <div className="feats">
    <div className="feat"><div className="ic">🏪</div><h4>Seller Ecosystem</h4><p>Multi-warehouse inventory, KYC, payout management</p></div>
    <div className="feat"><div className="ic">🛡️</div><h4>Fraud Detection</h4><p>AI-powered fake order ar return fraud flagging</p></div>
    <div className="feat"><div className="ic">📦</div><h4>Live Logistics</h4><p>OTP-verified pickup & delivery tracking</p></div>
    <div className="feat"><div className="ic">📊</div><h4>Command Analytics</h4><p>Real-time GMV, commission, seller performance</p></div>
  </div></div>; }
