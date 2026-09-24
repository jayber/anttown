<script setup lang="ts">
import { ref, watch, computed } from 'vue';

const antLifespan = ref(600);
const termiteInterval = ref(4);

const formattedAntLifespan = computed(() => {
  const seconds = antLifespan.value;
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
});

const updateLifespan = () => {
  window.dispatchEvent(new CustomEvent('update-ant-lifespan', { detail: antLifespan.value }));
};

const updateTermiteInterval = () => {
  window.dispatchEvent(new CustomEvent('update-termite-spawn-interval', { detail: termiteInterval.value }));
};

// Initial dispatch to ensure Phaser has the initial value if it loads after Vue
watch(antLifespan, updateLifespan, { immediate: true });
watch(termiteInterval, updateTermiteInterval, { immediate: true });
</script>

<template>
  <div class="game-menu">
    <h2>Settings</h2>
    <div class="menu-items">
      
      <div class="settings-section">
        <div class="setting-item">
          <label>Ant Lifespan: {{ formattedAntLifespan }}</label>
          <input 
            type="range" 
            v-model.number="antLifespan" 
            min="10" 
            max="1200" 
            step="10"
          />
        </div>
        <div class="setting-item">
          <label>Termite Spawn: {{ termiteInterval }}s</label>
          <input 
            type="range" 
            v-model.number="termiteInterval" 
            min="0.1" 
            max="30" 
            step="0.1"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.game-menu {
  width: 250px;
  height: 100%;
  background-color: #333;
  color: white;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border-left: 2px solid #555;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .game-menu {
    width: 100%;
    height: auto;
    border-left: none;
    border-top: 2px solid #555;
    padding: 10px;
    gap: 10px;
  }
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  background-color: #444;
  border-radius: 4px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.setting-item label {
  font-size: 0.9rem;
}

input[type="range"] {
  width: 100%;
  cursor: pointer;
}

h2 {
  margin-top: 0;
  border-bottom: 1px solid #555;
  padding-bottom: 10px;
}
</style>
