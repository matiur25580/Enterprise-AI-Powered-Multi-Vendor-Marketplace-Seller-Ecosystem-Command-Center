import {useEffect,useState} from 'react';
const pad=n=>String(n).padStart(2,'0');
export const fmtDate=d=>`${pad(d.getDate())}.${pad(d.getMonth()+1)}.${d.getFullYear()}`;
export const fmtTime=d=>`${pad(d.getHours())}.${pad(d.getMinutes())}.${pad(d.getSeconds())}`;
export default function ClockStrip(){
  const [now,setNow]=useState(new Date());
  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),1000);return ()=>clearInterval(t);},[]);
  return <div className="clock-strip"><span>📅 {fmtDate(now)}</span><span>🕐 {fmtTime(now)}</span></div>;
}
