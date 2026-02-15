import { useState, useEffect } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { dataStore } from '../store/dataStore'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'

export default function CoachSettingsPage() {
  const { coachId } = useParams()
  const navigate = useNavigate()
  const [coach, setCoach] = useState(null)
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!coachId) return
    dataStore.getCoach(coachId).then((c) => {
      setCoach(c)
      setAccount(c?.account ?? '')
    })
  }, [coachId])

  if (coach === null) return null
  if (!coach) return <Navigate to="/admin" replace />

  const handleSave = async () => {
    try {
      await dataStore.updateCoachAccount(coachId, account.trim(), password.trim() || null)
      setPassword('')
    } catch (_) {}
  }

  const handleDelete = async () => {
    try {
      await dataStore.deleteCoach(coachId)
      setConfirmDelete(false)
      navigate('/admin', { replace: true })
    } catch (_) {}
  }

  return (
    <>
      <Box sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', height: 56, display: 'flex', alignItems: 'center', px: 2 }}>
        <Button sx={{ color: '#0D9488', fontSize: 14, mr: 2 }} onClick={() => navigate('/admin')}>返回</Button>
        <Typography sx={{ fontSize: 18, fontWeight: 600 }}>{coach.name} － 帳號設定</Typography>
      </Box>
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 3, bgcolor: '#F8FAFC' }}>
        <Card sx={{ mb: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Typography sx={{ fontWeight: 600, fontSize: 16, mb: 2 }}>修改帳號／密碼</Typography>
            <TextField fullWidth id="coach-settings-account" label="帳號" value={account} onChange={(e) => setAccount(e.target.value)} inputProps={{ id: 'coach-settings-account' }} InputLabelProps={{ htmlFor: 'coach-settings-account' }} sx={{ mb: 1.5 }} />
            <TextField fullWidth id="coach-settings-password" label="新密碼（留空則不變）" type="password" value={password} onChange={(e) => setPassword(e.target.value)} inputProps={{ id: 'coach-settings-password' }} InputLabelProps={{ htmlFor: 'coach-settings-password' }} sx={{ mb: 2 }} />
            <Button variant="contained" onClick={handleSave} sx={{ minWidth: 100, height: 40 }}>儲存</Button>
          </CardContent>
        </Card>

        <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Typography sx={{ fontWeight: 600, fontSize: 16, mb: 1 }}>刪除教練</Typography>
            <Typography sx={{ fontSize: 14, color: '#64748B', mb: 2 }}>
              刪除將移除教練及所有相關資料，無法復原。
            </Typography>
            <Button variant="outlined" color="error" onClick={() => setConfirmDelete(true)} sx={{ minWidth: 120, height: 40 }}>
              刪除教練
            </Button>
          </CardContent>
        </Card>
      </Box>

      <ConfirmDeleteModal
        open={confirmDelete}
        title="確認刪除教練帳號"
        description={`刪除「${coach.name}」及所有相關資料後無法復原。`}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </>
  )
}
