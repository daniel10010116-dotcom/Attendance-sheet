import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import TopBar from '../components/TopBar'
import { dataStore } from '../store/dataStore'
import ResetPasswordModal from '../components/ResetPasswordModal'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'

export default function AdminHomePage() {
  const navigate = useNavigate()
  const [tick, setTick] = useState(0)
  const [students, setStudents] = useState([])
  const [coaches, setCoaches] = useState([])
  const [coachEarned, setCoachEarned] = useState({})
  const [addRole, setAddRole] = useState('coach')
  const [coachForm, setCoachForm] = useState({ name: '', account: '', password: '' })
  const [studentForm, setStudentForm] = useState({ name: '', account: '', password: '', contact: '' })
  const [assignForm, setAssignForm] = useState({ studentId: '', coachId: '', courseName: '課程', totalLessons: 10, salaryWhenDone: 0 })
  const [resetTarget, setResetTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    dataStore.getStudents().then(setStudents)
    dataStore.getCoaches().then(async (list) => {
      setCoaches(list)
      const map = {}
      for (const c of list || []) {
        map[c.id] = await dataStore.getCoachEarned(c.id)
      }
      setCoachEarned(map)
    })
  }, [tick])

  const handleCreateCoach = async (e) => {
    e.preventDefault()
    if (!coachForm.name.trim() || !coachForm.account.trim() || !coachForm.password) {
      setMessage('請填寫名稱、帳號、密碼')
      return
    }
    try {
      const id = await dataStore.createCoach(coachForm.name.trim(), coachForm.account.trim(), coachForm.password)
      if (!id) {
        setMessage('此帳號已被使用，請換一個')
        return
      }
      setCoachForm({ name: '', account: '', password: '' })
      setMessage('教練帳號已建立')
      setTick((t) => t + 1)
    } catch {
      setMessage('此帳號已被使用或發生錯誤')
    }
  }

  const handleCreateStudent = async (e) => {
    e.preventDefault()
    if (!studentForm.name.trim() || !studentForm.account.trim() || !studentForm.password) {
      setMessage('請填寫名稱、帳號、密碼')
      return
    }
    try {
      const id = await dataStore.createStudent(studentForm.name.trim(), studentForm.account.trim(), studentForm.password, studentForm.contact.trim())
      if (!id) {
        setMessage('此帳號已被使用，請換一個')
        return
      }
      setStudentForm({ name: '', account: '', password: '', contact: '' })
      setMessage('學生帳號已建立')
      setTick((t) => t + 1)
    } catch {
      setMessage('此帳號已被使用或發生錯誤')
    }
  }

  const handleAssign = async (e) => {
    e.preventDefault()
    if (!assignForm.studentId || !assignForm.coachId || assignForm.totalLessons <= 0) {
      setMessage('請選擇學生、教練並填寫堂數')
      return
    }
    try {
      await dataStore.assignStudentToCoach(
        assignForm.studentId,
        assignForm.coachId,
        assignForm.courseName,
        Number(assignForm.totalLessons),
        Number(assignForm.salaryWhenDone) || 0
      )
      setAssignForm({ ...assignForm, courseName: '課程', totalLessons: 10, salaryWhenDone: 0 })
      setMessage('已分配課程')
      setTick((t) => t + 1)
    } catch {
      setMessage('分配失敗')
    }
  }

  const handleResetPassword = async (studentId, newPassword) => {
    try {
      await dataStore.resetStudentPassword(studentId, newPassword)
      setResetTarget(null)
      setTick((t) => t + 1)
    } catch {
      setMessage('重設密碼失敗')
    }
  }

  const handleDeleteStudent = async () => {
    if (!deleteTarget) return
    try {
      await dataStore.deleteStudent(deleteTarget.id)
      setDeleteTarget(null)
      setTick((t) => t + 1)
    } catch {
      setMessage('刪除失敗')
    }
  }

  return (
    <>
      <TopBar title="管理員" />
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 2, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
        {message && (
          <Typography sx={{ color: '#0D9488', mb: 1 }}>{message}</Typography>
        )}

        {/* 區塊一：新增帳號 */}
        <Card sx={{ mb: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Typography sx={{ fontWeight: 600, fontSize: 16, mb: 2 }}>新增帳號</Typography>
            <ToggleButtonGroup
              value={addRole}
              exclusive
              onChange={(_, v) => v && setAddRole(v)}
              sx={{ mb: 2 }}
            >
              <ToggleButton value="coach" sx={{ px: 2, py: 1, fontSize: 14 }}>
                新增教練
              </ToggleButton>
              <ToggleButton value="student" sx={{ px: 2, py: 1, fontSize: 14 }}>
                新增學生
              </ToggleButton>
            </ToggleButtonGroup>
            {addRole === 'coach' ? (
              <form onSubmit={handleCreateCoach}>
                <TextField fullWidth id="admin-coach-name" label="名稱 *" value={coachForm.name} onChange={(e) => setCoachForm((f) => ({ ...f, name: e.target.value }))} inputProps={{ id: 'admin-coach-name' }} InputLabelProps={{ htmlFor: 'admin-coach-name' }} sx={{ mb: 1.5 }} />
                <TextField fullWidth id="admin-coach-account" label="帳號 *" value={coachForm.account} onChange={(e) => setCoachForm((f) => ({ ...f, account: e.target.value }))} inputProps={{ id: 'admin-coach-account' }} InputLabelProps={{ htmlFor: 'admin-coach-account' }} sx={{ mb: 1.5 }} />
                <TextField fullWidth id="admin-coach-password" label="密碼 *" type="password" value={coachForm.password} onChange={(e) => setCoachForm((f) => ({ ...f, password: e.target.value }))} inputProps={{ id: 'admin-coach-password' }} InputLabelProps={{ htmlFor: 'admin-coach-password' }} sx={{ mb: 2 }} />
                <Button type="submit" variant="contained" sx={{ minWidth: 120, height: 40 }}>送出</Button>
              </form>
            ) : (
              <form onSubmit={handleCreateStudent}>
                <TextField fullWidth id="admin-student-name" label="名稱 *" value={studentForm.name} onChange={(e) => setStudentForm((f) => ({ ...f, name: e.target.value }))} inputProps={{ id: 'admin-student-name' }} InputLabelProps={{ htmlFor: 'admin-student-name' }} sx={{ mb: 1.5 }} />
                <TextField fullWidth id="admin-student-account" label="帳號 *" value={studentForm.account} onChange={(e) => setStudentForm((f) => ({ ...f, account: e.target.value }))} inputProps={{ id: 'admin-student-account' }} InputLabelProps={{ htmlFor: 'admin-student-account' }} sx={{ mb: 1.5 }} />
                <TextField fullWidth id="admin-student-password" label="密碼 *" type="password" value={studentForm.password} onChange={(e) => setStudentForm((f) => ({ ...f, password: e.target.value }))} inputProps={{ id: 'admin-student-password' }} InputLabelProps={{ htmlFor: 'admin-student-password' }} sx={{ mb: 1.5 }} />
                <TextField fullWidth id="admin-student-contact" label="聯絡資料（選填）" value={studentForm.contact} onChange={(e) => setStudentForm((f) => ({ ...f, contact: e.target.value }))} inputProps={{ id: 'admin-student-contact' }} InputLabelProps={{ htmlFor: 'admin-student-contact' }} sx={{ mb: 2 }} />
                <Button type="submit" variant="contained" sx={{ minWidth: 120, height: 40 }}>送出</Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* 區塊二：分配學生給教練 */}
        <Card sx={{ mb: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Typography sx={{ fontWeight: 600, fontSize: 16, mb: 2 }}>分配學生給教練</Typography>
            <form onSubmit={handleAssign}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(5, auto)' },
                  alignItems: 'end',
                  gap: 2,
                  mb: 2,
                }}
              >
                <Box sx={{ minWidth: 140, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <label htmlFor="admin-assign-student" style={{ fontSize: 14, color: 'rgba(0,0,0,0.6)' }}>學生</label>
                  <select
                    id="admin-assign-student"
                    value={assignForm.studentId}
                    onChange={(e) => setAssignForm((f) => ({ ...f, studentId: e.target.value }))}
                    style={{
                      height: 40,
                      padding: '8px 14px',
                      fontSize: 16,
                      border: '1px solid rgba(0,0,0,0.23)',
                      borderRadius: 4,
                      outline: 'none',
                      minWidth: 140,
                    }}
                  >
                    <option value="">請選擇</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </Box>
                <Box sx={{ minWidth: 140, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <label htmlFor="admin-assign-coach" style={{ fontSize: 14, color: 'rgba(0,0,0,0.6)' }}>教練</label>
                  <select
                    id="admin-assign-coach"
                    value={assignForm.coachId}
                    onChange={(e) => setAssignForm((f) => ({ ...f, coachId: e.target.value }))}
                    style={{
                      height: 40,
                      padding: '8px 14px',
                      fontSize: 16,
                      border: '1px solid rgba(0,0,0,0.23)',
                      borderRadius: 4,
                      outline: 'none',
                      minWidth: 140,
                    }}
                  >
                    <option value="">請選擇</option>
                    {coaches.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </Box>
                <Box sx={{ minWidth: 120, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <label htmlFor="admin-assign-course" style={{ fontSize: 14, color: 'rgba(0,0,0,0.6)' }}>課程名稱</label>
                  <input
                    id="admin-assign-course"
                    type="text"
                    value={assignForm.courseName}
                    onChange={(e) => setAssignForm((f) => ({ ...f, courseName: e.target.value }))}
                    style={{
                      height: 40,
                      padding: '8px 14px',
                      fontSize: 16,
                      border: '1px solid rgba(0,0,0,0.23)',
                      borderRadius: 4,
                      outline: 'none',
                      minWidth: 120,
                    }}
                  />
                </Box>
                <Box sx={{ minWidth: 80, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <label htmlFor="admin-assign-lessons" style={{ fontSize: 14, color: 'rgba(0,0,0,0.6)' }}>堂數</label>
                  <input
                    id="admin-assign-lessons"
                    type="number"
                    min={1}
                    value={assignForm.totalLessons}
                    onChange={(e) => setAssignForm((f) => ({ ...f, totalLessons: e.target.value }))}
                    style={{
                      height: 40,
                      padding: '8px 14px',
                      fontSize: 16,
                      border: '1px solid rgba(0,0,0,0.23)',
                      borderRadius: 4,
                      outline: 'none',
                      minWidth: 80,
                    }}
                  />
                </Box>
                <Box sx={{ minWidth: 100, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <label htmlFor="admin-assign-salary" style={{ fontSize: 14, color: 'rgba(0,0,0,0.6)' }}>扣完薪水</label>
                  <input
                    id="admin-assign-salary"
                    type="number"
                    min={0}
                    value={assignForm.salaryWhenDone}
                    onChange={(e) => setAssignForm((f) => ({ ...f, salaryWhenDone: e.target.value }))}
                    style={{
                      height: 40,
                      padding: '8px 14px',
                      fontSize: 16,
                      border: '1px solid rgba(0,0,0,0.23)',
                      borderRadius: 4,
                      outline: 'none',
                      minWidth: 100,
                    }}
                  />
                </Box>
              </Box>
              <Button type="submit" variant="contained" sx={{ minWidth: 120, height: 40 }}>送出</Button>
            </form>
          </CardContent>
        </Card>

        {/* 區塊三：學生管理 */}
        <Card sx={{ mb: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Typography sx={{ fontWeight: 600, fontSize: 16, mb: 2 }}>學生管理</Typography>
            {students.map((s) => (
              <Box key={s.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: 1 }}>
                <Typography sx={{ fontSize: 14 }}>{s.name} · {s.account}</Typography>
                <Box>
                  <Button size="small" sx={{ color: '#0891B2', mr: 1 }} onClick={() => setResetTarget(s)}>重設密碼</Button>
                  <Button size="small" sx={{ color: '#DC2626' }} onClick={() => setDeleteTarget(s)}>刪除帳號</Button>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>

        {/* 區塊四：教練管理 */}
        <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Typography sx={{ fontWeight: 600, fontSize: 16, mb: 2 }}>教練管理</Typography>
            {coaches.map((c) => (
              <Box key={c.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: 1 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{c.name}</Typography>
                <Typography sx={{ fontSize: 14, color: '#0D9488' }}>累計 NT$ {coachEarned[c.id] ?? 0}</Typography>
                <Box>
                  <Button variant="contained" size="small" sx={{ mr: 1, minWidth: 100, height: 32 }} onClick={() => navigate(`/admin/coach/${c.id}/pay`)}>確認發薪</Button>
                  <Button variant="outlined" size="small" sx={{ minWidth: 90, height: 32 }} onClick={() => navigate(`/admin/coach/${c.id}/settings`)}>帳號設定</Button>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>

      <ResetPasswordModal
        open={!!resetTarget}
        name={resetTarget?.name}
        onClose={() => setResetTarget(null)}
        onConfirm={handleResetPassword}
        targetId={resetTarget?.id}
      />
      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="確認刪除學生帳號"
        description={deleteTarget ? `刪除「${deleteTarget.name}」後無法復原。` : ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteStudent}
      />
    </>
  )
}
