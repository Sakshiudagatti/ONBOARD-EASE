import { useEffect, useState } from 'react';
import { api } from './api.js';

const today = () => new Date().toISOString().slice(0, 10);
const fmt = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
const pct = (d, t) => (t ? Math.round((d / t) * 100) : 0);

export default function App() {
  const [meta, setMeta] = useState({ departments: [], owners: [] });
  const [emps, setEmps] = useState([]);
  const [sel, setSel] = useState(null);
  const [emp, setEmp] = useState(null);
  const [filter, setFilter] = useState('All');
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ name: '', email: '', role: '', department: '', start_date: today() });
  const [nt, setNt] = useState({ title: '', owner: 'Employee', due_date: today() });

  const run = async (fn) => { try { setErr(''); await fn(); } catch (e) { setErr(e.message); } };
  const refresh = () => api.list().then(setEmps);

  useEffect(() => {
    run(async () => {
      const m = await api.meta();
      setMeta(m);
      setForm((f) => ({ ...f, department: m.departments[0] }));
      const list = await api.list();
      setEmps(list);
      if (list[0]) setSel(list[0].id);
    });
  }, []);

  useEffect(() => {
    if (!sel) return setEmp(null);
    run(async () => { setEmp(await api.get(sel)); setFilter('All'); });
  }, [sel]);

  const update = async (next) => { setEmp(next); await refresh(); };

  const create = (e) => { e.preventDefault(); run(async () => {
    const created = await api.create(form);
    setForm({ ...form, name: '', email: '', role: '' });
    await refresh(); setSel(created.id);
  }); };

  const toggle = (t) => run(async () => update(await api.patchTask(t.id, { done: !t.done })));
  const assign = (t, owner) => run(async () => update(await api.patchTask(t.id, { owner })));
  const delTask = (t) => run(async () => { await api.delTask(t.id); update(await api.get(emp.id)); });
  const addTask = () => run(async () => {
    update(await api.addTask(emp.id, nt)); setNt({ ...nt, title: '' });
  });
  const delEmp = () => confirm(`Delete ${emp.name}?`) && run(async () => {
    await api.remove(emp.id);
    const list = await api.list(); setEmps(list); setSel(list[0]?.id ?? null);
  });

  const tasks = emp?.tasks.filter((t) => filter === 'All' || t.owner === filter) ?? [];
  const done = emp?.tasks.filter((t) => t.done).length ?? 0;
  const total = emp?.tasks.length ?? 0;
  const late = emp?.tasks.filter((t) => !t.done && t.due_date < today()).length ?? 0;
  const p = pct(done, total), C = 2 * Math.PI * 40;
  const f = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  return (
    <div className="app">
      <aside>
        <h1>Onboarding</h1>
        <div className="mut">{emps.length} employees</div>
        <form className="card" onSubmit={create}>
          <h3>New employee</h3>
          <label>Full name<input {...f('name')} required /></label>
          <label>Email<input type="email" {...f('email')} /></label>
          <label>Job title<input {...f('role')} /></label>
          <label>Department
            <select {...f('department')}>{meta.departments.map((d) => <option key={d}>{d}</option>)}</select>
          </label>
          <label>Start date<input type="date" {...f('start_date')} required /></label>
          <button className="p">Generate checklist</button>
        </form>
        {emps.map((e) => (
          <button key={e.id} className={'emp' + (e.id === sel ? ' on' : '')} onClick={() => setSel(e.id)}>
            <b>{e.name}</b>
            <div className="mut">{e.department} · {pct(e.done, e.total)}%</div>
            <div className="bar"><i style={{ width: pct(e.done, e.total) + '%' }} /></div>
          </button>
        ))}
      </aside>

      <main>
        {err && <div className="err" role="alert">{err}</div>}
        {!emp ? (
          <div className="empty"><h2>Start an onboarding</h2><p>Add an employee and pick a department to generate their checklist.</p></div>
        ) : (<>
          <div className="head">
            <div>
              <h2>{emp.name}</h2>
              <div className="mut">{emp.role || 'New hire'} · {emp.department} · starts {fmt(emp.start_date)}{emp.email && ' · ' + emp.email}</div>
              <div className="mut">{total - done} tasks left{late > 0 && <span className="late"> · {late} overdue</span>}</div>
            </div>
            <div className="ring">
              <svg viewBox="0 0 96 96" width="96" height="96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="var(--ln)" strokeWidth="9" />
                <circle cx="48" cy="48" r="40" fill="none" stroke="var(--ac)" strokeWidth="9" strokeLinecap="round"
                  strokeDasharray={C} strokeDashoffset={C * (1 - p / 100)} transform="rotate(-90 48 48)" />
              </svg>
              <b>{p}%</b>
            </div>
          </div>

          <div className="chips">
            {['All', ...meta.owners].map((o) => (
              <button key={o} className={'chip' + (filter === o ? ' on' : '')} onClick={() => setFilter(o)}>{o}</button>
            ))}
          </div>

          <div className="card list">
            {tasks.length === 0 && <div className="empty">No tasks for {filter}.</div>}
            {tasks.map((t) => (
              <div key={t.id} className={'task' + (t.done ? ' done' : '')}>
                <input type="checkbox" checked={!!t.done} onChange={() => toggle(t)} aria-label={'Mark complete: ' + t.title} />
                <div>
                  <div className="tt">{t.title}</div>
                  <div className={'mut' + (!t.done && t.due_date < today() ? ' late' : '')}>Due {fmt(t.due_date)}</div>
                </div>
                <div className="row">
                  <select value={t.owner} onChange={(e) => assign(t, e.target.value)} aria-label="Assign owner">
                    {meta.owners.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <button className="g" onClick={() => delTask(t)}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h3>Add a task</h3>
            <div className="row wrap">
              <input placeholder="Task name" value={nt.title} style={{ flex: 2, minWidth: 160 }}
                onChange={(e) => setNt({ ...nt, title: e.target.value })} />
              <select value={nt.owner} style={{ flex: 1, minWidth: 110 }} onChange={(e) => setNt({ ...nt, owner: e.target.value })}>
                {meta.owners.map((o) => <option key={o}>{o}</option>)}
              </select>
              <input type="date" value={nt.due_date} style={{ flex: 1, minWidth: 130 }}
                onChange={(e) => setNt({ ...nt, due_date: e.target.value })} />
              <button onClick={addTask}>Add task</button>
            </div>
          </div>
          <button className="g" onClick={delEmp}>Delete {emp.name}</button>
        </>)}
      </main>
    </div>
  );
}
