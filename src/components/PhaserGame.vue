<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { startGame } from '../game/main';

const gameContainer = ref<HTMLDivElement | null>(null);
let game: Phaser.Game | null = null;

onMounted(() => {
    if (gameContainer.value) {
        game = startGame(gameContainer.value.id);
    }
});

onUnmounted(() => {
    if (game) {
        game.destroy(true);
        game = null;
    }
});
</script>

<template>
    <div id="game-container" ref="gameContainer"></div>
</template>

<style scoped>
#game-container {
    width: 100%;
    height: 100%;
}
</style>
