import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as data from './data.js'

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production'
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d'

export function hashPassword(plain) {
  return bcrypt.hashSync(plain, 10)
}

export function comparePassword(plain, hash) {
  return bcrypt.compareSync(plain, hash)
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

/**
 * 依 account 查詢並驗證密碼，回傳 { id, name, account, role } 或 null。非同步。
 */
export async function authenticate(account, password) {
  if (!account || !password) return null
  const trimmed = String(account).trim()
  if (!trimmed) return null

  const admin = await data.getAdminByAccount(trimmed)
  if (admin && comparePassword(password, admin.password_hash)) {
    return { id: 'admin', name: '管理員', account: admin.account, role: 'admin' }
  }

  const coach = await data.getCoachByAccount(trimmed)
  if (coach && comparePassword(password, coach.password_hash)) {
    return { id: coach.id, name: coach.name, account: coach.account, role: 'coach' }
  }

  const student = await data.getStudentByAccount(trimmed)
  if (student && comparePassword(password, student.password_hash)) {
    return { id: student.id, name: student.name, account: student.account, role: 'student' }
  }

  return null
}

export function requireAuth(req, res, next) {
  const token =
    req.headers.authorization?.replace(/^Bearer\s+/i, '') ||
    req.cookies?.token
  const payload = token ? verifyToken(token) : null
  if (!payload || !payload.id || !payload.role) {
    return res.status(401).json({ error: '未授權' })
  }
  req.user = { id: payload.id, name: payload.name, account: payload.account, role: payload.role }
  next()
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: '未授權' })
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: '權限不足' })
    next()
  }
}
