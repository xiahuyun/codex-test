# codex-test

一个基于原生 HTML/CSS/JavaScript 实现的贪吃蛇小游戏。

## 功能特性

- 16x16 棋盘与实时计分
- 键盘与触控双操作支持
- 暂停/继续、重开游戏
- 障碍物机制（初始随机生成，撞到障碍物会结束）
- 食物生成会避开蛇身和障碍物

## 目录结构

```text
.
├── index.html
├── styles.css
├── src
│   ├── app.js
│   └── snakeLogic.js
└── tests
    └── snakeLogic.test.js
```

## 本地运行

### 环境要求

- Node.js 18+（推荐当前 LTS）
- Python 3（用于本地静态服务）

### 安装与启动

```bash
npm run dev
```

启动后访问：`http://localhost:5173`

## 游戏操作

- 移动：方向键 / `W A S D`
- 暂停或继续：`Space`
- 重新开始：`R`

## 测试

运行单元测试：

```bash
npm test
```

运行覆盖率：

```bash
node --test --experimental-test-coverage
```

当前核心逻辑（`src/snakeLogic.js`）覆盖率为 100%（line/branch/functions）。

## 部署

项目可直接部署到 Vercel（推荐 Preview 部署）：

```bash
vercel deploy -y
```
