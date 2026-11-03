# Weekly To-Do

A mobile-first to-do app built with the MERN stack. Tasks have a due date & time and are grouped into Monday–Sunday weeks on the home screen, where each week shows how many tasks are still open and how many are done.

- **Live app:** https://to-do-task-1-afka.onrender.com
- **API:** https://to-do-task-hnqv.onrender.com/api (free instance, the first request after a while can take ~50s to wake up)

## Features

- Create, edit and delete tasks (title, description, date & time, priority)
- Mark tasks as Completed / In Progress straight from the list
- Home screen with:
  - this week's strip, completed vs pending counts and a progress bar
  - today's tasks, with **View All** opening this week's card
  - one card per week with open/completed counts, tap to expand and see the tasks
  - "Add task to this week" inside an expanded week
- Swipe a task left to reveal **Delete** (works with touch and mouse), or use the trash icon which asks for confirmation
- Search by keyword across title and description, with view / edit / delete on each result
- Onboarding screen on the first visit
- Works on phones, tablets and desktop (the bottom sheet turns into a centered dialog on bigger screens)

## Tech stack

| | |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router, TanStack Query, date-fns, lucide-react |
| Backend | Node.js, Express 5, MongoDB with Mongoose |
| Tests | Vitest, Supertest, mongodb-memory-server |
| Hosting | Netlify (client), Render (API), MongoDB Atlas |

## Running locally

You need Node 22+ and a MongoDB connection string (a free Atlas cluster works, or a local `mongod`).

```bash
# API
cd server
cp .env.example .env      # then set MONGODB_URI
npm install
npm run seed              # optional, adds a few weeks of sample tasks
npm run dev               # http://localhost:5000

# client (another terminal)
cd client
npm install
npm run dev               # http://localhost:5173
```

The Vite dev server proxies `/api` to `localhost:5000`, so the client needs no config in development.

### Tests

```bash
cd server && npm test     # API integration tests against an in-memory MongoDB
cd client && npm test     # unit tests for the date/week helpers
```

The first server test run downloads a MongoDB binary, so it takes a bit longer.

## API

Base path: `/api`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | List tasks. Optional query: `search`, `from`, `to` (ISO dates, `to` is exclusive), `status` |
| GET | `/tasks/weeks?tz=Asia/Kolkata` | Weekly summary: `weekStart`, `weekEnd`, `total`, `open`, `completed` |
| GET | `/tasks/:id` | Single task |
| POST | `/tasks` | Create a task |
| PATCH | `/tasks/:id` | Update any of `title`, `description`, `dueAt`, `priority`, `status` |
| DELETE | `/tasks/:id` | Delete a task |
| GET | `/health` | Health check |

Task shape:

```json
{
  "id": "6727…",
  "title": "Meeting with team",
  "description": "Sprint planning",
  "dueAt": "2026-11-03T04:30:00.000Z",
  "priority": "high",
  "status": "in_progress",
  "completedAt": null,
  "createdAt": "…",
  "updatedAt": "…"
}
```

`priority` is `low | medium | high | null`, `status` is `in_progress | completed`. Validation errors come back as `400` with a per-field `errors` object.

## Project structure

```
client/
  src/
    api/          fetch wrapper for the REST API
    components/   TaskItem (swipe row), WeekCard, BottomSheet, forms…
    context/      TaskActionsContext - shared create/edit/view/delete sheets
    hooks/        React Query hooks (useTasks, useWeeklySummary, mutations)
    lib/          date & week helpers
    pages/        Welcome, Home, Search
server/
  src/
    controllers/  route handlers
    models/       Task schema
    routes/
    middleware/   404 + error handler
    scripts/      seed script
  tests/
```

## Notes on some decisions

- **Weeks are calculated on the server** with `$dateTrunc` (`startOfWeek: 'monday'`). The client sends its timezone, otherwise a task at 1am Monday in India would land in the previous week because it's still Sunday in UTC. Needs MongoDB 5.0+, which Atlas has.
- Expanding a week fetches only that week's tasks (`from`/`to`), so the home screen doesn't load everything at once.
- Ticking a checkbox or deleting updates the cached lists right away (optimistic update) and rolls back if the request fails. The week counts are refetched after.
- Search uses a case-insensitive regex on title and description (user input is escaped). For a small personal list that's fine and it matches partial words, which a MongoDB text index doesn't. With a lot of data I'd switch to a text index or Atlas Search.
- The Figma has Start/End time on the add-task screen, but the requirements ask for a single date & time, so I went with one due date/time plus priority.
- The Figma home shows a "Tasks Today" list while the requirements ask for week cards, so the home screen has both: today's tasks first, then the weeks. The Figma week strip starts on Sunday; the app's starts on Monday to match the requirement.

## What I'd add with more time

- User accounts (right now everyone using the deployed app shares the same list)
- Pagination / infinite scroll for long weeks and search results
- Undo after deleting instead of the confirmation dialog
- Reminders / notifications for upcoming tasks
- E2E tests with Playwright

## Deployment

**API on Render** – create a Web Service from this repo (or use `render.yaml`), root directory `server`, start command `npm start`. Set `MONGODB_URI` and `CLIENT_ORIGIN` (your client URL, no trailing slash).

**Client on Render** – create a Static Site, root directory `client`, build command `npm ci && npm run build`, publish directory `dist`. Add the env var `VITE_API_URL=https://<your-render-app>.onrender.com/api` and a rewrite rule `/*` → `/index.html` so refreshing `/search` doesn't 404.

**Client on Netlify** (alternative) – `netlify.toml` is already set up (base `client`, publish `dist`, SPA redirect). Add the same `VITE_API_URL` env var and deploy.
