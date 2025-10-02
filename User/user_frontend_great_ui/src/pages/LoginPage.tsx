import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API } from '../api'

export default function LoginPage({onAuthed}:{onAuthed:(t:string)=>void}){
  const [email,setEmail]=useState('alice@example.com')
  const [password,setPassword]=useState('pass123')
  const nav = useNavigate()
  async function doLogin(){
    const res = await axios.post(API + '/auth/login',{email,password})
    localStorage.setItem('usr_token', res.data.token)
    onAuthed(res.data.token)
    nav('/users')
  }
  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-slate-800 rounded-2xl shadow-soft p-6">
      <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">User Login</h2>
      <div className="flex flex-col gap-3">
        <input className="border rounded px-3 py-2 dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border rounded px-3 py-2 dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="px-3 py-2 bg-gradient-to-r from-sky-500 to-violet-600 text-white rounded-lg" onClick={doLogin}>Login</button>
      </div>
    </div>
  )
}
