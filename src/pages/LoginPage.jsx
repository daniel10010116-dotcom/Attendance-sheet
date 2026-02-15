import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useAuth } from '../contexts/AuthContext'

function getRolePath(role) {
  return role === 'student' ? '/student' : role === 'coach' ? '/coach' : '/admin'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { user, login } = useAuth()
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (user) return <Navigate to={getRolePath(user.role)} replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const result = await login(account.trim(), password)
    if (result?.ok) {
      navigate(getRolePath(result.role), { replace: true })
    } else {
      setError(result?.error || '帳號或密碼錯誤')
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F8FAFC',
        pt: '80px',
        px: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Typography component="h1" sx={{ fontSize: 24, fontWeight: 700, color: '#0F172A', mb: 3, textAlign: 'center' }}>
        游泳課點名系統
      </Typography>
      <Card sx={{ maxWidth: 400, width: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              id="login-account"
              label="帳號"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              sx={{ mb: 2 }}
              inputProps={{ id: 'login-account', style: { height: 44, padding: '0 12px' } }}
              InputLabelProps={{ htmlFor: 'login-account', sx: { fontSize: 14 } }}
            />
            <TextField
              fullWidth
              id="login-password"
              label="密碼"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              inputProps={{ id: 'login-password', style: { height: 44, padding: '0 12px' } }}
              InputLabelProps={{ htmlFor: 'login-password', sx: { fontSize: 14 } }}
            />
            {error && (
              <Box
                sx={{
                  bgcolor: '#FEF2F2',
                  color: '#DC2626',
                  border: '1px solid #FECACA',
                  borderRadius: 1,
                  p: 1.5,
                  mb: 2,
                  fontSize: 14,
                }}
              >
                {error}
              </Box>
            )}
            <Button type="submit" fullWidth variant="contained" sx={{ height: 44, fontWeight: 600 }}>
              登入
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}
