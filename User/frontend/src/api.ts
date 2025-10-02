import axios from 'axios'
export const API = import.meta.env.VITE_API || 'http://localhost:8002'
export function authHeaders(){ const t = localStorage.getItem('usr_token'); return t ? { Authorization:'Bearer '+t } : {} }
export const http = axios.create({ baseURL: API })
