import { useEffect, useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom' // ⬅️ added Navigate,useLocation
import axios from 'axios'
import UsersView from './pages/UsersView'
import TemplatesView from './pages/TemplatesView'
import ScoreHistory from './pages/ScoreHistory'
import RateOthers from './pages/RateOthers'
import Leaderboard from './pages/Leaderboard'
import LoginPage from './pages/LoginPage'
import Layout from './components/Layout'
import { API } from './api'

function Protected({ isAuthed, children }: { isAuthed: boolean; children: JSX.Element }) {
  const location = useLocation()
  if (!isAuthed) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

export default function App(){
  const [me, setMe] = useState<any>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('usr_token'))
  const isAuthed = !!token // ⬅️ consider authed if we have a token

  useEffect(()=>{
    if(token){
      axios.get(API + '/auth/me', { headers:{ Authorization:'Bearer '+token }})
        .then(res => setMe(res.data))
        .catch(()=> setMe(null))
    } else {
      setMe(null)
    }
  }, [token])

  // central logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem('usr_token')
    setToken(null)
    setMe(null)
  }, [])

  return (
    <BrowserRouter>
      {/* ⬇️ pass isAuthed so Layout can disable nav when logged out */}
      <Layout me={me} isAuthed={isAuthed} onLogout={handleLogout}>
        <Routes>
          <Route path="/login" element={<LoginPage onAuthed={t=>setToken(t)} />} />
          <Route path="/users" element={
            <Protected isAuthed={isAuthed}><UsersView /></Protected>
          }/>
          <Route path="/templates" element={
            <Protected isAuthed={isAuthed}><TemplatesView /></Protected>
          }/>
          <Route path="/rate" element={
            <Protected isAuthed={isAuthed}><RateOthers /></Protected>
          }/>
          <Route path="/history" element={
            <Protected isAuthed={isAuthed}><ScoreHistory /></Protected>
          }/>
          <Route path="/leaderboard" element={
            <Protected isAuthed={isAuthed}><Leaderboard /></Protected>
          }/>
          {/* Default: guard too */}
          <Route path="*" element={
            <Protected isAuthed={isAuthed}><UsersView /></Protected>
          }/>
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
