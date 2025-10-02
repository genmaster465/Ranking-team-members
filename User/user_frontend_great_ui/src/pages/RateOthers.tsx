import { useEffect, useState } from 'react'
import { http, authHeaders } from '../api'
import toast from 'react-hot-toast'

export default function RateOthers(){
  const [users,setUsers]=useState<any[]>([])
  const [templates,setTemplates]=useState<any[]>([])
  const [target,setTarget]=useState('')
  const [template,setTemplate]=useState<any>(null)
  const [values,setValues]=useState<number[]>([])
  const [note,setNote]=useState('')

  useEffect(()=>{
    http.get('/users',{ headers: authHeaders() }).then(r=>setUsers(r.data.items))
    http.get('/templates',{ headers: authHeaders() }).then(r=>setTemplates(r.data.items))
  },[])

  function chooseTemplate(id:string){
    const t = templates.find((x:any)=>x.id===id); setTemplate(t)
    setValues(t ? t.fields.map(()=>50): [])
  }
  async function submit(){
    if(!template || !target) return
    await http.post('/scores',{ target_id: target, template_id: template.id, values, note }, { headers: authHeaders() })
    toast.success('Score submitted')
  }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-3">
        <select className="border rounded px-3 py-2 dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={target} onChange={e=>setTarget(e.target.value)}>
          <option value="">Select target</option>
          {users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <select className="border rounded px-3 py-2 dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={template?.id || ''} onChange={e=>chooseTemplate(e.target.value)}>
          <option value="">Select template</option>
          {templates.map((t:any)=><option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {template && template.fields.map((f:any,i:number)=>(
        <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-soft">
          <div className="flex justify-between text-sm mb-1 text-slate-600 dark:text-slate-300">
            <span>{f.title}</span><span>{values[i]}</span>
          </div>
          <input type="range" min="0" max="100" value={values[i]}
            onChange={e=>{ const v=[...values]; v[i]=parseFloat(e.target.value||'0'); setValues(v) }}
            className="w-full accent-violet-600" />
        </div>
      ))}

      <input className="border rounded px-3 py-2 w-full dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="Note" value={note} onChange={e=>setNote(e.target.value)} />
      <button className="px-3 py-2 bg-gradient-to-r from-sky-500 to-violet-600 text-white rounded-lg" onClick={submit}>Submit</button>
    </div>
  )
}
