import { useEffect, useState } from 'react'
import { http, authHeaders } from '../api'
import { Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material'

export default function LeaderboardPage(){
  const [rows,setRows]=useState<any[]>([])
  useEffect(()=>{ http.get('/stats/leaderboard', { headers: authHeaders() }).then(r=>setRows(r.data)) }, [])
  return (
    <Table size="small">
      <TableHead><TableRow><TableCell>Target ID</TableCell><TableCell>Count</TableCell><TableCell>Avg Weighted</TableCell></TableRow></TableHead>
      <TableBody>
        {rows.map((r:any,i:number)=>(
          <TableRow key={i}>
            <TableCell>{r.target_id}</TableCell>
            <TableCell>{r.n}</TableCell>
            <TableCell>{r.avg_weighted?.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
