import { useEffect, useState } from 'react'
import { http, authHeaders } from '../api'

export default function ScoreHistory(){
  const [items,setItems]=useState<any[]>([])
  useEffect(()=>{ http.get('/scores/history',{ headers: authHeaders() }).then(r=>setItems(r.data.items)) }, [])
  return (
    <div className="relative pl-6">
      <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
      {items.map((x:any)=>(
        <div key={x.id} className="mb-4 relative">
          <div className="absolute -left-1 top-2 w-3 h-3 rounded-full bg-violet-600"></div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-soft">
            <div className="font-semibold text-slate-900 dark:text-white">{x.template.name} → {x.target.name}</div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Values: {x.values.join(', ')}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{new Date(x.rated_at).toLocaleString()} — {x.note || ''}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
