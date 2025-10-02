import { useEffect, useState } from 'react'
import { http, authHeaders } from '../api'

export default function TemplatesView(){
  const [items,setItems]=useState<any[]>([])
  useEffect(()=>{ http.get('/templates',{ headers: authHeaders() }).then(r=>setItems(r.data.items)) }, [])
  return (
    <div className="space-y-4">
      {items.map((t:any)=>(
        <div key={t.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-soft">
          <div className="text-lg font-semibold text-slate-900 dark:text-white">{t.name}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {t.fields.map((f:any,i:number)=>(
              <span key={i} className="px-2 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">{f.title} ({f.weight})</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
