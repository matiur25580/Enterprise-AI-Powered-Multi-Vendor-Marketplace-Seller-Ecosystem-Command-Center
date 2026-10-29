import { useTheme } from '../context/ThemeContext';
export default function ThemeToggle(){ const {dark,toggle}=useTheme();
  return <button onClick={toggle} className="theme-btn" title="Theme">{dark?'☀️':'🌙'}</button>; }
