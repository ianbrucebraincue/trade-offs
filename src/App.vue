<script setup lang="ts">
import { provide } from 'vue'
import GameShell from '@/components/GameShell.vue'
import { useGameEngine, GAME_KEY } from '@/composables/useGameEngine'

const game = useGameEngine()
provide(GAME_KEY, game)
</script>

<template>
  <GameShell />
</template>

<style scoped></style>
