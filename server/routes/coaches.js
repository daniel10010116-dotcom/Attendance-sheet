import { Router } from 'express'
import * as data from '../data.js'
import { requireAuth, requireRole, hashPassword } from '../auth.js'
import { auditLog } from '../audit.js'

const router = Router()
router.use(requireAuth)

router.get('/', requireRole('admin'), async (req, res) => {
  const rows = await data.getCoaches()
  res.json(rows)
})

router.get('/:id/earned', async (req, res) => {
  const { id } = req.params
  if (req.user.role !== 'admin' && (req.user.role !== 'coach' || req.user.id !== id)) return res.status(403).json({ error: '權限不足' })
  const amount = await data.getCoachEarned(id)
  res.json({ amount })
})

router.get('/:id/salary-details', async (req, res) => {
  const { id } = req.params
  if (req.user.role !== 'admin' && (req.user.role !== 'coach' || req.user.id !== id)) return res.status(403).json({ error: '權限不足' })
  const rows = await data.getCoachSalaryDetails(id)
  res.json(rows)
})

router.get('/:id/completed-enrollments', async (req, res) => {
  const { id } = req.params
  if (req.user.role !== 'admin' && (req.user.role !== 'coach' || req.user.id !== id)) return res.status(403).json({ error: '權限不足' })
  const rows = await data.getCoachCompletedEnrollments(id)
  res.json(rows)
})

router.post('/', requireRole('admin'), async (req, res) => {
  const { name, account, password } = req.body || {}
  const trimmedAccount = (account || '').trim()
  if (!name?.trim() || !trimmedAccount || !password) {
    return res.status(400).json({ error: '請填寫名稱、帳號、密碼' })
  }
  const adminRow = await data.getAdminFirst()
  if (adminRow?.account === trimmedAccount) return res.status(400).json({ error: '此帳號已被使用' })
  if (await data.coachExistsByAccount(trimmedAccount)) return res.status(400).json({ error: '此帳號已被使用' })
  if (await data.studentExistsByAccount(trimmedAccount)) return res.status(400).json({ error: '此帳號已被使用' })
  const id = 'c' + Date.now()
  const password_hash = hashPassword(password)
  await data.createCoach(id, name.trim(), trimmedAccount, password_hash)
  await auditLog(req.user.id, req.user.role, 'CREATE', 'coach', id, null, { name: name.trim(), account: trimmedAccount })
  res.status(201).json({ id })
})

router.put('/:id', async (req, res) => {
  const { id } = req.params
  if (req.user.role !== 'admin' && req.user.id !== id) return res.status(403).json({ error: '權限不足' })
  if (req.user.role !== 'admin' && req.user.role !== 'coach') return res.status(403).json({ error: '權限不足' })

  const coach = await data.getCoach(id)
  if (!coach) return res.status(404).json({ error: '教練不存在' })

  const { account, password } = req.body || {}
  const trimmedAccount = (account != null && account !== '') ? String(account).trim() : null

  if (trimmedAccount !== null && trimmedAccount !== coach.account) {
    const adminRow = await data.getAdminFirst()
    if (adminRow?.account === trimmedAccount) return res.status(400).json({ error: '此帳號已被使用' })
    if (await data.coachExistsByAccountExcludingId(trimmedAccount, id)) return res.status(400).json({ error: '此帳號已被使用' })
    if (await data.studentExistsByAccount(trimmedAccount)) return res.status(400).json({ error: '此帳號已被使用' })
    await data.updateCoachAccount(id, trimmedAccount)
    await auditLog(req.user.id, req.user.role, 'UPDATE_ACCOUNT', 'coach', id, { account: coach.account }, { account: trimmedAccount })
  }
  if (password != null && password !== '') {
    await data.updateCoachPassword(id, hashPassword(password))
    await auditLog(req.user.id, req.user.role, 'UPDATE_PASSWORD', 'coach', id, null, null)
  }
  res.json({ ok: true })
})

router.delete('/:id', requireRole('admin'), async (req, res) => {
  const { id } = req.params
  const coach = await data.getCoach(id)
  if (!coach) return res.status(404).json({ error: '教練不存在' })
  const old = { name: coach.name, account: coach.account }
  await data.deleteCoach(id)
  await auditLog(req.user.id, 'admin', 'DELETE', 'coach', id, old, null)
  res.json({ ok: true })
})

export default router
