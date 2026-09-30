import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from './db.js';
import { COMMON, DEPT, OWNERS } from './templates.js';

const app = express();
app.use(cors());
app.use(express.json());

const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && !isNaN(new Date(s));
const addDays = (iso, n) => {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const bad = (res, msg) => res.status(400).json({ error: msg });

app.get('/api/departments', (_req, res) => res.json({ departments: Object.keys(DEPT), owners: OWNERS }));

app.get('/api/employees', (_req, res) => {
  res.json(db.prepare(`
    SELECT e.*,
      (SELECT COUNT(*) FROM tasks t WHERE t.employee_id = e.id) AS total,
      (SELECT COUNT(*) FROM tasks t WHERE t.employee_id = e.id AND t.done = 1) AS done
    FROM employees e ORDER BY e.id DESC`).all());
});

app.post('/api/employees', (req, res) => {
  const { name, email = '', role = '', department, start_date } = req.body || {};
  if (!name?.trim()) return bad(res, 'Name is required');
  if (!DEPT[department]) return bad(res, 'Choose a valid department');
  if (!isDate(start_date)) return bad(res, 'Start date must be YYYY-MM-DD');

  const create = db.transaction(() => {
    const { lastInsertRowid: id } = db
      .prepare('INSERT INTO employees (name,email,role,department,start_date) VALUES (?,?,?,?,?)')
      .run(name.trim(), email.trim(), role.trim(), department, start_date);
    const ins = db.prepare('INSERT INTO tasks (employee_id,title,owner,due_date) VALUES (?,?,?,?)');
    for (const [t, o, off] of [...COMMON, ...DEPT[department]]) ins.run(id, t, o, addDays(start_date, off));
    return id;
  });
  res.status(201).json(getEmployee(create()));
});

function getEmployee(id) {
  const e = db.prepare('SELECT * FROM employees WHERE id=?').get(id);
  if (!e) return null;
  e.tasks = db.prepare('SELECT * FROM tasks WHERE employee_id=? ORDER BY due_date, id').all(id);
  return e;
}

app.get('/api/employees/:id', (req, res) => {
  const e = getEmployee(req.params.id);
  e ? res.json(e) : res.status(404).json({ error: 'Not found' });
});

app.delete('/api/employees/:id', (req, res) => {
  db.prepare('DELETE FROM employees WHERE id=?').run(req.params.id);
  res.status(204).end();
});

app.post('/api/employees/:id/tasks', (req, res) => {
  const { title, owner, due_date } = req.body || {};
  if (!title?.trim()) return bad(res, 'Task title is required');
  if (!OWNERS.includes(owner)) return bad(res, 'Invalid owner');
  if (!isDate(due_date)) return bad(res, 'Due date must be YYYY-MM-DD');
  if (!db.prepare('SELECT 1 FROM employees WHERE id=?').get(req.params.id)) return res.status(404).json({ error: 'Not found' });
  db.prepare('INSERT INTO tasks (employee_id,title,owner,due_date) VALUES (?,?,?,?)').run(req.params.id, title.trim(), owner, due_date);
  res.status(201).json(getEmployee(req.params.id));
});

app.patch('/api/tasks/:id', (req, res) => {
  const t = db.prepare('SELECT * FROM tasks WHERE id=?').get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  const { done, owner } = req.body || {};
  if (owner !== undefined && !OWNERS.includes(owner)) return bad(res, 'Invalid owner');
  const nd = done === undefined ? t.done : done ? 1 : 0;
  db.prepare('UPDATE tasks SET done=?, owner=?, completed_at=? WHERE id=?').run(
    nd, owner ?? t.owner, nd ? (t.completed_at || new Date().toISOString()) : null, t.id);
  res.json(getEmployee(t.employee_id));
});

app.delete('/api/tasks/:id', (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id=?').run(req.params.id);
  res.status(204).end();
});

// Serve the built client in production
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '../client/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
