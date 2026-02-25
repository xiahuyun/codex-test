import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUiStore = defineStore('ui', () => {
  const leaderboardVisible = ref(true);

  function toggleLeaderboard(): void {
    leaderboardVisible.value = !leaderboardVisible.value;
  }

  return {
    leaderboardVisible,
    toggleLeaderboard,
  };
});
