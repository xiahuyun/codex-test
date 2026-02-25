import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
const HIGH_SCORE_KEY = 'snake_high_score';
const NICKNAME_KEY = 'snake_nickname';
export const useScoreStore = defineStore('score', () => {
    const highScore = ref(Number(localStorage.getItem(HIGH_SCORE_KEY) ?? 0));
    const nickname = ref(localStorage.getItem(NICKNAME_KEY) ?? '');
    function updateHighScore(score) {
        if (score > highScore.value) {
            highScore.value = score;
        }
    }
    watch(highScore, (value) => {
        localStorage.setItem(HIGH_SCORE_KEY, String(value));
    });
    watch(nickname, (value) => {
        localStorage.setItem(NICKNAME_KEY, value);
    });
    return {
        highScore,
        nickname,
        updateHighScore,
    };
});
