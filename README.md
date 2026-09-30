# ONBOARD-EASE
# Onboarding Checklist Generator

Full-stack app: **React (Vite)** + **Express** + **SQLite** (better-sqlite3).

## Features
- Employee details (name, email, title, start date)
- Department selection, which generates a checklist from templates
- Task assignment (HR, IT, Manager, Buddy, Employee), editable per task
- Progress tracking (per employee, overdue flags)
- Mark tasks complete; add or remove custom tasks

## Requirements
Node.js 18+

## Run in development
```
npm run install:all
npm run dev
```
- Web: http://localhost:5173
- API: http://localhost:3001

## Run in production
```
npm run install:all
npm run build
npm start        # serves API + built client on http://localhost:3001
```

## Structure
```
server/
  index.js       REST API (Express)
  db.js          SQLite schema
  templates.js   Department task templates (edit these)
client/
  src/App.jsx    UI
  src/api.js     API wrapper
```

## API
| Method | Path | Purpose |
|---|---|---|
| GET | /api/departments | Departments and owners |
| GET | /api/employees | List with progress |
| POST | /api/employees | Create and generate checklist |
| GET | /api/employees/:id | Employee and tasks |
| DELETE | /api/employees/:id | Delete employee |
| POST | /api/employees/:id/tasks | Add a task |
| PATCH | /api/tasks/:id | Update `done` and/or `owner` |
| DELETE | /api/tasks/:id | Remove a task |

## Next steps
Add authentication (e.g. JWT) with roles, email reminders for overdue tasks, and Postgres for multi-server deployments.
