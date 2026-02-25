import type { Point } from './types';

export const samePoint = (a: Point, b: Point): boolean => a.x === b.x && a.y === b.y;

export const hitsWall = (point: Point, gridSize: number): boolean =>
  point.x < 0 || point.y < 0 || point.x >= gridSize || point.y >= gridSize;

export const hitsBody = (point: Point, body: Point[]): boolean => body.some((p) => samePoint(p, point));

export const hitsObstacle = (point: Point, obstacles: Point[]): boolean =>
  obstacles.some((o) => samePoint(o, point));
