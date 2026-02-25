<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { registerSwipeInput } from '../game/input/touch';
import type { Direction, GameState, Theme } from '../game/types';

const props = defineProps<{
  state: GameState;
  frame: number;
  theme: Theme;
}>();

const emit = defineEmits<{
  direction: [value: Direction];
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const wrapperRef = ref<HTMLElement | null>(null);
let cleanupSwipe: (() => void) | null = null;

const themePalette: Record<Theme, { bg: string; snake: string; food: string; obstacle: string; grid: string }> = {
  sunset: { bg: '#1f1f25', snake: '#ffd166', food: '#ef476f', obstacle: '#4a4e69', grid: '#2f3244' },
  mint: { bg: '#0f1e1e', snake: '#95d5b2', food: '#ff6b6b', obstacle: '#2d6a4f', grid: '#1a3d3a' },
  mono: { bg: '#111', snake: '#ddd', food: '#fff', obstacle: '#666', grid: '#222' },
};

function draw(): void {
  const canvas = canvasRef.value;
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  const palette = themePalette[props.theme];
  const cell = canvas.width / props.state.gridSize;

  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = palette.grid;
  ctx.lineWidth = 1;
  for (let i = 0; i <= props.state.gridSize; i += 1) {
    const v = i * cell;
    ctx.beginPath();
    ctx.moveTo(v, 0);
    ctx.lineTo(v, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, v);
    ctx.lineTo(canvas.width, v);
    ctx.stroke();
  }

  ctx.fillStyle = palette.obstacle;
  for (const obstacle of props.state.obstacles) {
    ctx.fillRect(obstacle.x * cell + 1, obstacle.y * cell + 1, cell - 2, cell - 2);
  }

  ctx.fillStyle = palette.food;
  ctx.fillRect(props.state.food.x * cell + 2, props.state.food.y * cell + 2, cell - 4, cell - 4);

  ctx.fillStyle = palette.snake;
  props.state.snake.forEach((segment, index) => {
    const inset = index === 0 ? 1 : 3;
    ctx.fillRect(segment.x * cell + inset, segment.y * cell + inset, cell - inset * 2, cell - inset * 2);
  });
}

onMounted(() => {
  draw();
  if (wrapperRef.value) {
    cleanupSwipe = registerSwipeInput(wrapperRef.value, (direction) => emit('direction', direction));
  }
});

onUnmounted(() => {
  cleanupSwipe?.();
});

watch(() => props.frame, draw);
</script>

<template>
  <section class="board-wrap" ref="wrapperRef">
    <canvas ref="canvasRef" width="480" height="480" aria-label="Snake game board" />
    <div class="dpad" aria-label="Touch controls">
      <button @click="emit('direction', 'up')">↑</button>
      <div>
        <button @click="emit('direction', 'left')">←</button>
        <button @click="emit('direction', 'down')">↓</button>
        <button @click="emit('direction', 'right')">→</button>
      </div>
    </div>
  </section>
</template>
