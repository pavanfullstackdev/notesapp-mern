# MERN Note App

A small notes application built with MongoDB, Express, React (Vite) and Node — a simple full-stack MERN example with a lightweight rate-limiter using Upstash Redis.

This repository contains two main folders:

- `backend/` — Express API, Mongoose models, Upstash rate-limiter.
- `frontend/` — React app (Vite) that talks to the API.

## Quick overview

- Backend runs on port `5001` by default and exposes a JSON REST API at `/api/notes`.
- Frontend is a Vite + React app (development server runs on `http://localhost:5173`).
- The project uses Upstash Redis for a rate limiter configured as a sliding window (100 requests / 60s).

## Project contract

- API base path: `/api/notes`
- Note resource shape (JSON):

  - Request/response object:
    - `title` (string) — required
    - `content` (string) — required
    - `_id` (string) — returned by MongoDB
    - `createdAt` / `updatedAt` (ISO timestamps)

- Status codes & error modes:
  - 200 — success for GET/PUT/DELETE
  - 201 — created (POST)
  - 404 — resource not found
  - 429 — rate limit exceeded
  - 500 — internal server error

## API endpoints

- GET /api/notes — List all notes (newest first)
- GET /api/notes/:id — Get a single note by id
- POST /api/notes — Create a new note (JSON body: `{ title, content }`)
- PUT /api/notes/:id — Update an existing note (JSON body: `{ title, content }`)
- DELETE /api/notes/:id — Delete a note by id

Example response for GET /api/notes:

```
[
	{
		"_id": "650...",
		"title": "Buy milk",
		"content": "Remember to buy milk",
		"createdAt": "2025-10-06T...",
		"updatedAt": "2025-10-06T..."
	},
	...
]
```

## Requirements

- Node.js (18+ recommended)
- npm or yarn
- A MongoDB connection string (Atlas or local)
- Upstash Redis credentials (for rate limiting) — optional for local testing if you remove the limiter or mock it

## Environment variables

Create a `.env` file inside `backend/` with the following variables (example names used in the code):

- `MONGO_URI` — MongoDB connection string (required)
- `PORT` — backend port (optional, default 5001)
- `UPSTASH_REDIS_REST_URL` — Upstash REST URL (required for Upstash)
- `UPSTASH_REDIS_REST_TOKEN` — Upstash REST token (required for Upstash)
- `NODE_ENV` — `development` or `production` (affects CORS and static serving)

Example `.env` (do NOT commit your credentials):

```
MONGO_URI=your_mongodb_connection_string
PORT=5001
UPSTASH_REDIS_REST_URL=https://<your-upstash>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<your-upstash-token>
NODE_ENV=development
```

Notes:

- The backend code loads these via `dotenv` (see `backend/src/config/db.js` and `backend/src/config/upstash.js`).
- If you don't want to use Upstash during local development you can either set dummy values or temporarily skip the `rateLimiter` middleware in `backend/src/server.js`.

## Local development (Windows PowerShell)

Open two terminals.

1. Start the backend

```powershell
cd backend
npm install
npm run dev
```

This runs `nodemon src/server.js` (hot reload). The server listens on `http://localhost:5001` by default.

2. Start the frontend

```powershell
cd frontend
npm install
npm run dev
```

Vite will serve the frontend at `http://localhost:5173`. The frontend uses `frontend/src/lib/axios.js` to automatically target `http://localhost:5001/api` in development.

## Build & Production

Build the frontend and let the backend serve the static files (the backend has logic to serve `../frontend/dist` when `NODE_ENV === 'production'`).

```powershell
# from repo root
cd frontend
npm run build

# copy or ensure backend serves the build (backend looks for ../frontend/dist)
cd ../backend
npm install --production
NODE_ENV=production npm start
```

On Windows set env var differently in PowerShell if needed:

```powershell
$env:NODE_ENV = 'production'; npm start
```

## Rate limiting

- The app uses Upstash Redis and `@upstash/ratelimit` with a sliding window configured here:

  - limiter: slidingWindow(100, "60 s")

- Implementation details:
  - The middleware `backend/src/middleware/rateLimiter.js` calls the limiter and returns HTTP 429 when `success` is false.
  - If Upstash is unreachable the middleware logs the error and forwards it — depending on your needs you can change it to allow requests when the rate limiter is down.

## Where to look in the code

- Backend entry: `backend/src/server.js`
- Notes routes: `backend/src/routes/notesRoutes.js`
- Controller: `backend/src/controllers/notesController.js`
- Mongoose model: `backend/src/models/Note.js`
- Upstash config: `backend/src/config/upstash.js`
- Frontend API helper: `frontend/src/lib/axios.js`

## Troubleshooting

- CORS errors when running frontend -> backend:

  - Ensure backend is running and `NODE_ENV` is not `production` (server enables CORS for `http://localhost:5173` in development).

- MongoDB connection problems:

  - Confirm `MONGO_URI` is valid and your IP is allowed (if using Atlas).
  - Check logs printed by `connectDB()` in `backend/src/config/db.js`.

- 429 Too Many Requests:
  - The app permits ~100 requests / minute by default. If you hit this during testing, wait or increase the limit in `backend/src/config/upstash.js`.

## Contributing

Feel free to fork and open PRs. Small ideas:

- Add tests for API endpoints (supertest + jest)
- Add authentication
- Improve error handling and centralize responses

---

## MADEWITHLOVE

Pavan Birari
