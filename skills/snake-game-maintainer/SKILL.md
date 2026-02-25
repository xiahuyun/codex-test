---
name: snake-game-maintainer
description: Maintain and extend the codex-test browser snake game with deterministic game-logic behavior and test-first constraints. Use when requests involve changing snake rules, collision handling, food/obstacle placement, keyboard/touch controls, board rendering, scoring, pause/restart flow, or adding tests for these behaviors.
---

# Snake Game Maintainer

Implement changes to the `codex-test` snake game without breaking behavior locked by existing tests.

## Core Workflow

1. Read behavior constraints first:
- [Game Constraints](references/game-constraints.md)

2. Locate change scope:
- `src/snakeLogic.js`: pure game state transitions and placement logic
- `src/app.js`: input handling, tick loop, pause/restart, rendering
- `index.html` + `styles.css`: UI structure and styling

3. Implement minimal edits that preserve deterministic logic:
- Accept an injected `rng` for logic that needs randomness.
- Keep pure logic in `snakeLogic.js`; avoid DOM coupling there.
- Prefer adding/changing tests before broad refactors.

4. Validate:
```bash
npm test
```

## Implementation Rules

- Keep direction validation centralized via `getNextDirection`.
- Keep `stepGame` behavior stable when `gameOver` is already true.
- Keep placement functions (`placeFood`, `placeObstacles`) deterministic under fixed RNG.
- Treat obstacles as first-class collision objects in both placement and movement.
- If you add a game rule, add or update tests in `tests/snakeLogic.test.js` in the same change.

## Change Patterns

### Add a new game rule
1. Add a failing test in `tests/snakeLogic.test.js`.
2. Update only the smallest relevant unit in `src/snakeLogic.js`.
3. Re-run `npm test` until green.

### Adjust controls or UX behavior
1. Update event handling in `src/app.js`.
2. Keep key mapping explicit and prevent default for handled keys.
3. Re-render status and score through existing `render()` flow.

### Adjust board visuals
1. Update semantic classes in `src/app.js` render loop only if needed.
2. Update corresponding class styles in `styles.css`.
3. Keep `index.html` IDs/classes stable unless a task explicitly requires structure changes.
