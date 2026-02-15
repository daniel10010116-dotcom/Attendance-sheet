import { useState, useEffect } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { dataStore } from '../store/dataStore'

export default function CoachPayPage() {
  const { coachId } = useParams()
  const navigate = useNavigate()
  const [coach, setCoach] = useState(null)
  const [completed, setCompleted] = useState([])

  useEffect(() => {
    if (!coachId) return
    dataStore.getCoach(coachId).then(setCoach)
    dataStore.getCompletedEnrollmentsForCoach(coachId).then(setCompleted)
  }, [coachId])

  const total = completed.reduce((sum, e) => sum + (e.salaryWhenDone || 0), 0)

  const handleConfirmPay = async () => {
    try {
      await dataStore.confirmPayCoach(coachId)
      navigate('/admin', { replace: true })
    } catch (_) {}
  }

  if (coach === null) return null
  if (!coach) return <Navigate to="/admin" replace />

  const rows = completed.map((enr) => ({
    studentName: enr.studentName ?? '-',
    courseName: enr.courseName,
    salary: enr.salaryWhenDone,
  }))

  return (
    <>
      <Box sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', height: 56, display: 'flex', alignItems: 'center', px: 2 }}>
        <Button sx={{ color: '#0D9488', fontSize: 14, mr: 2 }} onClick={() => navigate('/admin')}>返回</Button>
        <Typography sx={{ fontSize: 18, fontWeight: 600 }}>{coach.name} － 發薪結算</Typography>
      </Box>
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, bgcolor: '#F8FAFC' }}>
        <Card sx={{ mb: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Typography sx={{ fontWeight: 600, fontSize: 16, mb: 2 }}>已結業課程</Typography>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>學生</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>課程</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>對應薪水</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{ fontSize: 14 }}>{row.studentName}</TableCell>
                    <TableCell sx={{ fontSize: 14 }}>{row.courseName}</TableCell>
                    <TableCell sx={{ fontSize: 14 }}>NT$ {row.salary}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#0D9488', mt: 2 }}>
              總計薪水：NT$ {total}
            </Typography>
          </CardContent>
        </Card>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/admin')} sx={{ color: '#475569', borderColor: '#E2E8F0' }}>
            取消
          </Button>
          <Button variant="contained" onClick={handleConfirmPay} sx={{ minWidth: 120, height: 44, fontWeight: 600 }}>
            確認發薪
          </Button>
        </Box>
      </Box>
    </>
  )
}
