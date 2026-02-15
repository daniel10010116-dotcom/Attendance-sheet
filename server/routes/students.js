import { Router } from 'express'
import * as data from '../data.js'
import { requireAuth, requireRole, hashPassword } from '../auth.js'
import { auditLog } from '../audit.js'

const router = Router()
router.use(requireAuth)

router.get('/', requireRole('admin'), async (req, res) => {
  const rows = await data.getStudents()
  res.json(rows)
})

router.post('/', requireRole('admin'), async (req, res) => {
  const { name, account, password, contact } = req.body || {}
  const trimmedAccount = (account || '').trim()
  if (!name?.trim() || !trimmedAccount || !password) {
    return res.status(400).json({ error: '請填寫名稱、帳號、密碼' })
  }
  const adminRow = await data.getAdminFirst()
  if (adminRow?.account === trimmedAccount) return res.status(400).json({ error: '此帳號已被使用' })
  if (await data.coachExistsByAccount(trimmedAccount)) return res.status(400).json({ error: '此帳號已被使用' })
  if (await data.studentExistsByAccount(trimmedAccount)) return res.status(400).json({ error: '此帳號已被使用' })
  const id = 's' + Date.now()
  const password_hash = hashPassword(password)
  await data.createStudent(id, name.trim(), trimmedAccount, password_hash, (contact || '').trim())
  await auditLog(req.user.id, req.user.role, 'CREATE', 'student', id, null, { name: name.trim(), account: trimmedAccount })
  res.status(201).json({ id })
})

router.put('/:id', async (req, res) => {
  const { id } = req.params
  if (req.user.role !== 'admin' && req.user.id !== id) return res.status(403).json({ error: '權限不足' })

  const student = await data.getStudent(id)
  if (!student) return res.status(404).json({ error: '學生不存在' })

  const { account, password } = req.body || {}
  const trimmedAccount = (account != null && account !== '') ? String(account).trim() : null

  if (trimmedAccount !== null && trimmedAccount !== student.account) {
    const adminRow = await data.getAdminFirst()
    if (adminRow?.account === trimmedAccount) return res.status(400).json({ error: '此帳號已被使用' })
    if (await data.studentExistsByAccountExcludingId(trimmedAccount, id)) return res.status(400).json({ error: '此帳號已被使用' })
    if (await data.coachExistsByAccount(trimmedAccount)) return res.status(400).json({ error: '此帳號已被使用' })
    await data.updateStudentAccount(id, trimmedAccount)
    await auditLog(req.user.id, req.user.role, 'UPDATE_ACCOUNT', 'student', id, { account: student.account }, { account: trimmedAccount })
  }
  if (password != null && password !== '') {
    await data.updateStudentPassword(id, hashPassword(password))
    await auditLog(req.user.id, req.user.role, 'UPDATE_PASSWORD', 'student', id, null, null)
  }
  res.json({ ok: true })
})

router.post('/:id/reset-password', requireRole('admin'), async (req, res) => {
  const { id } = req.params
  const { newPassword } = req.body || {}
  if (!newPassword?.trim()) return res.status(400).json({ error: '請提供新密碼' })
  const student = await data.getStudent(id)
  if (!student) return res.status(404).json({ error: '學生不存在' })
  await data.updateStudentPassword(id, hashPassword(newPassword.trim()))
  await auditLog(req.user.id, 'admin', 'RESET_PASSWORD', 'student', id, null, null)
  res.json({ ok: true })
})

router.delete('/:id', requireRole('admin'), async (req, res) => {
  const { id } = req.params
  const student = await data.getStudent(id)
  if (!student) return res.status(404).json({ error: '學生不存在' })
  const old = { name: student.name, account: student.account }
  await data.deleteStudent(id)
  await auditLog(req.user.id, 'admin', 'DELETE', 'student', id, old, null)
  res.json({ ok: true })
})

export default router
