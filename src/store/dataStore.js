/**
 * 統一資料層：有設定 VITE_API_URL 時走後端 API（§2 持久化、§7 密碼雜湊），否則走 mockStore（僅前端 demo）。
 */

import { api } from '../api/client'
import { mockStore } from './mockStore.js'

function wrap(apiFn, mockFn) {
  if (api.useBackend) return (...args) => apiFn(...args)
  return (...args) => Promise.resolve(mockFn(...args))
}

export const dataStore = {
  get useBackend() {
    return api.useBackend
  },

  auth: api.useBackend ? null : mockStore.auth,

  getEnrollment: wrap(
    async (id) => {
      const list = await api.getEnrollments()
      const row = list.find((e) => e.id === id)
      return row ? toEnrollment(row) : null
    },
    mockStore.getEnrollment
  ),
  getEnrollmentsByStudent: wrap(
    async (studentId) => {
      const list = await api.getEnrollments()
      return list.filter((e) => e.student_id === studentId).map(toEnrollment)
    },
    mockStore.getEnrollmentsByStudent
  ),
  getEnrollmentsByCoach: wrap(
    async (coachId) => {
      const list = await api.getEnrollments()
      return list.filter((e) => e.coach_id === coachId).map(toEnrollment)
    },
    mockStore.getEnrollmentsByCoach
  ),
  getPendingByCoach: wrap(
    async () => {
      const list = await api.getPendingAttendances()
      return list.map(toPending)
    },
    mockStore.getPendingByCoach
  ),
  getPendingByEnrollment: wrap(
    async (enrollmentId) => {
      const list = await api.getPendingAttendances()
      const p = list.find((x) => x.enrollment_id === enrollmentId)
      return p ? toPending(p) : null
    },
    mockStore.getPendingByEnrollment
  ),
  getStudents: wrap(api.getStudents, mockStore.getStudents),
  getCoaches: wrap(api.getCoaches, mockStore.getCoaches),
  getStudent: wrap(
    async (id) => {
      const list = await api.getStudents()
      return list.find((s) => s.id === id) ?? null
    },
    mockStore.getStudent
  ),
  getCoach: wrap(
    async (id) => {
      const list = await api.getCoaches()
      return list.find((c) => c.id === id) ?? null
    },
    mockStore.getCoach
  ),
  requestAttendance: wrap(api.requestAttendance, mockStore.requestAttendance),
  confirmAttendance: wrap(api.confirmAttendance, mockStore.confirmAttendance),
  getAttendanceRecords: wrap(
    async (coachId, startDate, endDate) => {
      const list = await api.getAttendanceRecords(startDate, endDate)
      return list.map(toRecord)
    },
    mockStore.getAttendanceRecords
  ),
  getCoachEarned: wrap(
    async (coachId) => {
      const r = await api.getCoachEarned(coachId)
      return r?.amount ?? 0
    },
    mockStore.getCoachEarned
  ),
  getCompletedSalaryDetails: wrap(
    async (coachId) => {
      const list = await api.getCoachSalaryDetails(coachId)
      return list || []
    },
    mockStore.getCompletedSalaryDetails
  ),
  getCompletedEnrollmentsForCoach: wrap(
    async (coachId) => {
      const list = await api.getCoachCompletedEnrollments(coachId)
      return (list || []).map(toEnrollment)
    },
    mockStore.getCompletedEnrollmentsForCoach
  ),
  createCoach: wrap(
    async (...args) => {
      const r = await api.createCoach(...args)
      return r?.id ?? null
    },
    mockStore.createCoach
  ),
  createStudent: wrap(
    async (...args) => {
      const r = await api.createStudent(...args)
      return r?.id ?? null
    },
    mockStore.createStudent
  ),
  assignStudentToCoach: wrap(
    async (studentId, coachId, courseName, totalLessons, salaryWhenDone) => {
      const r = await api.createEnrollment(studentId, coachId, courseName, totalLessons, salaryWhenDone)
      return r?.id ?? null
    },
    (studentId, coachId, courseName, totalLessons, salaryWhenDone) =>
      mockStore.assignStudentToCoach(studentId, coachId, courseName, totalLessons, salaryWhenDone)
  ),
  resetStudentPassword: wrap(api.resetStudentPassword, mockStore.resetStudentPassword),
  deleteStudent: wrap(api.deleteStudent, mockStore.deleteStudent),
  confirmPayCoach: wrap(
    async (coachId) => {
      const r = await api.confirmPayCoach(coachId)
      return r?.amount ?? 0
    },
    mockStore.confirmPayCoach
  ),
  updateCoachAccount: wrap(
    async (coachId, account, password) => {
      await api.updateCoach(coachId, { account, password })
      return true
    },
    mockStore.updateCoachAccount
  ),
  deleteCoach: wrap(api.deleteCoach, mockStore.deleteCoach),
  updateAdminAccount: wrap(
    async (account, password) => {
      await api.updateAdminAccount(account, password)
      return true
    },
    mockStore.updateAdminAccount
  ),
  updateStudentAccount: wrap(
    async (studentId, account, password) => {
      await api.updateStudent(studentId, { account, password })
      return true
    },
    mockStore.updateStudentAccount
  ),
}

/** 後端回傳的欄位名為 snake_case，轉成前端慣用的 camelCase 以相容原 UI */
function toEnrollment(row) {
  if (!row) return null
  return {
    id: row.id,
    studentId: row.student_id,
    coachId: row.coach_id,
    courseName: row.course_name,
    totalLessons: row.total_lessons,
    remainingLessons: row.remaining_lessons,
    salaryWhenDone: row.salary_when_done,
    studentName: row.student_name,
    coachName: row.coach_name,
    contact: row.contact,
  }
}

function toPending(row) {
  if (!row) return null
  return {
    id: row.id,
    enrollmentId: row.enrollment_id,
    studentId: row.student_id,
    coachId: row.coach_id,
    courseName: row.course_name,
    studentName: row.student_name,
    requestedAt: row.requested_at,
  }
}

function toRecord(row) {
  if (!row) return null
  return {
    id: row.id,
    enrollmentId: row.enrollment_id,
    studentId: row.student_id,
    coachId: row.coach_id,
    studentName: row.student_name,
    courseName: row.course_name,
    confirmedAt: row.confirmed_at,
  }
}

/** 取得後端資料時轉成前端格式；mock 已是 camelCase 不轉 */
export function normalizeEnrollment(row) {
  return dataStore.useBackend ? toEnrollment(row) : row
}
export function normalizePending(row) {
  return dataStore.useBackend ? toPending(row) : row
}
export function normalizeRecord(row) {
  return dataStore.useBackend ? toRecord(row) : row
}
export function normalizeEnrollments(rows) {
  return (rows || []).map((r) => (dataStore.useBackend ? toEnrollment(r) : r))
}
export function normalizePendings(rows) {
  return (rows || []).map((r) => (dataStore.useBackend ? toPending(r) : r))
}
export function normalizeRecords(rows) {
  return (rows || []).map((r) => (dataStore.useBackend ? toRecord(r) : r))
}
