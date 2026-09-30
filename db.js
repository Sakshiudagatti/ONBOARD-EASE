import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const file = process.env.DB_FILE || path.join(path.dirname(fileURLToPath(import.meta.url)), 'data.db');
const db = new Database(file);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(`
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  role TEXT DEFAULT '',
  department TEXT NOT NULL,
  start_date TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  owner TEXT NOT NULL,
  due_date TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_tasks_emp ON tasks(employee_id);
`);
export default db;
