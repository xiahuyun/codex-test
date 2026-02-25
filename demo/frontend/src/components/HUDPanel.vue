<script setup lang="ts">
import type { Difficulty, GameMode, GameState, Theme } from '../game/types';

defineProps<{
  state: GameState;
  highScore: number;
  difficulty: Difficulty;
  mode: GameMode;
  theme: Theme;
  soundEnabled: boolean;
  paused: boolean;
  nickname: string;
  submitBusy: boolean;
  submitError: string;
  lastSubmittedScore: number | null;
}>();

const emit = defineEmits<{
  restart: [];
  togglePause: [];
  difficulty: [value: Difficulty];
  mode: [value: GameMode];
  theme: [value: Theme];
  sound: [value: boolean];
  nickname: [value: string];
  submit: [];
}>();
</script>

<template>
  <section class="panel">
    <h1>Snake Arena</h1>
    <p>Score: <strong>{{ state.score }}</strong> | High: <strong>{{ highScore }}</strong></p>

    <div class="row">
      <button @click="emit('togglePause')" :disabled="state.isGameOver">{{ paused ? 'Resume' : 'Pause' }}</button>
      <button @click="emit('restart')">Restart</button>
    </div>

    <label>
      Difficulty
      <select :value="difficulty" @change="emit('difficulty', ($event.target as HTMLSelectElement).value as Difficulty)">
        <option value="easy">easy</option>
        <option value="normal">normal</option>
        <option value="hard">hard</option>
      </select>
    </label>

    <label>
      Mode
      <select :value="mode" @change="emit('mode', ($event.target as HTMLSelectElement).value as GameMode)">
        <option value="classic">classic</option>
        <option value="obstacle">obstacle</option>
      </select>
    </label>

    <label>
      Theme
      <select :value="theme" @change="emit('theme', ($event.target as HTMLSelectElement).value as Theme)">
        <option value="sunset">sunset</option>
        <option value="mint">mint</option>
        <option value="mono">mono</option>
      </select>
    </label>

    <label class="row checkbox">
      <input type="checkbox" :checked="soundEnabled" @change="emit('sound', ($event.target as HTMLInputElement).checked)" />
      Sound enabled
    </label>

    <label>
      Nickname
      <input
        maxlength="16"
        pattern="[A-Za-z0-9_]+"
        :value="nickname"
        @input="emit('nickname', ($event.target as HTMLInputElement).value)"
        placeholder="player_1"
      />
    </label>

    <button @click="emit('submit')" :disabled="!state.isGameOver || submitBusy">
      {{ submitBusy ? 'Submitting...' : 'Submit Score' }}
    </button>
    <p v-if="submitError" class="error">{{ submitError }}</p>
    <p v-if="lastSubmittedScore === state.score && state.isGameOver" class="ok">Submitted score: {{ state.score }}</p>

    <p v-if="state.isGameOver" class="error">Game Over</p>
  </section>
</template>
