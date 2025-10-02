import { useEffect, useState } from 'react'
import { http, authHeaders } from '../api'
import { Button, TextField, Table, TableBody, TableCell, TableHead, TableRow, Stack } from '@mui/material'

type Field = { title:string, weight:number }
export default function TemplatesPage(){
  const [items,setItems]=useState<any[]>([])
  const [name,setName]=useState('')
  const [fields,setFields]=useState<Field[]>([{title:'Quality',weight:0.5},{title:'Speed',weight:0.3}])

  async function load(){ const r = await http.get('/templates', { headers: authHeaders() }); setItems(r.data) }
  useEffect(()=>{ load() }, [])

  function addField(){ setFields([...fields,{title:'',weight:0}]) }
  function updateField(i:number, key:keyof Field, val:any){
    const copy = [...fields]; (copy[i] as any)[key] = key==='weight'? parseFloat(val||0): val; setFields(copy)
  }
  async function create(){
    await http.post('/templates', {name, fields}, { headers: authHeaders() })
    setName(''); setFields([{title:'',weight:0}]); load()
  }
  async function del(id:string){ await http.delete('/templates/'+id, { headers: authHeaders() }); load() }

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1}>
        <TextField label="Template Name" value={name} onChange={e=>setName(e.target.value)} />
        <Button variant="outlined" onClick={addField}>Add Field</Button>
        <Button variant="contained" onClick={create}>Create</Button>
      </Stack>
      <Stack spacing={1}>
        {fields.map((f,i)=>(
          <Stack key={i} direction="row" spacing={1}>
            <TextField label="Title" value={f.title} onChange={e=>updateField(i,'title',e.target.value)} />
            <TextField label="Weight" type="number" value={f.weight} onChange={e=>updateField(i,'weight',e.target.value)} />
          </Stack>
        ))}
      </Stack>

      <Table size="small">
        <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Fields</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
        <TableBody>
          {items.map((t:any)=>(
            <TableRow key={t.id}>
              <TableCell>{t.name}</TableCell>
              <TableCell>{t.fields.map((f:any)=>`${f.title}(${f.weight})`).join(', ')}</TableCell>
              <TableCell align="right"><Button color="error" onClick={()=>del(t.id)}>Delete</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Stack>
  )
}
