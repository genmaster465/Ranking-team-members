import { useEffect, useState } from 'react'
import { http, authHeaders } from '../api'

export default function Leaderboard(){
  const [rows,setRows]=useState<any[]>([])
  useEffect(()=>{ http.get('/stats/leaderboard',{ headers: authHeaders() }).then(r=>setRows(r.data)) }, [])
  return (
    <table className="text-left">
      <thead><tr><th className="pr-4">Name</th><th className="pr-4">Count</th><th>Avg Weighted</th></tr></thead>
      <tbody>
        {rows.map((r:any,i:number)=>(
          <tr key={i}><td className="pr-4">{r.name || r.target_id}</td><td className="pr-4">{r.n}</td><td>{(r.avg_weighted||0).toFixed(2)}</td></tr>
        ))}
      </tbody>
    </table>
  )
}
