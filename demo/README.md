# Snake Arena

一个全栈贪吃蛇项目：
- 前端：Vue 3 + Vite + TypeScript + Pinia + Canvas
- 后端：Go + Gin + PostgreSQL（可回退到内存存储）

支持桌面键盘与移动端触控，带在线排行榜与本地最高分。

## 功能特性

- 经典模式 / 障碍模式
- 三档难度：`easy` / `normal` / `hard`
- 主题切换与音效开关
- 暂停、重开
- 本地最高分持久化（LocalStorage）
- 在线排行榜（匿名昵称）
- 后端基础限流（每 IP：10 秒最多 3 次提交）

## 项目结构

- `frontend/`：前端应用（Vue + Canvas）
- `backend/`：后端 API（Gin）
- `backend/migrations/`：SQL 迁移脚本
- `docs/`：补充文档

## 技术栈要求

- Node.js 20+
- npm 10+
- Go 1.22+
- （可选）Docker / Docker Compose

## 快速开始（本地开发）

### 1) 启动后端

```bash
cd backend
go mod tidy
go run ./cmd/server
```

默认监听：`http://localhost:8080`

如果你本机 `8080` 被占用：

```bash
PORT=8081 go run ./cmd/server
```

### 2) 启动前端

```bash
cd frontend
npm install
npm run dev
```

默认访问：`http://localhost:5173`

如果后端用了 `8081`，前端需指定 API 地址：

```bash
cd frontend
VITE_API_BASE=http://localhost:8081 npm run dev
```

## 一键运行（Docker Compose）

```bash
docker compose up --build
```

启动后：
- 前端：`http://localhost:5173`
- 后端：`http://localhost:8080`
- Postgres：`localhost:5432`（用户/密码/库：`snake/snake/snake`）

停止：

```bash
docker compose down
```

清理容器 + 数据卷：

```bash
docker compose down -v
```

## 环境变量

### 前端（`frontend/.env`）

- `VITE_API_BASE`：后端 API 基地址（默认 `http://localhost:8080`）

示例：

```env
VITE_API_BASE=http://localhost:8080
```

### 后端（`backend/.env`）

- `PORT`：服务端口（默认 `8080`）
- `CORS_ORIGIN`：允许的前端来源（默认 `http://localhost:5173`）
- `DATABASE_URL`：PostgreSQL 连接串（未设置时使用内存存储）

示例：

```env
PORT=8080
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgres://user:password@host:5432/dbname?sslmode=require
```

## API 说明

### `POST /api/v1/scores`

提交分数。

请求体：

```json
{
  "nickname": "player_1",
  "score": 120,
  "mode": "classic",
  "duration_ms": 45000,
  "client_ts": "2026-02-25T12:00:00Z"
}
```

约束：
- `nickname`：`[A-Za-z0-9_]`，长度 1-16
- `score`：`>= 0`
- `mode`：`classic | obstacle`
- `duration_ms`：`>= 0`

### `GET /api/v1/leaderboard?mode=classic&limit=50`

获取排行榜（默认最多 50 条，按分数降序 + 时间升序）。

## 测试与构建

### 前端

```bash
cd frontend
npm run test
npm run build
```

### 后端

```bash
cd backend
go test ./...
```

## 数据库说明

- 后端连接 PostgreSQL 成功时，会在启动阶段自动确保 `scores` 表与索引存在。
- 迁移 SQL 见：`backend/migrations/001_create_scores.sql`

## 已部署预览

最新 Vercel 预览地址：
- https://skill-deploy-91p89xbdk6-codex-agent-deploys.vercel.app

## 常见问题

1. `listen tcp :8080: bind: address already in use`
- 说明端口冲突，改用 `PORT=8081` 启动后端即可。

2. 前端能打开但提交分数失败
- 检查 `VITE_API_BASE` 是否指向正确后端端口。

3. 后端没有连上数据库
- 未配置或连接失败时会自动回退到内存存储，进程重启后数据会丢失。
