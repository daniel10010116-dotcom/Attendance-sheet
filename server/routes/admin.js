import { Router } from 'express'
import * as data from '../data.js'
import { requireAuth, requireRole, hashPassword } from '../auth.js'
import { auditLog } from '../audit.js'

const router = Router()
router.use(requireAuth)
router.use(requireRole('admin'))

router.put('/account', async (req, res) => {
  const { account, password } = req.body || {}
  const trimmedAccount = (account || '').trim()
  if (!trimmedAccount) return res.status(400).json({ error: '請填寫帳號' })
  const existing = await data.getAdminFirst()
  if (!existing) return res.status(500).json({ error: '無管理員資料' })
  if (await data.coachExistsByAccount(trimmedAccount)) return res.status(400).json({ error: '此帳號已被使用' })
  if (await data.studentExistsByAccount(trimmedAccount)) return res.status(400).json({ error: '此帳號已被使用' })
  const oldAccount = existing.account
  await data.updateAdminAccount(existing.id, trimmedAccount)
  if (password != null && password !== '') {
    await data.updateAdminPassword(existing.id, hashPassword(password))
  }
  await auditLog(req.user.id, 'admin', 'UPDATE_ACCOUNT', 'admin', existing.id, { account: oldAccount }, { account: trimmedAccount })
  res.json({ ok: true, account: trimmedAccount })
})

router.post('/coaches/:id/confirm-pay', async (req, res) => {
  const { id: coachId } = req.params
  const coach = await data.getCoach(coachId)
  if (!coach) return res.status(404).json({ error: '教練不存在' })
  const amount = await data.getCoachEarned(coachId)
  await auditLog(req.user.id, 'admin', 'CONFIRM_PAY', 'coach', coachId, { amount }, null)
  await data.setCoachEarned(coachId, 0)
  await data.deleteCompletedSalaryDetailsByCoach(coachId)
  await data.deleteEnrollmentsWhereCoachAndRemainingZero(coachId)
  res.json({ ok: true, amount })
})

export default router
