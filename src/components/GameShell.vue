<script setup lang="ts">
import { ref, watchEffect, inject } from 'vue'
import AppSidebar from './AppSidebar.vue'
import ChatPane from './ChatPane.vue'
import OutcomeSummary from './OutcomeSummary.vue'
import { GAME_KEY } from '@/composables/useGameEngine'
import type { GameEngine } from '@/composables/useGameEngine'

const game = inject(GAME_KEY) as GameEngine
const sidebarOpen = ref(false)

watchEffect((onCleanup) => {
  if (sidebarOpen.value) {
    document.body.classList.add('no-scroll')
  } else {
    document.body.classList.remove('no-scroll')
  }
  onCleanup(() => document.body.classList.remove('no-scroll'))
})
</script>

<template>
  <div class="game-shell">
    <AppSidebar :is-open="sidebarOpen" />

    <div
      v-if="sidebarOpen"
      class="overlay"
      @click="sidebarOpen = false"
    />

    <ChatPane @menu-click="sidebarOpen = true" />

    <OutcomeSummary v-if="game.subPhase.value === 'outcome'" />
  </div>
</template>

<style scoped>
.game-shell {
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
}

.overlay {
  display: none;
}

@media (max-width: 768px) {
  .overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 40;
  }
}
</style>
