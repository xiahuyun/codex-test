import { hitsBody, hitsObstacle, hitsWall, samePoint } from './collision';
import type { Direction, GameMode, GameState, Point, TickResult } from './types';

export const GRID_SIZE = 24;

const directionVectors: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const opposite: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

export function canTurn(current: Direction, next: Direction): boolean {
  return opposite[current] !== next;
}

function randomCell(gridSize: number): Point {
  return {
    x: Math.floor(Math.random() * gridSize),
    y: Math.floor(Math.random() * gridSize),
  };
}

export function buildObstacles(mode: GameMode, gridSize: number): Point[] {
  if (mode !== 'obstacle') {
    return [];
  }

  const center = Math.floor(gridSize / 2);
  const obstacles: Point[] = [];
  for (let i = center - 3; i <= center + 3; i += 1) {
    if (i === center) {
      continue;
    }
    obstacles.push({ x: center, y: i });
  }
  return obstacles;
}

export function spawnFood(
  snake: Point[],
  obstacles: Point[],
  gridSize: number,
): Point {
  let candidate = randomCell(gridSize);
  while (hitsBody(candidate, snake) || hitsObstacle(candidate, obstacles)) {
    candidate = randomCell(gridSize);
  }
  return candidate;
}

export function createInitialState(mode: GameMode): GameState {
  const snake = [
    { x: 11, y: 12 },
    { x: 10, y: 12 },
    { x: 9, y: 12 },
  ];
  const obstacles = buildObstacles(mode, GRID_SIZE);
  return {
    snake,
    food: spawnFood(snake, obstacles, GRID_SIZE),
    obstacles,
    direction: 'right',
    score: 0,
    isGameOver: false,
    gridSize: GRID_SIZE,
    startedAt: Date.now(),
    endedAt: null,
  };
}

export function resetState(mode: GameMode): GameState {
  return createInitialState(mode);
}

export function stepGame(state: GameState, requestedDirection: Direction | null): TickResult {
  if (state.isGameOver) {
    return { ateFood: false, gameOver: true };
  }

  if (requestedDirection && canTurn(state.direction, requestedDirection)) {
    state.direction = requestedDirection;
  }

  const vector = directionVectors[state.direction];
  const nextHead = {
    x: state.snake[0].x + vector.x,
    y: state.snake[0].y + vector.y,
  };

  if (hitsWall(nextHead, state.gridSize) || hitsBody(nextHead, state.snake) || hitsObstacle(nextHead, state.obstacles)) {
    state.isGameOver = true;
    state.endedAt = Date.now();
    return { ateFood: false, gameOver: true };
  }

  state.snake.unshift(nextHead);

  if (samePoint(nextHead, state.food)) {
    state.score += 10;
    state.food = spawnFood(state.snake, state.obstacles, state.gridSize);
    return { ateFood: true, gameOver: false };
  }

  state.snake.pop();
  return { ateFood: false, gameOver: false };
}
