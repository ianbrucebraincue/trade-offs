<script setup lang="ts">
import { inject } from 'vue'
import MetricsHUD from './MetricsHUD.vue'
import { GAME_KEY } from '@/composables/useGameEngine'
import type { GameEngine } from '@/composables/useGameEngine'
import { scenarios } from '@/data/scenarios'

defineProps<{ isOpen: boolean }>()

const game = inject(GAME_KEY) as GameEngine

const SCENARIO_ICONS = ['🚀', '📈', '🔥', '🧨', '⚖️']
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--open': isOpen }">
    <div class="workspace">
      <span class="workspace-icon">🛠️</span>
      <span class="workspace-name">StartupCo</span>
    </div>

    <div class="section-label">Channels</div>

    <nav class="channels">
      <div
        v-for="(scenario, i) in scenarios"
        :key="scenario.id"
        class="channel-item"
        :class="{
          'channel-item--active': i === game.scenarioIndex.value && game.subPhase.value !== 'outcome',
          'channel-item--visited': i < game.scenarioIndex.value || game.subPhase.value === 'outcome',
        }"
      >
        <span class="channel-hash">#</span>
        <span class="channel-name">{{ scenario.channelName.slice(1) }}</span>
        <span v-if="i === game.scenarioIndex.value && game.subPhase.value !== 'outcome'" class="channel-badge">
          {{ SCENARIO_ICONS[i] }}
        </span>
        <span
          v-else-if="game.decisionHistory.value[i]"
          class="channel-check"
          title="Decision made"
        >✓</span>
      </div>
    </nav>

    <MetricsHUD :metrics="game.metrics" />
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  background: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-bottom: 12px;
}

.workspace {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 8px;
}

.workspace-icon {
  font-size: 18px;
}

.workspace-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--sidebar-text-active);
}

.section-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--sidebar-text-muted);
  padding: 4px 16px 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.channels {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 0 8px;
}

.channel-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  cursor: default;
  transition: background 0.1s;
  opacity: 0.6;
}

.channel-item--active {
  background: var(--sidebar-active);
  opacity: 1;
  cursor: default;
}

.channel-item--visited {
  opacity: 0.85;
}

.channel-item:not(.channel-item--active):not(.channel-item--visited):hover {
  background: var(--sidebar-hover);
}

.channel-hash {
  font-size: 16px;
  color: var(--sidebar-text);
  line-height: 1;
  flex-shrink: 0;
}

.channel-name {
  font-size: 15px;
  color: var(--sidebar-text);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.channel-item--active .channel-name,
.channel-item--active .channel-hash {
  color: var(--sidebar-text-active);
  font-weight: 600;
}

.channel-badge {
  font-size: 14px;
  flex-shrink: 0;
}

.channel-check {
  font-size: 11px;
  color: var(--msg-name-pm);
  font-weight: 700;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    z-index: 50;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    padding-top: calc(14px + env(safe-area-inset-top, 0px));
  }

  .sidebar--open {
    transform: translateX(0);
  }
}
</style>
