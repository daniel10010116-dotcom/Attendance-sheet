import { Router } from 'express'
import * as data from '../data.js'
import { requireAuth, requireRole } from '../auth.js'
import { auditLog } from '../audit.js'

const router = Router()
router.use(requireAuth)

router.get('/pending', requireRole('coach'), async (req, res) => {
  const rows = await data.getPendingByCoach(req.user.id)
  res.json(rows)
})

router.post('/request', requireRole('student'), async (req, res) => {
  const { enrollmentId } = req.body || {}
  const enr = await data.getEnrollment(enrollmentId)
  if (!enr || enr.remaining_lessons <= 0) return res.status(400).json({ error: '無法點名', ok: false })
  if (enr.student_id !== req.user.id) return res.status(403).json({ error: '權限不足', ok: false })
  if (await data.pendingExistsByEnrollment(enrollmentId)) return res.status(400).json({ error: '已有待確認點名', ok: false })
  const studentName = await data.getStudentName(req.user.id)
  const id = 'pa' + Date.now()
  await data.createPending(id, enrollmentId, enr.student_id, enr.coach_id, enr.course_name, studentName)
  res.status(201).json({ ok: true })
})

router.post('/confirm/:pendingId', requireRole('coach'), async (req, res) => {
  const { pendingId } = req.params
  const p = await data.getPendingById(pendingId)
  if (!p) return res.status(404).json({ error: '待確認點名不存在', ok: false })
  if (p.coach_id !== req.user.id) return res.status(403).json({ error: '權限不足', ok: false })
  const enr = await data.getEnrollment(p.enrollment_id)
  if (!enr || enr.remaining_lessons <= 0) {
    await data.deletePending(pendingId)
    return res.status(400).json({ error: '課程已無剩餘堂數', ok: false })
  }
  const newRemaining = enr.remaining_lessons - 1
  await data.updateEnrollmentRemaining(enr.id, newRemaining)
  if (newRemaining === 0) {
    const current = await data.getCoachEarned(req.user.id)
    await data.setCoachEarned(req.user.id, current + (enr.salary_when_done ?? 0))
    await data.insertCompletedSalaryDetail(req.user.id, p.student_name, p.course_name, enr.salary_when_done ?? 0)
  }
  const arId = 'ar' + Date.now()
  await data.createAttendanceRecord(arId, p.enrollment_id, p.student_id, p.coach_id, p.student_name, p.course_name)
  await data.deletePending(pendingId)
  await auditLog(req.user.id, 'coach', 'CONFIRM_ATTENDANCE', 'attendance', arId, null, { enrollmentId: p.enrollment_id, studentName: p.student_name })
  res.json({ ok: true })
})

router.get('/records', requireRole('coach'), async (req, res) => {
  const { startDate, endDate } = req.query
  const rows = await data.getAttendanceRecords(req.user.id, startDate, endDate)
  res.json(rows)
})

export default router
