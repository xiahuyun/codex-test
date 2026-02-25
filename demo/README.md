# Snake Arena

Full-stack snake game with Vue + Canvas frontend and Go + Gin leaderboard backend.

## Project Layout
- `frontend/`: Vue 3 + Vite + Pinia + Canvas
- `backend/`: Go API (Gin) with Postgres or in-memory fallback
- `docs/`: setup and operational notes

## Features
- Keyboard and touch controls (swipe + on-screen d-pad)
- Difficulty levels (`easy`, `normal`, `hard`)
- Themes and sound toggle
- Classic and obstacle game modes
- Local high score persistence
- Online leaderboard submission and retrieval
- Basic anti-spam IP rate limiting (`3 POSTs / 10s / IP`)

## Run Locally
1. Start backend:
```bash
cd backend
go mod tidy
go run ./cmd/server
```
2. Start frontend:
```bash
cd frontend
npm install
npm run dev
```
3. Open `http://localhost:5173`

## Run With Docker Compose (One Command)
```bash
docker compose up --build
```

After startup:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080`
- Postgres: `localhost:5432` (`snake/snake`, db `snake`)

Stop and remove containers:
```bash
docker compose down
```

Stop and remove containers + DB volume:
```bash
docker compose down -v
```

## Notes
- If `DATABASE_URL` is missing or invalid, backend falls back to in-memory storage.
- For persistent leaderboard, backend auto-creates schema on startup when Postgres is reachable.
