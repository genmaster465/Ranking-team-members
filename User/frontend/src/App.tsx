import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import UsersView from './pages/UsersView'
import TemplatesView from './pages/TemplatesView'
import ScoreHistory from './pages/ScoreHistory'
import RateOthers from './pages/RateOthers'
import Leaderboard from './pages/Leaderboard'
import { API } from './api'

function Header({me}:{me:any}){
  const location = useLocation()
  const active = (path:string)=> location.pathname===path ? 'font-semibold' : ''
  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <nav className="space-x-4">
        <Link className={active('/users')} to="/users">Users</Link>
        <Link className={active('/templates')} to="/templates">Templates</Link>
        <Link className={active('/rate')} to="/rate">Rate</Link>
        <Link className={active('/history')} to="/history">History</Link>
        <Link className={active('/leaderboard')} to="/leaderboard">Leaderboard</Link>
      </nav>
      <div>{me ? `Hello, ${me.name || me.email}` : 'Not signed in'}</div>
    </header>
  )
}

function LoginPage({onAuthed}:{onAuthed:(t:string)=>void}){
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
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-2">User Login</h2>
      <div className="flex gap-2">
        <input className="border px-2" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border px-2" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="px-3 py-1 bg-black text-white rounded" onClick={doLogin}>Login</button>
      </div>
    </div>
  )
}

export default function App(){
  const [me, setMe] = useState<any>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('usr_token'))

  useEffect(()=>{
    if(token){
      axios.get(API + '/auth/me', { headers:{ Authorization:'Bearer '+token }})
        .then(res => setMe(res.data))
        .catch(()=> setMe(null))
    }
  }, [token])

  return (
    <BrowserRouter>
      <Header me={me} />
      <main className="p-6">
        <Routes>
          <Route path="/login" element={<LoginPage onAuthed={t=>setToken(t)} />} />
          <Route path="/users" element={<UsersView />} />
          <Route path="/templates" element={<TemplatesView />} />
          <Route path="/rate" element={<RateOthers />} />
          <Route path="/history" element={<ScoreHistory />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="*" element={<UsersView />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
