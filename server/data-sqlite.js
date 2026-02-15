/**
 * 資料層：SQLite 實作（同步包成 Promise 以符合統一 async 介面）
 */
import { db } from './db.js'

function run(fn) {
  return Promise.resolve(fn())
}

export async function getAdminByAccount(account) {
  return run(() => db.prepare('SELECT * FROM admin WHERE account = ?').get(account))
}

export async function getAdminFirst() {
  return run(() => db.prepare('SELECT id, account FROM admin LIMIT 1').get())
}

export async function getCoachByAccount(account) {
  return run(() => db.prepare('SELECT id, name, account, password_hash FROM coaches WHERE account = ?').get(account))
}

export async function getCoach(id) {
  return run(() => db.prepare('SELECT id, name, account FROM coaches WHERE id = ?').get(id))
}

export async function getCoaches() {
  return run(() => db.prepare('SELECT id, name, account, created_at FROM coaches ORDER BY created_at').all())
}

export async function getStudentByAccount(account) {
  return run(() => db.prepare('SELECT id, name, account, password_hash, contact FROM students WHERE account = ?').get(account))
}

export async function getStudent(id) {
  return run(() => db.prepare('SELECT id, name, account, contact FROM students WHERE id = ?').get(id))
}

export async function getStudents() {
  return run(() => db.prepare('SELECT id, name, account, contact, created_at FROM students ORDER BY created_at').all())
}

export async function createCoach(id, name, account, password_hash) {
  return run(() => {
    db.prepare('INSERT INTO coaches (id, name, account, password_hash) VALUES (?, ?, ?, ?)').run(id, name, account, password_hash)
    db.prepare('INSERT INTO coach_earned (coach_id, amount) VALUES (?, 0)').run(id)
  })
}

export async function updateCoachAccount(id, account) {
  return run(() => db.prepare('UPDATE coaches SET account = ? WHERE id = ?').run(account, id))
}

export async function updateCoachPassword(id, password_hash) {
  return run(() => db.prepare('UPDATE coaches SET password_hash = ? WHERE id = ?').run(password_hash, id))
}

export async function deleteCoach(id) {
  return run(() => {
    db.prepare('DELETE FROM coach_earned WHERE coach_id = ?').run(id)
    db.prepare('DELETE FROM completed_salary_details WHERE coach_id = ?').run(id)
    db.prepare('DELETE FROM enrollments WHERE coach_id = ?').run(id)
    db.prepare('DELETE FROM pending_attendances WHERE coach_id = ?').run(id)
    db.prepare('DELETE FROM attendance_records WHERE coach_id = ?').run(id)
    db.prepare('DELETE FROM coaches WHERE id = ?').run(id)
  })
}

export async function getCoachEarned(coachId) {
  const row = await run(() => db.prepare('SELECT amount FROM coach_earned WHERE coach_id = ?').get(coachId))
  return row?.amount ?? 0
}

export async function setCoachEarned(coachId, amount) {
  return run(() => db.prepare('INSERT OR REPLACE INTO coach_earned (coach_id, amount) VALUES (?, ?)').run(coachId, amount))
}

export async function getCoachSalaryDetails(coachId) {
  return run(() => db.prepare('SELECT * FROM completed_salary_details WHERE coach_id = ? ORDER BY completed_at').all(coachId))
}

export async function getCoachCompletedEnrollments(coachId) {
  return run(() =>
    db.prepare(`
      SELECT e.*, s.name as student_name FROM enrollments e
      LEFT JOIN students s ON s.id = e.student_id
      WHERE e.coach_id = ? AND e.remaining_lessons = 0
    `).all(coachId)
  )
}

export async function insertCompletedSalaryDetail(coachId, studentName, courseName, amount) {
  return run(() =>
    db.prepare(`
      INSERT INTO completed_salary_details (coach_id, student_name, course_name, completed_at, amount)
      VALUES (?, ?, ?, datetime('now'), ?)
    `).run(coachId, studentName, courseName, amount)
  )
}

export async function deleteCompletedSalaryDetailsByCoach(coachId) {
  return run(() => db.prepare('DELETE FROM completed_salary_details WHERE coach_id = ?').run(coachId))
}

export async function createStudent(id, name, account, password_hash, contact) {
  return run(() =>
    db.prepare('INSERT INTO students (id, name, account, password_hash, contact) VALUES (?, ?, ?, ?, ?)').run(
      id,
      name,
      account,
      password_hash,
      contact || ''
    )
  )
}

export async function updateStudentAccount(id, account) {
  return run(() => db.prepare('UPDATE students SET account = ? WHERE id = ?').run(account, id))
}

export async function updateStudentPassword(id, password_hash) {
  return run(() => db.prepare('UPDATE students SET password_hash = ? WHERE id = ?').run(password_hash, id))
}

export async function deleteStudent(id) {
  return run(() => {
    db.prepare('DELETE FROM enrollments WHERE student_id = ?').run(id)
    db.prepare('DELETE FROM pending_attendances WHERE student_id = ?').run(id)
    db.prepare('DELETE FROM attendance_records WHERE student_id = ?').run(id)
    db.prepare('DELETE FROM students WHERE id = ?').run(id)
  })
}

export async function getEnrollments(role, userId) {
  if (role === 'admin') {
    return run(() =>
      db.prepare(`
        SELECT e.id, e.student_id, e.coach_id, e.course_name, e.total_lessons, e.remaining_lessons, e.salary_when_done,
               s.name as student_name, c.name as coach_name
        FROM enrollments e
        LEFT JOIN students s ON s.id = e.student_id
        LEFT JOIN coaches c ON c.id = e.coach_id
        ORDER BY e.created_at
      `).all()
    )
  }
  if (role === 'coach') {
    return run(() =>
      db.prepare(`
        SELECT e.id, e.student_id, e.coach_id, e.course_name, e.total_lessons, e.remaining_lessons, e.salary_when_done,
               s.name as student_name, s.contact
        FROM enrollments e
        LEFT JOIN students s ON s.id = e.student_id
        WHERE e.coach_id = ? AND s.id IS NOT NULL
        ORDER BY e.created_at
      `).all(userId)
    )
  }
  return run(() =>
    db.prepare(`
      SELECT e.id, e.student_id, e.coach_id, e.course_name, e.total_lessons, e.remaining_lessons, e.salary_when_done,
             c.name as coach_name
      FROM enrollments e
      LEFT JOIN coaches c ON c.id = e.coach_id
      WHERE e.student_id = ? AND c.id IS NOT NULL
      ORDER BY e.created_at
    `).all(userId)
  )
}

export async function createEnrollment(id, studentId, coachId, courseName, totalLessons, remainingLessons, salaryWhenDone) {
  return run(() =>
    db.prepare(`
      INSERT INTO enrollments (id, student_id, coach_id, course_name, total_lessons, remaining_lessons, salary_when_done)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, studentId, coachId, courseName, totalLessons, remainingLessons, salaryWhenDone)
  )
}

export async function getEnrollment(id) {
  return run(() => db.prepare('SELECT * FROM enrollments WHERE id = ?').get(id))
}

export async function updateEnrollmentRemaining(id, remaining) {
  return run(() => db.prepare('UPDATE enrollments SET remaining_lessons = ? WHERE id = ?').run(remaining, id))
}

export async function deleteEnrollmentsWhereCoachAndRemainingZero(coachId) {
  return run(() => db.prepare('DELETE FROM enrollments WHERE coach_id = ? AND remaining_lessons = 0').run(coachId))
}

export async function getPendingByCoach(coachId) {
  return run(() => db.prepare('SELECT * FROM pending_attendances WHERE coach_id = ? ORDER BY requested_at').all(coachId))
}

export async function getPendingById(id) {
  return run(() => db.prepare('SELECT * FROM pending_attendances WHERE id = ?').get(id))
}

export async function createPending(id, enrollmentId, studentId, coachId, courseName, studentName) {
  return run(() =>
    db.prepare(`
      INSERT INTO pending_attendances (id, enrollment_id, student_id, coach_id, course_name, student_name, requested_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(id, enrollmentId, studentId, coachId, courseName, studentName)
  )
}

export async function deletePending(id) {
  return run(() => db.prepare('DELETE FROM pending_attendances WHERE id = ?').run(id))
}

export async function createAttendanceRecord(id, enrollmentId, studentId, coachId, studentName, courseName) {
  return run(() =>
    db.prepare(`
      INSERT INTO attendance_records (id, enrollment_id, student_id, coach_id, student_name, course_name, confirmed_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(id, enrollmentId, studentId, coachId, studentName, courseName)
  )
}

export async function getAttendanceRecords(coachId, startDate, endDate) {
  let rows = await run(() => db.prepare('SELECT * FROM attendance_records WHERE coach_id = ? ORDER BY confirmed_at').all(coachId))
  if (startDate) {
    const s = String(startDate).slice(0, 10)
    rows = rows.filter((r) => r.confirmed_at.slice(0, 10) >= s)
  }
  if (endDate) {
    const e = String(endDate).slice(0, 10)
    rows = rows.filter((r) => r.confirmed_at.slice(0, 10) <= e)
  }
  return rows
}

export async function auditLog(actorId, actorRole, action, entityType, entityId, oldValue, newValue) {
  return run(() => {
    try {
      db.prepare(
        `INSERT INTO audit_log (actor_id, actor_role, action, entity_type, entity_id, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(
        actorId,
        actorRole,
        action,
        entityType,
        entityId,
        oldValue != null ? JSON.stringify(oldValue) : null,
        newValue != null ? JSON.stringify(newValue) : null
      )
    } catch (e) {
      console.error('audit log error', e)
    }
  })
}

export async function updateAdminAccount(adminId, account) {
  return run(() => db.prepare('UPDATE admin SET account = ? WHERE id = ?').run(account, adminId))
}

export async function updateAdminPassword(adminId, password_hash) {
  return run(() => db.prepare('UPDATE admin SET password_hash = ? WHERE id = ?').run(password_hash, adminId))
}

export async function coachExistsByAccount(account) {
  const row = await run(() => db.prepare('SELECT id FROM coaches WHERE account = ?').get(account))
  return !!row
}

export async function studentExistsByAccount(account) {
  const row = await run(() => db.prepare('SELECT id FROM students WHERE account = ?').get(account))
  return !!row
}

export async function coachExistsByAccountExcludingId(account, excludeId) {
  const row = await run(() => db.prepare('SELECT id FROM coaches WHERE id != ? AND account = ?').get(excludeId, account))
  return !!row
}

export async function studentExistsByAccountExcludingId(account, excludeId) {
  const row = await run(() => db.prepare('SELECT id FROM students WHERE id != ? AND account = ?').get(excludeId, account))
  return !!row
}

export async function getStudentName(id) {
  const row = await run(() => db.prepare('SELECT name FROM students WHERE id = ?').get(id))
  return row?.name ?? ''
}

export async function pendingExistsByEnrollment(enrollmentId) {
  const row = await run(() => db.prepare('SELECT id FROM pending_attendances WHERE enrollment_id = ?').get(enrollmentId))
  return !!row
}
