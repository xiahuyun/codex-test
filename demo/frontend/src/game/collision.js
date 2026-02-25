export const samePoint = (a, b) => a.x === b.x && a.y === b.y;
export const hitsWall = (point, gridSize) => point.x < 0 || point.y < 0 || point.x >= gridSize || point.y >= gridSize;
export const hitsBody = (point, body) => body.some((p) => samePoint(p, point));
export const hitsObstacle = (point, obstacles) => obstacles.some((o) => samePoint(o, point));
