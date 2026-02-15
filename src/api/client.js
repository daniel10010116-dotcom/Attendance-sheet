/**
 * 後端 API 客戶端。所有請求帶上 JWT（若已登入）。
 * 使用環境變數 VITE_API_URL（例：http://localhost:3001），未設定時前端仍用 mockStore。
 */

const BASE = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : ''

function getToken() {
  try {
    return sessionStorage.getItem('attendance_token') || ''
  } catch {
    return ''
  }
}

function getHeaders(useJson = true) {
  const h = {}
  const token = getToken()
  if (token) h.Authorization = `Bearer ${token}`
  if (useJson) h['Content-Type'] = 'application/json'
  return h
}

async function request(method, path, body = null) {
  const url = BASE ? `${BASE}${path}` : null
  if (!url) return { ok: false, useMock: true }
  const opt = { method, headers: getHeaders() }
  if (body != null) opt.body = JSON.stringify(body)
  const res = await fetch(url, opt)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || res.statusText)
  return data
}

export const api = {
  get base() {
    return BASE
  },
  get useBackend() {
    return !!BASE
  },
  setToken(token) {
    try {
      if (token) sessionStorage.setItem('attendance_token', token)
      else sessionStorage.removeItem('attendance_token')
    } catch (_) {}
  },
  getToken,

  async login(account, password) {
    return request('POST', '/api/auth/login', { account, password })
  },

  async getMe() {
    return request('GET', '/api/me')
  },

  async getCoaches() {
    return request('GET', '/api/coaches')
  },
  async createCoach(name, account, password) {
    return request('POST', '/api/coaches', { name, account, password })
  },
  async updateCoach(id, account, password) {
    return request('PUT', `/api/coaches/${id}`, { account, password })
  },
  async deleteCoach(id) {
    return request('DELETE', `/api/coaches/${id}`)
  },
  async getCoachEarned(coachId) {
    return request('GET', `/api/coaches/${coachId}/earned`)
  },
  async getCoachSalaryDetails(coachId) {
    return request('GET', `/api/coaches/${coachId}/salary-details`)
  },
  async getCoachCompletedEnrollments(coachId) {
    return request('GET', `/api/coaches/${coachId}/completed-enrollments`)
  },

  async getStudents() {
    return request('GET', '/api/students')
  },
  async createStudent(name, account, password, contact = '') {
    return request('POST', '/api/students', { name, account, password, contact })
  },
  async updateStudent(id, account, password) {
    return request('PUT', `/api/students/${id}`, { account, password })
  },
  async resetStudentPassword(id, newPassword) {
    return request('POST', `/api/students/${id}/reset-password`, { newPassword })
  },
  async deleteStudent(id) {
    return request('DELETE', `/api/students/${id}`)
  },

  async getEnrollments() {
    return request('GET', '/api/enrollments')
  },
  async createEnrollment(studentId, coachId, courseName, totalLessons, salaryWhenDone) {
    return request('POST', '/api/enrollments', { studentId, coachId, courseName, totalLessons, salaryWhenDone })
  },

  async getPendingAttendances() {
    return request('GET', '/api/attendances/pending')
  },
  async requestAttendance(enrollmentId) {
    return request('POST', '/api/attendances/request', { enrollmentId })
  },
  async confirmAttendance(pendingId) {
    return request('POST', `/api/attendances/confirm/${pendingId}`)
  },
  async getAttendanceRecords(startDate, endDate) {
    const q = new URLSearchParams()
    if (startDate) q.set('startDate', startDate)
    if (endDate) q.set('endDate', endDate)
    const suffix = q.toString() ? `?${q}` : ''
    return request('GET', `/api/attendances/records${suffix}`)
  },

  async getMeEarned() {
    return request('GET', '/api/me/earned')
  },
  async getMeSalaryDetails() {
    return request('GET', '/api/me/salary-details')
  },
  async getMeCompletedEnrollments() {
    return request('GET', '/api/me/completed-enrollments')
  },

  async updateAdminAccount(account, password) {
    return request('PUT', '/api/admin/account', { account, password })
  },
  async confirmPayCoach(coachId) {
    return request('POST', `/api/admin/coaches/${coachId}/confirm-pay`)
  },
}
