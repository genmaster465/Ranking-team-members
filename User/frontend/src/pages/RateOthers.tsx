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
    (async ()=>{
      try {
        const [uRes, tRes] = await Promise.all([
          http.get('/users', { headers: authHeaders() }),
          http.get('/templates', { headers: authHeaders() }),
        ])
        console.log("1--------" )
        const usersArr = uRes.data.items || []
        const tmplArr  = tRes.data.items || []

        setUsers(usersArr)
        setTemplates(tmplArr)
        console.log("2----------")
        // Try to get server-provided defaults; fall back to firsts
        try {
          console.log("3----------")
          const d = await http.get('/rating/defaults', { headers: authHeaders() })
          const defTarget = d.data?.target_id || usersArr[0]?.id || ''
          const defTemplateId = d.data?.template_id || tmplArr[0]?.id || ''
          if (defTarget) setTarget(defTarget)
          if (defTemplateId) {
            const t = tmplArr.find((x:any)=>x.id===defTemplateId) || tmplArr[0]
            setTemplate(t)
            setValues(t ? t.fields.map(()=>50) : [])
          }
        } catch {
          // If /rating/defaults is missing, still auto-pick firsts locally
          console.log('Using local firsts')
          const defTarget = usersArr[0]?.id || ''
          const defTemplate = tmplArr[0] || null
          if (defTarget) setTarget(defTarget)
          if (defTemplate) {
            setTemplate(defTemplate)
            setValues(defTemplate.fields.map(()=>50))
          }
        }
      } catch (e) {
        console.error(e)
      }
    })()
  },[])

  function chooseTemplate(id:string){
    const t = templates.find((x:any)=>x.id===id); setTemplate(t)
    setValues(t ? t.fields.map(()=>50): [])
  }

  async function submit(){
    if(!template || !target) return toast.error('Pick a target and template')
    await http.post('/scores',{ target_id: target, template_id: template.id, values, note }, { headers: authHeaders() })
    toast.success('Score submitted')
  }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-3">
        <select className="border rounded px-3 py-2 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                value={target} onChange={e=>setTarget(e.target.value)}>
          <option value="">Select target</option>
          {users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <select className="border rounded px-3 py-2 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                value={template?.id || ''} onChange={e=>chooseTemplate(e.target.value)}>
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

      <input className="border rounded px-3 py-2 w-full dark:bg-slate-900 dark:border-slate-700 dark:text-white"
             placeholder="Note" value={note} onChange={e=>setNote(e.target.value)} />
      <button className="px-3 py-2 bg-gradient-to-r from-sky-500 to-violet-600 text-white rounded-lg" onClick={submit}>
        Submit
      </button>
    </div>
  )
}
