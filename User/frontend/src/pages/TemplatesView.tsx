import { useEffect, useState } from 'react'
import { http, authHeaders } from '../api'

export default function TemplatesView(){
  const [items,setItems]=useState<any[]>([])
  useEffect(()=>{ http.get('/templates',{ headers: authHeaders() }).then(r=>setItems(r.data.items)) }, [])
  return (
    <div>
      {items.map((t:any)=>(
        <div key={t.id} className="mb-2">
          <div className="font-semibold">{t.name}</div>
          <div className="text-sm text-gray-600">{t.fields.map((f:any)=>`${f.title}(${f.weight})`).join(', ')}</div>
        </div>
      ))}
    </div>
  )
}
