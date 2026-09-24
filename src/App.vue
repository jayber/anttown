<script setup lang="ts">
import PhaserGame from './components/PhaserGame.vue'
import GameMenu from './components/GameMenu.vue'
</script>

<template>
  <div class="app-container">
    <div class="game-wrapper">
      <PhaserGame />
    </div>
    <GameMenu />
  </div>
</template>

<style>
.app-container {
  display: flex;
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.game-wrapper {
  flex: 1;
  position: relative;
}
</style>
