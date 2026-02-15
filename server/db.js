import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = process.env.SQLITE_PATH || path.join(__dirname, 'database.sqlite')

export const db = new Database(dbPath)
