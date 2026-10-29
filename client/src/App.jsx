import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/Landing'; import Login from './pages/Login'; import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp'; import Forgot from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
const Dash = () => { const u = JSON.parse(localStorage.getItem('mp-user')||'null');
  if(!u) return <Navigate to="/login"/>;
  return <div className="page"><div className="card"><h2>Welcome, {u.fullName}</h2><p className="sub">Role: {u.role} | ID: {u.uniqueId}</p><p style={{textAlign:'center',color:'var(--muted)'}}>Role dashboards coming in Step 3...</p><button className="btn" style={{marginTop:16,background:'#6b7280'}} onClick={()=>{localStorage.clear();location.href='/login';}}>Logout</button></div></div>; };
export default function App(){ return <ThemeProvider><BrowserRouter><Routes>
  <Route path="/" element={<Landing/>}/><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/>
  <Route path="/verify-otp" element={<VerifyOtp/>}/><Route path="/forgot" element={<Forgot/>}/><Route path="/dashboard" element={<Dashboard/>}/>
</Routes></BrowserRouter></ThemeProvider>; }
