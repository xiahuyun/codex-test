# Game Constraints (Derived from Current Tests)

Use this file as the project prompt baseline for behavior.

## State Model

Expected state fields in logic path:
- `rows`, `cols`
- `snake` (`[{x,y}, ...]`, head at index `0`)
- `obstacles` (optional but treated as active collisions)
- `direction`
- `food` (`{x,y}` or `null`)
- `score`
- `gameOver`

## Locked Behaviors

1. Movement:
- Each tick moves snake head by one tile using current/effective direction.

2. Direction rules:
- Ignore invalid requested directions.
- Disallow direct reversal when snake length is greater than 1.

3. Collisions:
- Wall collision sets `gameOver: true`.
- Self collision sets `gameOver: true`.
- Obstacle collision sets `gameOver: true`.

4. Food and growth:
- Eating food grows snake by one segment.
- Eating food increments score by 1.
- New food placement must avoid snake and obstacles.

5. Deterministic randomness:
- Placement functions must be deterministic when an RNG stub is supplied.

6. Full board handling:
- `placeFood(...)` returns `null` when no empty cell exists.
- If a food-eating move results in `nextFood === null`, resulting state is game over.

7. Game-over short circuit:
- `stepGame(state, ...)` returns the same state object when `state.gameOver` is already true.

8. Initial state:
- One-segment snake.
- Score starts at 0.
- `gameOver` starts false.
- Food must not overlap snake.
- Obstacle placement respects requested count bounds and avoids snake.

## Project Commands

```bash
npm test
npm run dev
```
