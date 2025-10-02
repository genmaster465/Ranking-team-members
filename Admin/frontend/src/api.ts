import axios from 'axios'
export const API = import.meta.env.VITE_API || 'http://localhost:8001'
export function authHeaders(){ const t = localStorage.getItem('adm_token'); return t ? { Authorization:'Bearer '+t } : {} }
export const http = axios.create({ baseURL: API })
