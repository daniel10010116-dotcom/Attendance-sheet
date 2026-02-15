/**
 * 在 Supabase 建立預設管理員（admin / admin）與選用種子（教練 c1、學生 s1、選課 e1）。
 * 使用方式：設定環境變數 SUPABASE_URL、SUPABASE_SERVICE_ROLE_KEY 後執行
 *   node supabase/seed-admin.js
 * 或從專案根目錄：node supabase/seed-admin.js
 */
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcrypt'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('請設定 SUPABASE_URL 與 SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key)

async function main() {
  const { data: admins } = await supabase.from('admin').select('id').limit(1)
  if (admins?.length === 0) {
    const hash = await bcrypt.hash('admin', 10)
    await supabase.from('admin').insert({ account: 'admin', password_hash: hash })
    console.log('已建立預設管理員（帳號: admin, 密碼: admin）')
  } else {
    console.log('管理員已存在，略過')
  }

  const { data: coaches } = await supabase.from('coaches').select('id').eq('id', 'c1').single()
  if (!coaches) {
    const coachHash = await bcrypt.hash('123', 10)
    const studentHash = await bcrypt.hash('123', 10)
    await supabase.from('coaches').insert({ id: 'c1', name: '王教練', account: 'coach1', password_hash: coachHash })
    await supabase.from('students').insert({ id: 's1', name: '小明', account: 'student1', password_hash: studentHash, contact: '0912-345678' })
    await supabase.from('coach_earned').upsert({ coach_id: 'c1', amount: 0 }, { onConflict: 'coach_id' })
    await supabase.from('enrollments').insert({ id: 'e1', student_id: 's1', coach_id: 'c1', course_name: '一對一游泳', total_lessons: 10, remaining_lessons: 8, salary_when_done: 5000 })
    console.log('已建立種子：教練 c1、學生 s1、選課 e1')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
