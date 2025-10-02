import { useEffect, useState } from 'react'
import { http, authHeaders } from '../api'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function Leaderboard(){
  const [rows,setRows]=useState<any[]>([])
  useEffect(()=>{ http.get('/stats/leaderboard',{ headers: authHeaders() }).then(r=>setRows(r.data)) }, [])
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-soft">
      <div className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">Leaderboard</div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={rows.map((r:any)=>({ name: r.name || r.target_id, avg: r.avg_weighted }))}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="avg" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
