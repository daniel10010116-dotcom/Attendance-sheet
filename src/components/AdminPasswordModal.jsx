import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { dataStore } from '../store/dataStore'
import { useAuth } from '../contexts/AuthContext'

export default function AdminPasswordModal({ open, onClose }) {
  const { user, updateCurrentUser } = useAuth()
  const [account, setAccount] = useState(user?.account ?? '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (open) {
      setAccount(user?.account ?? '')
      setPassword('')
      setConfirmPassword('')
      setError('')
      setSuccess('')
    }
  }, [open, user?.account])

  const handleSubmit = async () => {
    setError('')
    setSuccess('')
    if (!account.trim()) {
      setError('請輸入帳號')
      return
    }
    if (password !== confirmPassword) {
      setError('兩次密碼輸入不一致')
      return
    }
    try {
      let ok = false
      if (user?.role === 'admin') {
        ok = await dataStore.updateAdminAccount(account.trim(), password || null)
      } else if (user?.role === 'coach') {
        ok = await dataStore.updateCoachAccount(user.id, account.trim(), password || null)
      } else if (user?.role === 'student') {
        ok = await dataStore.updateStudentAccount(user.id, account.trim(), password || null)
      }
      if (ok) {
        updateCurrentUser({ account: account.trim() })
        setSuccess('已更新，下次登入請使用新帳密')
        setPassword('')
        setConfirmPassword('')
        setTimeout(() => {
          onClose()
          setSuccess('')
        }, 1500)
      } else {
        setError(user?.role === 'admin' ? '更新失敗' : '此帳號已被使用或更新失敗')
      }
    } catch {
      setError(user?.role === 'admin' ? '更新失敗' : '此帳號已被使用或更新失敗')
    }
  }

  const handleClose = () => {
    setAccount(user?.account ?? '')
    setPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: 400,
          bgcolor: '#FFFFFF',
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
        }}
      >
        <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#0F172A', mb: 2 }}>
          更改帳號密碼
        </Typography>
        <TextField
          fullWidth
          id="admin-self-account"
          label="帳號"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          inputProps={{ id: 'admin-self-account' }}
          InputLabelProps={{ htmlFor: 'admin-self-account' }}
          sx={{ mb: 1.5 }}
        />
        <TextField
          fullWidth
          id="admin-self-password"
          label="新密碼（留空則不變）"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          inputProps={{ id: 'admin-self-password' }}
          InputLabelProps={{ htmlFor: 'admin-self-password' }}
          sx={{ mb: 1.5 }}
        />
        <TextField
          fullWidth
          id="admin-self-confirm"
          label="確認密碼"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          inputProps={{ id: 'admin-self-confirm' }}
          InputLabelProps={{ htmlFor: 'admin-self-confirm' }}
          sx={{ mb: 2 }}
        />
        {error && <Typography color="error" sx={{ fontSize: 14, mb: 1 }}>{error}</Typography>}
        {success && <Typography sx={{ color: '#0D9488', fontSize: 14, mb: 1 }}>{success}</Typography>}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
          <Button onClick={handleClose} sx={{ color: '#64748B' }}>取消</Button>
          <Button variant="contained" onClick={handleSubmit}>儲存</Button>
        </Box>
      </Box>
    </Modal>
  )
}
