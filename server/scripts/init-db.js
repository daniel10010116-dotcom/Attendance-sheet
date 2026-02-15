/**
 * 建立 SQLite 資料表與預設管理員（密碼以 bcrypt 雜湊）。
 * 執行：node scripts/init-db.js（需在 server 目錄下，或從專案根目錄 node server/scripts/init-db.js）
 */
import Database from 'better-sqlite3'
import bcrypt from 'bcrypt'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '..', 'database.sqlite')
const db = new Database(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS coaches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    account TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    account TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    contact TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS enrollments (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id),
    coach_id TEXT NOT NULL REFERENCES coaches(id),
    course_name TEXT NOT NULL DEFAULT '課程',
    total_lessons INTEGER NOT NULL,
    remaining_lessons INTEGER NOT NULL,
    salary_when_done INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS pending_attendances (
    id TEXT PRIMARY KEY,
    enrollment_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    coach_id TEXT NOT NULL,
    course_name TEXT NOT NULL,
    student_name TEXT NOT NULL,
    requested_at TEXT NOT NULL,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id)
  );

  CREATE TABLE IF NOT EXISTS attendance_records (
    id TEXT PRIMARY KEY,
    enrollment_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    coach_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    course_name TEXT NOT NULL,
    confirmed_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS completed_salary_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coach_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    course_name TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    amount INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS coach_earned (
    coach_id TEXT PRIMARY KEY,
    amount INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_id TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    old_value TEXT,
    new_value TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

// 若尚無管理員，建立預設 admin / admin（密碼雜湊）
const adminCount = db.prepare('SELECT COUNT(*) as n FROM admin').get()
if (adminCount.n === 0) {
  const hash = bcrypt.hashSync('admin', 10)
  db.prepare('INSERT INTO admin (account, password_hash) VALUES (?, ?)').run('admin', hash)
  console.log('Created default admin (account: admin, password: admin)')
}

// 可選：種子一筆教練、學生、選課（與原 mock 一致，密碼 123 雜湊）
const coachCount = db.prepare('SELECT COUNT(*) as n FROM coaches').get()
if (coachCount.n === 0) {
  const coachHash = bcrypt.hashSync('123', 10)
  const studentHash = bcrypt.hashSync('123', 10)
  db.prepare("INSERT INTO coaches (id, name, account, password_hash) VALUES ('c1', '王教練', 'coach1', ?)").run(coachHash)
  db.prepare("INSERT INTO students (id, name, account, password_hash, contact) VALUES ('s1', '小明', 'student1', ?, '0912-345678')").run(studentHash)
  db.prepare("INSERT INTO coach_earned (coach_id, amount) VALUES ('c1', 0)").run()
  db.prepare(`INSERT INTO enrollments (id, student_id, coach_id, course_name, total_lessons, remaining_lessons, salary_when_done)
    VALUES ('e1', 's1', 'c1', '一對一游泳', 10, 8, 5000)`).run()
  console.log('Seeded coach c1, student s1, enrollment e1')
}

db.close()
console.log('DB initialized at', dbPath)
