import { Router } from 'express'
import * as data from '../data.js'
import { requireAuth, requireRole } from '../auth.js'
import { auditLog } from '../audit.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  const rows = await data.getEnrollments(req.user.role, req.user.id)
  res.json(rows)
})

router.post('/', requireRole('admin'), async (req, res) => {
  const { studentId, coachId, courseName, totalLessons, salaryWhenDone } = req.body || {}
  if (!studentId || !coachId || totalLessons == null) {
    return res.status(400).json({ error: '請提供 studentId, coachId, totalLessons' })
  }
  const student = await data.getStudent(studentId)
  const coach = await data.getCoach(coachId)
  if (!student) return res.status(400).json({ error: '學生不存在' })
  if (!coach) return res.status(400).json({ error: '教練不存在' })
  const id = 'e' + Date.now()
  const total = Number(totalLessons) || 0
  const salary = Number(salaryWhenDone) || 0
  await data.createEnrollment(id, studentId, coachId, (courseName || '課程').trim(), total, total, salary)
  await auditLog(req.user.id, 'admin', 'CREATE', 'enrollment', id, null, { studentId, coachId, totalLessons: total, salaryWhenDone: salary })
  res.status(201).json({ id })
})

export default router
