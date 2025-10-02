import { useEffect, useState } from 'react'
import { http, authHeaders } from '../api'
import { Button, TextField, MenuItem, Select, Stack, Typography } from '@mui/material'

export default function RatePage(){
  const [users,setUsers]=useState<any[]>([])
  const [templates,setTemplates]=useState<any[]>([])
  const [target,setTarget]=useState('')
  const [template,setTemplate]=useState<any>(null)
  const [values,setValues]=useState<number[]>([])
  const [note,setNote]=useState('')

  useEffect(()=>{ load() },[])
  async function load(){
    const u = await http.get('/users',{ headers: authHeaders() })
    setUsers(u.data.items)
    const t = await http.get('/templates',{ headers: authHeaders() })
    setTemplates(t.data)
  }
  function chooseTemplate(id:string){
    const t = templates.find((x:any)=>x.id===id); setTemplate(t)
    setValues(t ? t.fields.map(()=>0): [])
  }
  async function submit(){
    if(!template || !target) return
    await http.post('/scores', { target_id: target, template_id: template.id, values, note }, { headers: authHeaders() })
    alert('Score submitted')
  }
  return (
    <Stack spacing={2}>
      <Typography>Submit a score</Typography>
      <Select value={target} onChange={e=>setTarget(e.target.value)} displayEmpty>
        <MenuItem value=""><em>Select target</em></MenuItem>
        {users.map(u=><MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
      </Select>
      <Select value={template?.id || ''} onChange={e=>chooseTemplate(e.target.value)} displayEmpty>
        <MenuItem value=""><em>Select template</em></MenuItem>
        {templates.map((t:any)=><MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
      </Select>
      {template && template.fields.map((f:any, i:number)=>(
        <TextField key={i} label={`${f.title} (0-100)`} type="number" value={values[i]}
          onChange={e=>{ const v=[...values]; v[i]=parseFloat(e.target.value||'0'); setValues(v) }} />
      ))}
      <TextField label="Note" value={note} onChange={e=>setNote(e.target.value)} />
      <Button variant="contained" onClick={submit}>Submit</Button>
    </Stack>
  )
}
