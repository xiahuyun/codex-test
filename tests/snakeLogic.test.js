import test from "node:test";
import assert from "node:assert/strict";
import {
  createInitialState,
  placeFood,
  placeObstacles,
  stepGame,
  getNextDirection,
} from "../src/snakeLogic.js";

test("moves one tile in current direction", () => {
  const state = {
    rows: 8,
    cols: 8,
    snake: [{ x: 3, y: 3 }],
    direction: "right",
    food: { x: 0, y: 0 },
    score: 0,
    gameOver: false,
  };

  const next = stepGame(state, "right", () => 0);
  assert.deepEqual(next.snake, [{ x: 4, y: 3 }]);
  assert.equal(next.score, 0);
  assert.equal(next.gameOver, false);
});

test("snake grows and score increases when food is eaten", () => {
  const state = {
    rows: 8,
    cols: 8,
    snake: [{ x: 3, y: 3 }],
    direction: "right",
    food: { x: 4, y: 3 },
    score: 0,
    gameOver: false,
  };

  const next = stepGame(state, "right", () => 0);
  assert.equal(next.snake.length, 2);
  assert.equal(next.score, 1);
  assert.deepEqual(next.snake[0], { x: 4, y: 3 });
});

test("wall collision ends the game", () => {
  const state = {
    rows: 4,
    cols: 4,
    snake: [{ x: 3, y: 1 }],
    direction: "right",
    food: { x: 0, y: 0 },
    score: 0,
    gameOver: false,
  };

  const next = stepGame(state, "right", () => 0);
  assert.equal(next.gameOver, true);
});

test("self collision ends the game", () => {
  const state = {
    rows: 6,
    cols: 6,
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 3, y: 2 },
      { x: 3, y: 1 },
    ],
    direction: "up",
    food: { x: 5, y: 5 },
    score: 0,
    gameOver: false,
  };

  const next = stepGame(state, "right", () => 0);
  assert.equal(next.gameOver, true);
});

test("food placement never overlaps snake and is deterministic", () => {
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
  ];

  const food = placeFood(3, 3, snake, [], () => 0);
  assert.deepEqual(food, { x: 0, y: 1 });
});

test("cannot reverse direction when snake length is greater than one", () => {
  const direction = getNextDirection("left", "right", 3);
  assert.equal(direction, "left");
});

test("initial state is valid", () => {
  const state = createInitialState({
    rows: 10,
    cols: 10,
    obstacleCount: 0,
    rng: () => 0,
  });
  assert.equal(state.snake.length, 1);
  assert.equal(state.obstacles.length, 0);
  assert.equal(state.gameOver, false);
  assert.equal(state.score, 0);
  assert.notDeepEqual(state.food, state.snake[0]);
});

test("invalid requested direction keeps current direction", () => {
  const direction = getNextDirection("up", "bad-direction", 2);
  assert.equal(direction, "up");
});

test("placeFood returns null when board is full", () => {
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ];

  const food = placeFood(2, 2, snake, [], () => 0);
  assert.equal(food, null);
});

test("stepGame returns same state when game is already over", () => {
  const state = {
    rows: 4,
    cols: 4,
    snake: [{ x: 1, y: 1 }],
    direction: "right",
    food: { x: 2, y: 2 },
    score: 3,
    gameOver: true,
  };

  const next = stepGame(state, "left", () => 0);
  assert.equal(next, state);
});

test("obstacle placement avoids snake and respects obstacle count", () => {
  const snake = [{ x: 1, y: 1 }];
  const obstacles = placeObstacles(4, 4, snake, 3, () => 0);

  assert.equal(obstacles.length, 3);
  for (const obstacle of obstacles) {
    assert.notDeepEqual(obstacle, snake[0]);
  }
});

test("food placement avoids obstacles", () => {
  const snake = [{ x: 0, y: 0 }];
  const obstacles = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];

  const food = placeFood(2, 2, snake, obstacles, () => 0);
  assert.deepEqual(food, { x: 1, y: 1 });
});

test("obstacle collision ends the game", () => {
  const state = {
    rows: 6,
    cols: 6,
    snake: [{ x: 2, y: 2 }],
    obstacles: [{ x: 3, y: 2 }],
    direction: "right",
    food: { x: 0, y: 0 },
    score: 0,
    gameOver: false,
  };

  const next = stepGame(state, "right", () => 0);
  assert.equal(next.gameOver, true);
});
