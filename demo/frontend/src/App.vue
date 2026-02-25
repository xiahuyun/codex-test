<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import GameCanvas from './components/GameCanvas.vue';
import HUDPanel from './components/HUDPanel.vue';
import LeaderboardPanel from './components/LeaderboardPanel.vue';
import { GameEngine } from './game/engine';
import { canTurn, createInitialState, stepGame } from './game/state';
import { registerKeyboardInput } from './game/input/keyboard';
import type { Direction } from './game/types';
import { fetchLeaderboard, submitScore, type ScoreItem } from './services/api';
import { useScoreStore } from './stores/score';
import { useSettingsStore } from './stores/settings';

const settings = useSettingsStore();
const scoreStore = useScoreStore();

const gameState = ref(createInitialState(settings.mode));
const paused = ref(false);
const queuedDirection = ref<Direction | null>(null);
const frame = ref(0);
const leaderboard = ref<ScoreItem[]>([]);
const leaderboardLoading = ref(false);
const leaderboardError = ref('');
const submitBusy = ref(false);
const submitError = ref('');
const lastSubmittedScore = ref<number | null>(null);

const durationMs = computed(() => {
  if (gameState.value.endedAt) {
    return gameState.value.endedAt - gameState.value.startedAt;
  }
  return Date.now() - gameState.value.startedAt;
});

const engine = new GameEngine(
  () => settings.tickInterval,
  () => {
    if (paused.value) {
      return;
    }

    const previousScore = gameState.value.score;
    const result = stepGame(gameState.value, queuedDirection.value);
    queuedDirection.value = null;
    if (gameState.value.score > previousScore) {
      playEatTone();
    }
    if (result.gameOver) {
      scoreStore.updateHighScore(gameState.value.score);
      playGameOverTone();
    }
  },
  () => {
    frame.value += 1;
  },
);

function enqueueDirection(direction: Direction): void {
  if (queuedDirection.value || gameState.value.isGameOver) {
    return;
  }

  if (!canTurn(gameState.value.direction, direction)) {
    return;
  }

  queuedDirection.value = direction;
}

function restartGame(): void {
  gameState.value = createInitialState(settings.mode);
  paused.value = false;
  queuedDirection.value = null;
  submitError.value = '';
  lastSubmittedScore.value = null;
}

function togglePause(): void {
  paused.value = !paused.value;
}

async function refreshLeaderboard(): Promise<void> {
  leaderboardLoading.value = true;
  leaderboardError.value = '';
  try {
    const response = await fetchLeaderboard(settings.mode, 50);
    leaderboard.value = response.items;
  } catch (error) {
    leaderboardError.value = error instanceof Error ? error.message : 'Failed to fetch leaderboard';
  } finally {
    leaderboardLoading.value = false;
  }
}

async function handleSubmitScore(): Promise<void> {
  submitError.value = '';
  if (!gameState.value.isGameOver) {
    submitError.value = 'Finish the game before submitting.';
    return;
  }

  const nickname = scoreStore.nickname.trim();
  if (!/^[A-Za-z0-9_]{1,16}$/.test(nickname)) {
    submitError.value = 'Nickname must be 1-16 chars: letters, numbers, underscore.';
    return;
  }

  submitBusy.value = true;
  try {
    await submitScore({
      nickname,
      score: gameState.value.score,
      mode: settings.mode,
      duration_ms: durationMs.value,
      client_ts: new Date().toISOString(),
    });
    lastSubmittedScore.value = gameState.value.score;
    await refreshLeaderboard();
  } catch (error) {
    submitError.value = error instanceof Error ? `${error.message} (retry available)` : 'Submit failed';
  } finally {
    submitBusy.value = false;
  }
}

watch(
  () => settings.mode,
  () => {
    restartGame();
    refreshLeaderboard();
  },
);

let cleanupKeyboard: (() => void) | null = null;

function playTone(frequency: number, duration = 0.08): void {
  if (!settings.soundEnabled) {
    return;
  }

  const context = new AudioContext();
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = 'square';
  osc.frequency.value = frequency;
  gain.gain.value = 0.05;
  osc.connect(gain);
  gain.connect(context.destination);
  osc.start();
  osc.stop(context.currentTime + duration);
  osc.onended = () => {
    void context.close();
  };
}

function playEatTone(): void {
  playTone(620, 0.05);
}

function playGameOverTone(): void {
  playTone(220, 0.15);
}

onMounted(() => {
  cleanupKeyboard = registerKeyboardInput(enqueueDirection);
  engine.start();
  void refreshLeaderboard();
});

onUnmounted(() => {
  cleanupKeyboard?.();
  engine.stop();
});
</script>

<template>
  <main class="layout">
    <GameCanvas :state="gameState" :frame="frame" :theme="settings.theme" @direction="enqueueDirection" />

    <section class="sidebar">
      <HUDPanel
        :state="gameState"
        :high-score="scoreStore.highScore"
        :difficulty="settings.difficulty"
        :mode="settings.mode"
        :theme="settings.theme"
        :sound-enabled="settings.soundEnabled"
        :paused="paused"
        :nickname="scoreStore.nickname"
        :submit-busy="submitBusy"
        :submit-error="submitError"
        :last-submitted-score="lastSubmittedScore"
        @restart="restartGame"
        @toggle-pause="togglePause"
        @difficulty="settings.difficulty = $event"
        @mode="settings.mode = $event"
        @theme="settings.theme = $event"
        @sound="settings.soundEnabled = $event"
        @nickname="scoreStore.nickname = $event"
        @submit="handleSubmitScore"
      />

      <LeaderboardPanel :items="leaderboard" :loading="leaderboardLoading" :error="leaderboardError" @refresh="refreshLeaderboard" />
    </section>
  </main>
</template>
