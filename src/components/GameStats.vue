<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const timeStr = ref('00:00');
const antCount = ref(0);

const handleStatsUpdate = (event: any) => {
  const { time, ants } = event.detail;
  antCount.value = ants;
  
  const minutes = Math.floor(time / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  timeStr.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

onMounted(() => {
  window.addEventListener('game-stats-update', handleStatsUpdate);
});

onUnmounted(() => {
  window.removeEventListener('game-stats-update', handleStatsUpdate);
});
</script>

<template>
  <div class="game-stats">
    <div class="stat-item">Time: {{ timeStr }}</div>
    <div class="stat-item">Ants: {{ antCount }}</div>
  </div>
</template>

<style scoped>
.game-stats {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  display: flex;
  gap: 24px;
  pointer-events: none;
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 100;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .game-stats {
    bottom: 10px;
    font-size: 0.85rem;
    padding: 6px 16px;
    gap: 16px;
  }
}
</style>
