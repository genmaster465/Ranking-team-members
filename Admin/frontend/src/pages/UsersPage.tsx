import { useEffect, useState } from 'react'
import { http, authHeaders } from '../api'
import { Button, TextField, Table, TableBody, TableCell, TableHead, TableRow, Stack } from '@mui/material'

export default function UsersPage(){
  const [items,setItems]=useState<any[]>([])
  const [q,setQ]=useState('')
  const [form,setForm]=useState({name:'',email:'',password:'',is_admin:false})

  async function load(){ const r = await http.get('/users',{ params:{q}, headers: authHeaders() }); setItems(r.data.items) }
  useEffect(()=>{ load() }, [])

  async function create(){
    await http.post('/users', form, { headers: authHeaders() })
    setForm({name:'',email:'',password:'',is_admin:false})
    load()
  }
  async function del(id:string){ await http.delete('/users/'+id, { headers: authHeaders() }); load() }

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1}>
        <TextField label="Search" value={q} onChange={e=>setQ(e.target.value)} />
        <Button variant="outlined" onClick={load}>Search</Button>
      </Stack>
      <Stack direction="row" spacing={1}>
        <TextField label="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
        <TextField label="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
        <TextField label="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
        <Button variant="contained" onClick={create}>Add User</Button>
      </Stack>
      <Table size="small">
        <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Admin</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
        <TableBody>
          {items.map(u=>(
            <TableRow key={u.id}>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.is_admin? 'Yes':'No'}</TableCell>
              <TableCell align="right"><Button color="error" onClick={()=>del(u.id)}>Delete</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Stack>
  )
}
