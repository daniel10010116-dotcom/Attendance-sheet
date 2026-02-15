import { useState, useEffect } from 'react'
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
import TextField from '@mui/material/TextField'
import Modal from '@mui/material/Modal'
import TopBar from '../components/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { dataStore } from '../store/dataStore'

export default function CoachHomePage() {
  const { user } = useAuth()
  const [tick, setTick] = useState(0)
  const [pendingList, setPendingList] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [earned, setEarned] = useState(0)
  const [salaryDetails, setSalaryDetails] = useState([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [queryOpen, setQueryOpen] = useState(false)
  const [records, setRecords] = useState([])

  useEffect(() => {
    if (!user?.id) return
    dataStore.getPendingByCoach(user.id).then(setPendingList)
    dataStore.getEnrollmentsByCoach(user.id).then(setEnrollments)
    dataStore.getCoachEarned(user.id).then(setEarned)
    dataStore.getCompletedSalaryDetails(user.id).then(setSalaryDetails)
  }, [user?.id, tick])

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 2000)
    return () => clearInterval(interval)
  }, [])

  const handleConfirm = async (pendingId) => {
    try {
      await dataStore.confirmAttendance(pendingId)
      setTick((t) => t + 1)
    } catch (_) {}
  }

  const handleQuery = async () => {
    try {
      const list = await dataStore.getAttendanceRecords(user?.id, startDate || undefined, endDate || undefined)
      setRecords(list)
      setQueryOpen(true)
    } catch (_) {}
  }

  // 為每筆扣堂紀錄計算「第幾節課」（同課程內依確認時間排序）
  const recordsWithLesson = useMemo(() => {
    if (records.length === 0) return []
    const byEnrollment = {}
    records.forEach((r) => {
      if (!byEnrollment[r.enrollmentId]) byEnrollment[r.enrollmentId] = []
      byEnrollment[r.enrollmentId].push(r)
    })
    const idToLesson = {}
    Object.keys(byEnrollment).forEach((eid) => {
      const sorted = [...byEnrollment[eid]].sort((a, b) => new Date(a.confirmedAt) - new Date(b.confirmedAt))
      sorted.forEach((r, idx) => {
        idToLesson[r.id] = idx + 1
      })
    })
    return records.map((r) => ({ ...r, lessonNumber: idToLesson[r.id] ?? 1 }))
  }, [records])

  const rows = enrollments.map((enr) => ({
    studentName: enr.studentName ?? '-',
    contact: enr.contact ?? '－',
    courseName: enr.courseName,
    remaining: enr.remainingLessons,
    salaryWhenDone: enr.salaryWhenDone,
  }))

  return (
    <>
      <TopBar title="教練工作台" />
      <Box sx={{ maxWidth: 720, mx: 'auto', p: 2, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
        {/* 區塊一：待確認點名 */}
        <Card sx={{ mb: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ borderBottom: '1px solid #E2E8F0', pb: 2 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#0F172A' }}>
              待確認點名
            </Typography>
          </CardContent>
          <CardContent sx={{ pt: 0 }}>
            {pendingList.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 3, fontSize: 14 }}>
                目前沒有待確認的點名
              </Typography>
            ) : (
              pendingList.map((p) => (
                <Box
                  key={p.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1.5,
                    px: 2,
                    borderBottom: '1px solid #F1F5F9',
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: 15, fontWeight: 500 }}>{p.studentName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {p.courseName} · {new Date(p.requestedAt).toLocaleString('zh-TW')}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleConfirm(p.id)}
                    sx={{ minWidth: 80, height: 32, fontWeight: 600, fontSize: 14 }}
                  >
                    確認
                  </Button>
                </Box>
              ))
            )}
          </CardContent>
        </Card>

        {/* 區塊二：我的學生 */}
        <Card sx={{ mb: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Typography sx={{ fontWeight: 600, fontSize: 16, mb: 2 }}>我的學生與課餘堂數</Typography>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: 14, color: '#475569' }}>學生名稱</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 14, color: '#475569' }}>聯絡方式</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 14, color: '#475569' }}>課程</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 14, color: '#475569' }}>課餘堂數</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 14, color: '#475569' }}>扣完可領薪水</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow key={i} sx={{ bgcolor: i % 2 ? '#F8FAFC' : '#FFFFFF' }}>
                    <TableCell sx={{ fontSize: 14 }}>{row.studentName}</TableCell>
                    <TableCell sx={{ fontSize: 14 }}>{row.contact}</TableCell>
                    <TableCell sx={{ fontSize: 14 }}>{row.courseName}</TableCell>
                    <TableCell sx={{ fontSize: 14 }}>{row.remaining}</TableCell>
                    <TableCell sx={{ fontSize: 14 }}>{row.salaryWhenDone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 區塊三：累計薪水 */}
        <Card sx={{ mb: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: '4px solid #0D9488' }}>
          <CardContent sx={{ py: 2.5 }}>
            <Typography sx={{ fontSize: 14, color: '#64748B' }}>累計薪水</Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 700, color: '#0D9488' }}>NT$ {earned}</Typography>
            <Typography sx={{ fontSize: 12, color: '#64748B', mt: 0.5 }}>
              此金額在管理員確認發薪後歸零
            </Typography>
            {salaryDetails.length > 0 && (
              <Table size="small" sx={{ mt: 2 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14, color: '#475569' }}>學員名稱</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14, color: '#475569' }}>課程名稱</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14, color: '#475569' }}>完成日期</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14, color: '#475569' }}>金額</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salaryDetails.map((d, i) => (
                    <TableRow key={i} sx={{ bgcolor: i % 2 ? '#F8FAFC' : '#FFFFFF' }}>
                      <TableCell sx={{ fontSize: 14 }}>{d.studentName}</TableCell>
                      <TableCell sx={{ fontSize: 14 }}>{d.courseName}</TableCell>
                      <TableCell sx={{ fontSize: 14 }}>{new Date(d.completedAt).toLocaleDateString('zh-TW')}</TableCell>
                      <TableCell sx={{ fontSize: 14 }}>NT$ {d.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* 區塊四：扣堂紀錄查詢 */}
        <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Typography sx={{ fontWeight: 600, fontSize: 16, mb: 2 }}>扣堂紀錄查詢</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <TextField
                type="date"
                id="coach-date-start"
                label="開始日"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true, htmlFor: 'coach-date-start' }}
                sx={{ width: 160 }}
                inputProps={{ id: 'coach-date-start', style: { height: 40, fontSize: 14 } }}
              />
              <TextField
                type="date"
                id="coach-date-end"
                label="結束日"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true, htmlFor: 'coach-date-end' }}
                sx={{ width: 160 }}
                inputProps={{ id: 'coach-date-end', style: { height: 40, fontSize: 14 } }}
              />
              <Button variant="contained" onClick={handleQuery} sx={{ height: 40, minWidth: 80, fontWeight: 600 }}>
                查詢
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Modal open={queryOpen} onClose={() => setQueryOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            maxWidth: 560,
            bgcolor: '#FFFFFF',
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
            maxHeight: '80vh',
            overflow: 'auto',
          }}
        >
          <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 2 }}>扣堂紀錄</Typography>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>學生</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>課程</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>第幾節課</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>日期</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recordsWithLesson.map((r) => (
                <TableRow key={r.id}>
                  <TableCell sx={{ fontSize: 14 }}>{r.studentName}</TableCell>
                  <TableCell sx={{ fontSize: 14 }}>{r.courseName}</TableCell>
                  <TableCell sx={{ fontSize: 14 }}>第 {r.lessonNumber} 節</TableCell>
                  <TableCell sx={{ fontSize: 14 }}>{new Date(r.confirmedAt).toLocaleDateString('zh-TW')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {records.length === 0 && (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              此區間無扣堂紀錄
            </Typography>
          )}
          <Button onClick={() => setQueryOpen(false)} sx={{ mt: 2 }}>關閉</Button>
        </Box>
      </Modal>
    </>
  )
}
