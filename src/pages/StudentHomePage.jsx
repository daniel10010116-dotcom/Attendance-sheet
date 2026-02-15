import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TopBar from '../components/TopBar'
import { useAuth } from '../contexts/AuthContext'
import { dataStore } from '../store/dataStore'

export default function StudentHomePage() {
  const { user } = useAuth()
  const [tick, setTick] = useState(0)
  const [enrollments, setEnrollments] = useState([])
  const [pendingMap, setPendingMap] = useState({})

  useEffect(() => {
    if (!user?.id) return
    dataStore.getEnrollmentsByStudent(user.id).then(setEnrollments)
  }, [user?.id, tick])

  useEffect(() => {
    if (enrollments.length === 0) {
      setPendingMap({})
      return
    }
    let cancelled = false
    const map = {}
    enrollments.forEach((enr) => {
      dataStore.getPendingByEnrollment(enr.id).then((p) => {
        if (!cancelled) setPendingMap((m) => ({ ...m, [enr.id]: p }))
      })
    })
    return () => { cancelled = true }
  }, [enrollments])

  const handleRequestAttendance = async (enrollmentId) => {
    try {
      await dataStore.requestAttendance(enrollmentId)
      setTick((t) => t + 1)
    } catch (_) {}
  }

  return (
    <>
      <TopBar title="我的課程" />
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
        <Typography variant="h2" sx={{ mb: 3, color: '#0F172A' }}>
          我的課程
        </Typography>
        <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: enrollments.length ? 2 : 3 }}>
            {enrollments.length === 0 ? (
              <Typography align="center" color="text.secondary" sx={{ py: 2 }}>
                目前沒有課程
              </Typography>
            ) : (
              enrollments.map((enr, i) => {
                const coachName = enr.coachName ?? '教練'
                const pending = pendingMap[enr.id]
                const canRequest = enr.remainingLessons > 0 && !pending
                return (
                  <Box
                    key={enr.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 2,
                      px: 2,
                      borderBottom: i < enrollments.length - 1 ? '1px solid #F1F5F9' : 'none',
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: 16 }}>{coachName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {enr.courseName} · 剩餘{' '}
                        <Typography component="span" sx={{ color: '#0D9488', fontWeight: 600 }}>
                          {enr.remainingLessons}
                        </Typography>{' '}
                        堂
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      disabled={!canRequest}
                      onClick={() => canRequest && handleRequestAttendance(enr.id)}
                      sx={{
                        minWidth: 100,
                        height: 36,
                        fontWeight: 600,
                        fontSize: 14,
                        bgcolor: canRequest ? '#0D9488' : '#E2E8F0',
                        color: canRequest ? '#fff' : '#64748B',
                        '&:disabled': { color: '#64748B' },
                      }}
                    >
                      {pending ? '待教練確認' : '點名'}
                    </Button>
                  </Box>
                )
              })
            )}
          </CardContent>
        </Card>
      </Box>
    </>
  )
}
