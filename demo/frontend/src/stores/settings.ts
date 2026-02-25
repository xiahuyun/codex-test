import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Difficulty, GameMode, Theme } from '../game/types';

const DIFFICULTY_INTERVALS: Record<Difficulty, number> = {
  easy: 160,
  normal: 120,
  hard: 90,
};

export const useSettingsStore = defineStore('settings', () => {
  const difficulty = ref<Difficulty>('normal');
  const mode = ref<GameMode>('classic');
  const theme = ref<Theme>('sunset');
  const soundEnabled = ref(true);

  const tickInterval = computed(() => DIFFICULTY_INTERVALS[difficulty.value]);

  return {
    difficulty,
    mode,
    theme,
    soundEnabled,
    tickInterval,
  };
});
