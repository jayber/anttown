<script setup lang="ts">
import PhaserGame from './components/PhaserGame.vue'
import GameMenu from './components/GameMenu.vue'

const refreshApp = () => {
  window.location.reload();
};
</script>

<template>
  <div class="app-container">
    <button class="refresh-button" @click="refreshApp">Refresh</button>
    <div class="game-wrapper">
      <PhaserGame />
    </div>
    <GameMenu />
  </div>
</template>

<style>
.app-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  position: relative;
}

@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
  }
}

.game-wrapper {
  flex: 1;
  position: relative;
  min-height: 0;
  min-width: 0;
}

.refresh-button {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  padding: 8px 16px;
  background-color: #555;
  color: white;
  border: 1px solid #777;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.refresh-button:hover {
  background-color: #777;
}
</style>
