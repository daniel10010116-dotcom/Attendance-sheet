import { Router } from 'express'
import { authenticate, signToken } from '../auth.js'
import { auditLog } from '../audit.js'

const router = Router()

router.post('/login', async (req, res) => {
  const { account, password } = req.body || {}
  const user = await authenticate(account, password)
  if (!user) {
    return res.status(401).json({ error: '帳號或密碼錯誤' })
  }
  const token = signToken({
    id: user.id,
    name: user.name,
    account: user.account,
    role: user.role,
  })
  await auditLog(user.id, user.role, 'LOGIN', 'auth', null, null, { account: user.account })
  res.json({
    token,
    user: { id: user.id, name: user.name, account: user.account, role: user.role },
  })
})

export default router
