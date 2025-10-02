import { useEffect, useState } from 'react'
import { http, authHeaders } from '../api'

export default function UsersView(){
  const [items,setItems]=useState<any[]>([])
  useEffect(()=>{ http.get('/users',{ headers: authHeaders() }).then(r=>setItems(r.data.items)) }, [])
  return <ul className="list-disc ml-6">{items.map(u=><li key={u.id}>{u.name} — {u.email}</li>)}</ul>
}
