<script setup lang="ts">
import type { ScoreItem } from '../services/api';

defineProps<{
  items: ScoreItem[];
  loading: boolean;
  error: string;
}>();

const emit = defineEmits<{ refresh: [] }>();
</script>

<template>
  <section class="panel leaderboard">
    <div class="row">
      <h2>Leaderboard</h2>
      <button @click="emit('refresh')" :disabled="loading">Refresh</button>
    </div>

    <p v-if="loading">Loading...</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <ol v-else>
      <li v-for="item in items" :key="item.id">
        <span>{{ item.nickname }}</span>
        <strong>{{ item.score }}</strong>
      </li>
    </ol>
  </section>
</template>
