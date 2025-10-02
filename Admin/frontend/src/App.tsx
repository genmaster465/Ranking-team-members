import { AppBar, Toolbar, Typography, Container, Button, Box, Tabs, Tab } from '@mui/material'
import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { http, authHeaders } from './api'
import UsersPage from './pages/UsersPage'
import TemplatesPage from './pages/TemplatesPage'
import RatePage from './pages/RatePage'
import LeaderboardPage from './pages/LeaderboardPage'

function Header({me}:{me:any}){
  const location = useLocation()
  const navigate = useNavigate()
  const tab = ['/users','/templates','/rate','/leaderboard'].indexOf(location.pathname)
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow:1 }}>Admin Panel</Typography>
        <Tabs value={tab >= 0 ? tab : false} textColor="inherit" indicatorColor="secondary">
          <Tab component={Link} to="/users" label="Users" />
          <Tab component={Link} to="/templates" label="Templates" />
          <Tab component={Link} to="/rate" label="Rate" />
          <Tab component={Link} to="/leaderboard" label="Leaderboard" />
        </Tabs>
        <Box sx={{ml:2}}>{me ? `Hello, ${me.name || me.email}` : 'Not signed in'}</Box>
        {!me && <Button color="inherit" onClick={()=>navigate('/login')}>Login</Button>}
      </Toolbar>
    </AppBar>
  )
}

function LoginPage({onAuthed}:{onAuthed:(t:string)=>void}){
  const [email,setEmail]=useState('admin@example.com')
  const [password,setPassword]=useState('pass123')
  const nav = useNavigate()
  async function doLogin(){
    const res = await http.post('/auth/login',{email,password})
    localStorage.setItem('adm_token', res.data.token)
    onAuthed(res.data.token)
    nav('/users')
  }
  return (
    <Container sx={{py:6}}>
      <Typography variant="h5" sx={{mb:2}}>Admin Login</Typography>
      <div className="form">
        <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <Button variant="contained" onClick={doLogin}>Login</Button>
      </div>
    </Container>
  )
}

export default function App(){
  const [me, setMe] = useState<any>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('adm_token'))

  useEffect(()=>{
    if(token){
      http.get('/auth/me', { headers: authHeaders() })
        .then(res => setMe(res.data))
        .catch(()=> setMe(null))
    }
  }, [token])

  return (
    <BrowserRouter>
      <Header me={me} />
      <Container sx={{ py:3 }}>
        <Routes>
          <Route path="/login" element={<LoginPage onAuthed={t=>setToken(t)} />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/rate" element={<RatePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="*" element={<UsersPage />} />
        </Routes>
      </Container>
    </BrowserRouter>
  )
}
