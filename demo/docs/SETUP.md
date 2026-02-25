# Setup Guide

## Prerequisites
- Node.js 20+
- Go 1.22+

## Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Backend
```bash
cd backend
go mod tidy
cp .env.example .env
# apply migrations manually in Supabase SQL editor using migrations/001_create_scores.sql
go run ./cmd/server
```

## API
- `POST /api/v1/scores`
- `GET /api/v1/leaderboard?mode=classic&limit=50`

## Docker Compose (Frontend + Backend + Postgres)
```bash
cd /Users/hxia/Documents/codex-test/demo
docker compose up --build
```

Endpoints:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`

Stop services:
```bash
docker compose down
```
