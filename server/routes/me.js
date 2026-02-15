import { Router } from 'express'
import * as data from '../data.js'
import { requireAuth, requireRole } from '../auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', (req, res) => {
  res.json(req.user)
})

router.get('/earned', requireRole('coach'), async (req, res) => {
  const amount = await data.getCoachEarned(req.user.id)
  res.json({ amount })
})

router.get('/salary-details', requireRole('coach'), async (req, res) => {
  const rows = await data.getCoachSalaryDetails(req.user.id)
  res.json(rows)
})

router.get('/completed-enrollments', requireRole('coach'), async (req, res) => {
  const rows = await data.getCoachCompletedEnrollments(req.user.id)
  res.json(rows)
})

export default router
