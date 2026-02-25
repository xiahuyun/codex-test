export type Direction = 'up' | 'down' | 'left' | 'right';
export type Difficulty = 'easy' | 'normal' | 'hard';
export type GameMode = 'classic' | 'obstacle';
export type Theme = 'sunset' | 'mint' | 'mono';

export interface Point {
  x: number;
  y: number;
}

export interface GameState {
  snake: Point[];
  food: Point;
  obstacles: Point[];
  direction: Direction;
  score: number;
  isGameOver: boolean;
  gridSize: number;
  startedAt: number;
  endedAt: number | null;
}

export interface TickResult {
  ateFood: boolean;
  gameOver: boolean;
}
