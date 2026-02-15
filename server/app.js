/**
 * Express 應用（不含 listen），供本機 server/index.js 與 Vercel api/[[...path]].js 使用。
 */
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth.js'
import coachesRoutes from './routes/coaches.js'
import studentsRoutes from './routes/students.js'
import enrollmentsRoutes from './routes/enrollments.js'
import attendancesRoutes from './routes/attendances.js'
import meRoutes from './routes/me.js'
import adminRoutes from './routes/admin.js'

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }))
app.use(cookieParser())
app.use(express.json())

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: '登入嘗試過於頻繁，請稍後再試' },
})
app.use('/api/auth', loginLimiter)
app.use('/api/auth', authRoutes)

app.use('/api/me', meRoutes)
app.use('/api/coaches', coachesRoutes)
app.use('/api/students', studentsRoutes)
app.use('/api/enrollments', enrollmentsRoutes)
app.use('/api/attendances', attendancesRoutes)
app.use('/api/admin', adminRoutes)

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: '伺服器錯誤' })
})

export default app
