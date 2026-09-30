const j = async (url, opts = {}) => {
  const r = await fetch('/api' + url, { headers: { 'Content-Type': 'application/json' }, ...opts });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.statusText);
  return r.status === 204 ? null : r.json();
};
const body = (method, b) => ({ method, body: JSON.stringify(b) });

export const api = {
  meta: () => j('/departments'),
  list: () => j('/employees'),
  get: (id) => j(`/employees/${id}`),
  create: (b) => j('/employees', body('POST', b)),
  remove: (id) => j(`/employees/${id}`, { method: 'DELETE' }),
  addTask: (id, b) => j(`/employees/${id}/tasks`, body('POST', b)),
  patchTask: (id, b) => j(`/tasks/${id}`, body('PATCH', b)),
  delTask: (id) => j(`/tasks/${id}`, { method: 'DELETE' }),
};
