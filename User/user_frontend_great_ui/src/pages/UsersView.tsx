import { useEffect, useState } from 'react'
import { http, authHeaders } from '../api'

export default function UsersView(){
  const [items,setItems]=useState<any[]>([])
  useEffect(()=>{ http.get('/users',{ headers: authHeaders() }).then(r=>setItems(r.data.items)) }, [])
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(u=>(
        <div key={u.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-soft">
          <div className="text-lg font-semibold text-slate-900 dark:text-white">{u.name}</div>
          <div className="text-sm text-slate-600 dark:text-slate-300">{u.email}</div>
        </div>
      ))}
    </div>
  )
}
