import axios from 'axios';
const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'http://localhost:5000/api'});
api.interceptors.request.use(c=>{const t=localStorage.getItem('mp-token'); if(t) c.headers.Authorization='Bearer '+t; return c;});
export const getUser=()=>{try{return JSON.parse(localStorage.getItem('mp-user'))}catch{return null}};
export const logout=()=>{localStorage.clear(); location.href='/login';};
export default api;
