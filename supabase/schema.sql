-- 在 Supabase Dashboard → SQL Editor 貼上並執行此檔，建立資料表與種子資料。
-- 密碼以 bcrypt 雜湊儲存（§7）。預設管理員 account: admin, password: admin。

-- 管理員（單一或少量）
CREATE TABLE IF NOT EXISTS admin (
  id BIGSERIAL PRIMARY KEY,
  account TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 教練
CREATE TABLE IF NOT EXISTS coaches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  account TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 學生
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  account TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  contact TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 選課
CREATE TABLE IF NOT EXISTS enrollments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  coach_id TEXT NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  course_name TEXT NOT NULL DEFAULT '課程',
  total_lessons INTEGER NOT NULL,
  remaining_lessons INTEGER NOT NULL,
  salary_when_done INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 待確認點名
CREATE TABLE IF NOT EXISTS pending_attendances (
  id TEXT PRIMARY KEY,
  enrollment_id TEXT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  coach_id TEXT NOT NULL,
  course_name TEXT NOT NULL,
  student_name TEXT NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL
);

-- 扣堂紀錄
CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  enrollment_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  coach_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  confirmed_at TIMESTAMPTZ NOT NULL
);

-- 累計薪水明細（課堂上完時一筆，發薪後刪除）
CREATE TABLE IF NOT EXISTS completed_salary_details (
  id BIGSERIAL PRIMARY KEY,
  coach_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  amount INTEGER NOT NULL
);

-- 教練累計未領薪水
CREATE TABLE IF NOT EXISTS coach_earned (
  coach_id TEXT PRIMARY KEY REFERENCES coaches(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL DEFAULT 0
);

-- 審計日誌（§5）
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  actor_id TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 預設管理員與種子資料請執行：node supabase/seed-admin.js（需設定 SUPABASE_URL、SUPABASE_SERVICE_ROLE_KEY）
