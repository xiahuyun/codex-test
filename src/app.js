import { createInitialState, stepGame } from "./snakeLogic.js";

const TICK_MS = 220;

const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const touchControls = document.querySelector(".touch-controls");

let state = createInitialState({ rows: 16, cols: 16 });
let pendingDirection = state.direction;
let paused = false;

function statusText() {
  if (state.gameOver) {
    return "Game over";
  }
  return paused ? "Paused" : "Running";
}

function buildBoard() {
  const total = state.rows * state.cols;
  boardEl.style.gridTemplateColumns = `repeat(${state.cols}, 1fr)`;
  boardEl.style.gridTemplateRows = `repeat(${state.rows}, 1fr)`;
  boardEl.innerHTML = "";

  for (let i = 0; i < total; i += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    boardEl.appendChild(cell);
  }
}

function render() {
  const cells = boardEl.children;
  for (const cell of cells) {
    cell.className = "cell";
  }

  for (const obstacle of state.obstacles ?? []) {
    const index = obstacle.y * state.cols + obstacle.x;
    if (cells[index]) {
      cells[index].classList.add("obstacle");
    }
  }

  for (const segment of state.snake) {
    const index = segment.y * state.cols + segment.x;
    if (cells[index]) {
      cells[index].classList.add("snake");
    }
  }

  if (state.food) {
    const foodIndex = state.food.y * state.cols + state.food.x;
    if (cells[foodIndex]) {
      cells[foodIndex].classList.add("food");
    }
  }

  scoreEl.textContent = String(state.score);
  statusEl.textContent = statusText();
  pauseBtn.textContent = paused ? "Resume" : "Pause";
}

function resetGame() {
  state = createInitialState({ rows: state.rows, cols: state.cols });
  pendingDirection = state.direction;
  paused = false;
  buildBoard();
  render();
}

function queueDirection(direction) {
  if (state.gameOver) {
    return;
  }
  pendingDirection = direction;
}

function togglePause() {
  if (state.gameOver) {
    return;
  }
  paused = !paused;
  render();
}

function tick() {
  if (!paused && !state.gameOver) {
    state = stepGame(state, pendingDirection);
    pendingDirection = state.direction;
    render();
  }
}

function keyToDirection(key) {
  switch (key) {
    case "ArrowUp":
    case "w":
    case "W":
      return "up";
    case "ArrowDown":
    case "s":
    case "S":
      return "down";
    case "ArrowLeft":
    case "a":
    case "A":
      return "left";
    case "ArrowRight":
    case "d":
    case "D":
      return "right";
    default:
      return null;
  }
}

document.addEventListener("keydown", (event) => {
  const direction = keyToDirection(event.key);
  if (direction) {
    event.preventDefault();
    queueDirection(direction);
    return;
  }

  if (event.key === " ") {
    event.preventDefault();
    togglePause();
  }

  if (event.key === "r" || event.key === "R") {
    event.preventDefault();
    resetGame();
  }
});

pauseBtn.addEventListener("click", togglePause);
restartBtn.addEventListener("click", resetGame);

touchControls.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const dir = target.dataset.dir;
  if (dir) {
    queueDirection(dir);
  }
});

buildBoard();
render();
setInterval(tick, TICK_MS);
