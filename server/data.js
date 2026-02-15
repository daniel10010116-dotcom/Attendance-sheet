/**
 * 統一資料層：依 SUPABASE_URL 切換 SQLite 或 Supabase。
 * 未設定 SUPABASE_URL 時使用 SQLite（本機）；設定則使用 Supabase（Vercel 或本機測試）。
 */
let _data = null

async function getData() {
  if (!_data) {
    _data = process.env.SUPABASE_URL
      ? await import('./data-supabase.js')
      : await import('./data-sqlite.js')
  }
  return _data
}

export async function getAdminByAccount(account) {
  return (await getData()).getAdminByAccount(account)
}
export async function getAdminFirst() {
  return (await getData()).getAdminFirst()
}
export async function getCoachByAccount(account) {
  return (await getData()).getCoachByAccount(account)
}
export async function getCoach(id) {
  return (await getData()).getCoach(id)
}
export async function getCoaches() {
  return (await getData()).getCoaches()
}
export async function getStudentByAccount(account) {
  return (await getData()).getStudentByAccount(account)
}
export async function getStudent(id) {
  return (await getData()).getStudent(id)
}
export async function getStudents() {
  return (await getData()).getStudents()
}
export async function createCoach(id, name, account, password_hash) {
  return (await getData()).createCoach(id, name, account, password_hash)
}
export async function updateCoachAccount(id, account) {
  return (await getData()).updateCoachAccount(id, account)
}
export async function updateCoachPassword(id, password_hash) {
  return (await getData()).updateCoachPassword(id, password_hash)
}
export async function deleteCoach(id) {
  return (await getData()).deleteCoach(id)
}
export async function getCoachEarned(coachId) {
  return (await getData()).getCoachEarned(coachId)
}
export async function setCoachEarned(coachId, amount) {
  return (await getData()).setCoachEarned(coachId, amount)
}
export async function getCoachSalaryDetails(coachId) {
  return (await getData()).getCoachSalaryDetails(coachId)
}
export async function getCoachCompletedEnrollments(coachId) {
  return (await getData()).getCoachCompletedEnrollments(coachId)
}
export async function insertCompletedSalaryDetail(coachId, studentName, courseName, amount) {
  return (await getData()).insertCompletedSalaryDetail(coachId, studentName, courseName, amount)
}
export async function deleteCompletedSalaryDetailsByCoach(coachId) {
  return (await getData()).deleteCompletedSalaryDetailsByCoach(coachId)
}
export async function createStudent(id, name, account, password_hash, contact) {
  return (await getData()).createStudent(id, name, account, password_hash, contact)
}
export async function updateStudentAccount(id, account) {
  return (await getData()).updateStudentAccount(id, account)
}
export async function updateStudentPassword(id, password_hash) {
  return (await getData()).updateStudentPassword(id, password_hash)
}
export async function deleteStudent(id) {
  return (await getData()).deleteStudent(id)
}
export async function getEnrollments(role, userId) {
  return (await getData()).getEnrollments(role, userId)
}
export async function createEnrollment(id, studentId, coachId, courseName, totalLessons, remainingLessons, salaryWhenDone) {
  return (await getData()).createEnrollment(id, studentId, coachId, courseName, totalLessons, remainingLessons, salaryWhenDone)
}
export async function getEnrollment(id) {
  return (await getData()).getEnrollment(id)
}
export async function updateEnrollmentRemaining(id, remaining) {
  return (await getData()).updateEnrollmentRemaining(id, remaining)
}
export async function deleteEnrollmentsWhereCoachAndRemainingZero(coachId) {
  return (await getData()).deleteEnrollmentsWhereCoachAndRemainingZero(coachId)
}
export async function getPendingByCoach(coachId) {
  return (await getData()).getPendingByCoach(coachId)
}
export async function getPendingById(id) {
  return (await getData()).getPendingById(id)
}
export async function createPending(id, enrollmentId, studentId, coachId, courseName, studentName) {
  return (await getData()).createPending(id, enrollmentId, studentId, coachId, courseName, studentName)
}
export async function deletePending(id) {
  return (await getData()).deletePending(id)
}
export async function createAttendanceRecord(id, enrollmentId, studentId, coachId, studentName, courseName) {
  return (await getData()).createAttendanceRecord(id, enrollmentId, studentId, coachId, studentName, courseName)
}
export async function getAttendanceRecords(coachId, startDate, endDate) {
  return (await getData()).getAttendanceRecords(coachId, startDate, endDate)
}
export async function auditLog(actorId, actorRole, action, entityType, entityId, oldValue, newValue) {
  return (await getData()).auditLog(actorId, actorRole, action, entityType, entityId, oldValue, newValue)
}
export async function updateAdminAccount(adminId, account) {
  return (await getData()).updateAdminAccount(adminId, account)
}
export async function updateAdminPassword(adminId, password_hash) {
  return (await getData()).updateAdminPassword(adminId, password_hash)
}
export async function coachExistsByAccount(account) {
  return (await getData()).coachExistsByAccount(account)
}
export async function studentExistsByAccount(account) {
  return (await getData()).studentExistsByAccount(account)
}
export async function coachExistsByAccountExcludingId(account, excludeId) {
  return (await getData()).coachExistsByAccountExcludingId(account, excludeId)
}
export async function studentExistsByAccountExcludingId(account, excludeId) {
  return (await getData()).studentExistsByAccountExcludingId(account, excludeId)
}
export async function getStudentName(id) {
  return (await getData()).getStudentName(id)
}
export async function pendingExistsByEnrollment(enrollmentId) {
  return (await getData()).pendingExistsByEnrollment(enrollmentId)
}
