import { describe, expect, test } from 'vitest';
import { createInitialState, spawnFood, stepGame } from '../state';

describe('game state', () => {
  test('snake eats food and grows', () => {
    const state = createInitialState('classic');
    state.food = { x: state.snake[0].x + 1, y: state.snake[0].y };

    const beforeLength = state.snake.length;
    const result = stepGame(state, 'right');

    expect(result.ateFood).toBe(true);
    expect(state.snake.length).toBe(beforeLength + 1);
    expect(state.score).toBe(10);
  });

  test('food does not spawn on snake body', () => {
    const state = createInitialState('obstacle');
    const food = spawnFood(state.snake, state.obstacles, state.gridSize);
    const onSnake = state.snake.some((segment) => segment.x === food.x && segment.y === food.y);

    expect(onSnake).toBe(false);
  });
});
