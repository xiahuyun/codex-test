import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
const DIFFICULTY_INTERVALS = {
    easy: 200,
    normal: 160,
    hard: 90,
};
export const useSettingsStore = defineStore('settings', () => {
    const difficulty = ref('normal');
    const mode = ref('classic');
    const theme = ref('sunset');
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
