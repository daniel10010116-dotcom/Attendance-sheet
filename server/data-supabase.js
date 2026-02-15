/**
 * 資料層：Supabase (PostgreSQL) 實作
 */
import { supabase } from './lib/supabase.js'

if (!supabase) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required for data-supabase')

export async function getAdminByAccount(account) {
  const { data, error } = await supabase.from('admin').select('*').eq('account', account).maybeSingle()
  if (error) throw error
  return data
}

export async function getAdminFirst() {
  const { data, error } = await supabase.from('admin').select('id, account').limit(1).maybeSingle()
  if (error) throw error
  return data
}

export async function getCoachByAccount(account) {
  const { data, error } = await supabase.from('coaches').select('id, name, account, password_hash').eq('account', account).maybeSingle()
  if (error) throw error
  return data
}

export async function getCoach(id) {
  const { data, error } = await supabase.from('coaches').select('id, name, account').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function getCoaches() {
  const { data, error } = await supabase.from('coaches').select('id, name, account, created_at').order('created_at')
  if (error) throw error
  return data || []
}

export async function getStudentByAccount(account) {
  const { data, error } = await supabase.from('students').select('id, name, account, password_hash, contact').eq('account', account).maybeSingle()
  if (error) throw error
  return data
}

export async function getStudent(id) {
  const { data, error } = await supabase.from('students').select('id, name, account, contact').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function getStudents() {
  const { data, error } = await supabase.from('students').select('id, name, account, contact, created_at').order('created_at')
  if (error) throw error
  return data || []
}

export async function createCoach(id, name, account, password_hash) {
  const { error: e1 } = await supabase.from('coaches').insert({ id, name, account, password_hash })
  if (e1) throw e1
  const { error: e2 } = await supabase.from('coach_earned').upsert({ coach_id: id, amount: 0 }, { onConflict: 'coach_id' })
  if (e2) throw e2
}

export async function updateCoachAccount(id, account) {
  const { error } = await supabase.from('coaches').update({ account }).eq('id', id)
  if (error) throw error
}

export async function updateCoachPassword(id, password_hash) {
  const { error } = await supabase.from('coaches').update({ password_hash }).eq('id', id)
  if (error) throw error
}

export async function deleteCoach(id) {
  await supabase.from('coach_earned').delete().eq('coach_id', id)
  await supabase.from('completed_salary_details').delete().eq('coach_id', id)
  await supabase.from('enrollments').delete().eq('coach_id', id)
  await supabase.from('pending_attendances').delete().eq('coach_id', id)
  await supabase.from('attendance_records').delete().eq('coach_id', id)
  const { error } = await supabase.from('coaches').delete().eq('id', id)
  if (error) throw error
}

export async function getCoachEarned(coachId) {
  const { data, error } = await supabase.from('coach_earned').select('amount').eq('coach_id', coachId).maybeSingle()
  if (error) throw error
  return data?.amount ?? 0
}

export async function setCoachEarned(coachId, amount) {
  const { error } = await supabase.from('coach_earned').upsert({ coach_id: coachId, amount }, { onConflict: 'coach_id' })
  if (error) throw error
}

export async function getCoachSalaryDetails(coachId) {
  const { data, error } = await supabase.from('completed_salary_details').select('*').eq('coach_id', coachId).order('completed_at')
  if (error) throw error
  return data || []
}

export async function getCoachCompletedEnrollments(coachId) {
  const { data: enrollments, error: e1 } = await supabase.from('enrollments').select('*').eq('coach_id', coachId).eq('remaining_lessons', 0)
  if (e1) throw e1
  if (!enrollments?.length) return []
  const studentIds = [...new Set(enrollments.map((e) => e.student_id))]
  const { data: students } = await supabase.from('students').select('id, name').in('id', studentIds)
  const map = Object.fromEntries((students || []).map((s) => [s.id, s.name]))
  return enrollments.map((e) => ({ ...e, student_name: map[e.student_id] ?? '' }))
}

export async function insertCompletedSalaryDetail(coachId, studentName, courseName, amount) {
  const { error } = await supabase.from('completed_salary_details').insert({
    coach_id: coachId,
    student_name: studentName,
    course_name: courseName,
    completed_at: new Date().toISOString(),
    amount,
  })
  if (error) throw error
}

export async function deleteCompletedSalaryDetailsByCoach(coachId) {
  await supabase.from('completed_salary_details').delete().eq('coach_id', coachId)
}

export async function createStudent(id, name, account, password_hash, contact) {
  const { error } = await supabase.from('students').insert({ id, name, account, password_hash, contact: contact || '' })
  if (error) throw error
}

export async function updateStudentAccount(id, account) {
  const { error } = await supabase.from('students').update({ account }).eq('id', id)
  if (error) throw error
}

export async function updateStudentPassword(id, password_hash) {
  const { error } = await supabase.from('students').update({ password_hash }).eq('id', id)
  if (error) throw error
}

export async function deleteStudent(id) {
  await supabase.from('enrollments').delete().eq('student_id', id)
  await supabase.from('pending_attendances').delete().eq('student_id', id)
  await supabase.from('attendance_records').delete().eq('student_id', id)
  const { error } = await supabase.from('students').delete().eq('id', id)
  if (error) throw error
}

export async function getEnrollments(role, userId) {
  if (role === 'admin') {
    const { data: enrollments, error } = await supabase.from('enrollments').select('*').order('created_at')
    if (error) throw error
    const e = enrollments || []
    const studentIds = [...new Set(e.map((x) => x.student_id))]
    const coachIds = [...new Set(e.map((x) => x.coach_id))]
    const [studentsRes, coachesRes] = await Promise.all([
      supabase.from('students').select('id, name').in('id', studentIds),
      supabase.from('coaches').select('id, name').in('id', coachIds),
    ])
    const sMap = Object.fromEntries((studentsRes.data || []).map((s) => [s.id, s.name]))
    const cMap = Object.fromEntries((coachesRes.data || []).map((c) => [c.id, c.name]))
    return e.map((x) => ({ ...x, student_name: sMap[x.student_id], coach_name: cMap[x.coach_id] }))
  }
  if (role === 'coach') {
    const { data: enrollments, error } = await supabase.from('enrollments').select('*').eq('coach_id', userId).order('created_at')
    if (error) throw error
    const e = enrollments || []
    const studentIds = [...new Set(e.map((x) => x.student_id))]
    const { data: students } = await supabase.from('students').select('id, name, contact').in('id', studentIds)
    const sMap = Object.fromEntries((students || []).map((s) => [s.id, s]))
    return e.filter((x) => sMap[x.student_id]).map((x) => ({ ...x, student_name: sMap[x.student_id].name, contact: sMap[x.student_id].contact }))
  }
  const { data: enrollments, error } = await supabase.from('enrollments').select('*').eq('student_id', userId).order('created_at')
  if (error) throw error
  const e = enrollments || []
  const coachIds = [...new Set(e.map((x) => x.coach_id))]
  const { data: coaches } = await supabase.from('coaches').select('id, name').in('id', coachIds)
  const cMap = Object.fromEntries((coaches || []).map((c) => [c.id, c.name]))
  return e.filter((x) => cMap[x.coach_id]).map((x) => ({ ...x, coach_name: cMap[x.coach_id] }))
}

export async function createEnrollment(id, studentId, coachId, courseName, totalLessons, remainingLessons, salaryWhenDone) {
  const { error } = await supabase.from('enrollments').insert({
    id,
    student_id: studentId,
    coach_id: coachId,
    course_name: courseName,
    total_lessons: totalLessons,
    remaining_lessons: remainingLessons,
    salary_when_done: salaryWhenDone,
  })
  if (error) throw error
}

export async function getEnrollment(id) {
  const { data, error } = await supabase.from('enrollments').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function updateEnrollmentRemaining(id, remaining) {
  const { error } = await supabase.from('enrollments').update({ remaining_lessons: remaining }).eq('id', id)
  if (error) throw error
}

export async function deleteEnrollmentsWhereCoachAndRemainingZero(coachId) {
  await supabase.from('enrollments').delete().eq('coach_id', coachId).eq('remaining_lessons', 0)
}

export async function getPendingByCoach(coachId) {
  const { data, error } = await supabase.from('pending_attendances').select('*').eq('coach_id', coachId).order('requested_at')
  if (error) throw error
  return data || []
}

export async function getPendingById(id) {
  const { data, error } = await supabase.from('pending_attendances').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function createPending(id, enrollmentId, studentId, coachId, courseName, studentName) {
  const { error } = await supabase.from('pending_attendances').insert({
    id,
    enrollment_id: enrollmentId,
    student_id: studentId,
    coach_id: coachId,
    course_name: courseName,
    student_name: studentName,
    requested_at: new Date().toISOString(),
  })
  if (error) throw error
}

export async function deletePending(id) {
  const { error } = await supabase.from('pending_attendances').delete().eq('id', id)
  if (error) throw error
}

export async function createAttendanceRecord(id, enrollmentId, studentId, coachId, studentName, courseName) {
  const { error } = await supabase.from('attendance_records').insert({
    id,
    enrollment_id: enrollmentId,
    student_id: studentId,
    coach_id: coachId,
    student_name: studentName,
    course_name: courseName,
    confirmed_at: new Date().toISOString(),
  })
  if (error) throw error
}

export async function getAttendanceRecords(coachId, startDate, endDate) {
  let { data, error } = await supabase.from('attendance_records').select('*').eq('coach_id', coachId).order('confirmed_at')
  if (error) throw error
  let rows = data || []
  if (startDate) {
    const s = String(startDate).slice(0, 10)
    rows = rows.filter((r) => (r.confirmed_at || '').slice(0, 10) >= s)
  }
  if (endDate) {
    const e = String(endDate).slice(0, 10)
    rows = rows.filter((r) => (r.confirmed_at || '').slice(0, 10) <= e)
  }
  return rows
}

export async function auditLog(actorId, actorRole, action, entityType, entityId, oldValue, newValue) {
  try {
    await supabase.from('audit_log').insert({
      actor_id: actorId,
      actor_role: actorRole,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_value: oldValue != null ? JSON.stringify(oldValue) : null,
      new_value: newValue != null ? JSON.stringify(newValue) : null,
    })
  } catch (e) {
    console.error('audit log error', e)
  }
}

export async function updateAdminAccount(adminId, account) {
  const { error } = await supabase.from('admin').update({ account }).eq('id', adminId)
  if (error) throw error
}

export async function updateAdminPassword(adminId, password_hash) {
  const { error } = await supabase.from('admin').update({ password_hash }).eq('id', adminId)
  if (error) throw error
}

export async function coachExistsByAccount(account) {
  const { data } = await supabase.from('coaches').select('id').eq('account', account).maybeSingle()
  return !!data
}

export async function studentExistsByAccount(account) {
  const { data } = await supabase.from('students').select('id').eq('account', account).maybeSingle()
  return !!data
}

export async function coachExistsByAccountExcludingId(account, excludeId) {
  const { data } = await supabase.from('coaches').select('id').eq('account', account).neq('id', excludeId).maybeSingle()
  return !!data
}

export async function studentExistsByAccountExcludingId(account, excludeId) {
  const { data } = await supabase.from('students').select('id').eq('account', account).neq('id', excludeId).maybeSingle()
  return !!data
}

export async function getStudentName(id) {
  const { data } = await supabase.from('students').select('name').eq('id', id).maybeSingle()
  return data?.name ?? ''
}

export async function pendingExistsByEnrollment(enrollmentId) {
  const { data } = await supabase.from('pending_attendances').select('id').eq('enrollment_id', enrollmentId).maybeSingle()
  return !!data
}
