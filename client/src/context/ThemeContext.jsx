import { createContext, useState, useEffect, useContext } from 'react';
const C = createContext();
export const ThemeProvider = ({children}) => {
  const [dark, setDark] = useState(localStorage.getItem('mp-theme')==='dark');
  useEffect(()=>{ document.documentElement.setAttribute('data-theme', dark?'dark':'light'); localStorage.setItem('mp-theme', dark?'dark':'light'); },[dark]);
  return <C.Provider value={{dark, toggle:()=>setDark(d=>!d)}}>{children}</C.Provider>;
};
export const useTheme = () => useContext(C);
