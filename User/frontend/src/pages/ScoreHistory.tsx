import { useEffect, useState } from 'react'
import { http, authHeaders } from '../api'

export default function ScoreHistory(){
  const [items,setItems]=useState<any[]>([])
  useEffect(()=>{ http.get('/scores/history',{ headers: authHeaders() }).then(r=>setItems(r.data.items)) }, [])
  return (
    <div className="space-y-2">
      {items.map((x:any)=>(
        <div key={x.id} className="border rounded p-2">
          <div className="font-semibold">{x.template.name} → {x.target.name}</div>
          <div className="text-sm">Values: {x.values.join(', ')}</div>
          <div className="text-xs text-gray-500">{new Date(x.rated_at).toLocaleString()} — {x.note || ''}</div>
        </div>
      ))}
    </div>
  )
}
