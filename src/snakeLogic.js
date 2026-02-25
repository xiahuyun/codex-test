export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function keyFor(point) {
  return `${point.x},${point.y}`;
}

const OPPOSITES = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export function getNextDirection(current, requested, snakeLength = 1) {
  if (!requested || !DIRECTIONS[requested]) {
    return current;
  }
  if (snakeLength > 1 && OPPOSITES[current] === requested) {
    return current;
  }
  return requested;
}

export function placeFood(rows, cols, snake, obstacles = [], rng = Math.random) {
  const occupied = new Set([
    ...snake.map((s) => keyFor(s)),
    ...obstacles.map((o) => keyFor(o)),
  ]);
  const empty = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        empty.push({ x, y });
      }
    }
  }

  if (empty.length === 0) {
    return null;
  }

  const idx = Math.floor(rng() * empty.length);
  return empty[Math.min(idx, empty.length - 1)];
}

export function placeObstacles(
  rows,
  cols,
  snake,
  obstacleCount = 0,
  rng = Math.random,
) {
  const maxObstacles = Math.max(0, rows * cols - snake.length - 1);
  const targetCount = Math.max(0, Math.min(obstacleCount, maxObstacles));
  const occupied = new Set(snake.map((segment) => keyFor(segment)));
  const obstacles = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        obstacles.push({ x, y });
      }
    }
  }

  for (let i = obstacles.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [obstacles[i], obstacles[j]] = [obstacles[j], obstacles[i]];
  }

  return obstacles.slice(0, targetCount);
}

export function createInitialState({
  rows = 16,
  cols = 16,
  rng = Math.random,
  obstacleCount = Math.floor((rows * cols) / 20),
} = {}) {
  const start = { x: Math.floor(cols / 2), y: Math.floor(rows / 2) };
  const snake = [start];
  const obstacles = placeObstacles(rows, cols, snake, obstacleCount, rng);

  return {
    rows,
    cols,
    snake,
    obstacles,
    direction: "right",
    food: placeFood(rows, cols, snake, obstacles, rng),
    score: 0,
    gameOver: false,
  };
}

export function stepGame(state, requestedDirection, rng = Math.random) {
  if (state.gameOver) {
    return state;
  }

  const direction = getNextDirection(
    state.direction,
    requestedDirection,
    state.snake.length,
  );
  const vector = DIRECTIONS[direction];
  const head = state.snake[0];
  const nextHead = { x: head.x + vector.x, y: head.y + vector.y };

  const hitsWall =
    nextHead.x < 0 ||
    nextHead.y < 0 ||
    nextHead.x >= state.cols ||
    nextHead.y >= state.rows;

  const obstacles = state.obstacles ?? [];
  const hitsObstacle = obstacles.some(
    (obstacle) => obstacle.x === nextHead.x && obstacle.y === nextHead.y,
  );

  if (hitsWall || hitsObstacle) {
    return { ...state, direction, gameOver: true };
  }

  const willEat =
    state.food && nextHead.x === state.food.x && nextHead.y === state.food.y;

  const nextSnake = [nextHead, ...state.snake];
  if (!willEat) {
    nextSnake.pop();
  }

  const selfCollision = nextSnake
    .slice(1)
    .some((segment) => segment.x === nextHead.x && segment.y === nextHead.y);

  if (selfCollision) {
    return { ...state, direction, gameOver: true };
  }

  const nextScore = state.score + (willEat ? 1 : 0);
  const nextFood = willEat
    ? placeFood(state.rows, state.cols, nextSnake, obstacles, rng)
    : state.food;

  return {
    ...state,
    snake: nextSnake,
    direction,
    food: nextFood,
    score: nextScore,
    gameOver: nextFood === null,
  };
}
