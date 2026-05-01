<script setup lang="ts">
import { inject } from 'vue'
import { GAME_KEY } from '@/composables/useGameEngine'
import type { GameEngine } from '@/composables/useGameEngine'
import { METRIC_ICONS, METRIC_LABELS, METRIC_HIGHER_IS_BETTER } from '@/composables/useMetrics'
import type { MetricKey } from '@/types/game'

const game = inject(GAME_KEY) as GameEngine

function barColor(key: MetricKey, value: number): string {
  const higherIsBetter = METRIC_HIGHER_IS_BETTER[key]
  const goodValue = higherIsBetter ? value : 100 - value
  if (goodValue >= 65) return '#2eb67d'
  if (goodValue >= 35) return '#ecb22e'
  return '#e01e5a'
}
</script>

<template>
  <div class="outcome-overlay">
    <div class="outcome-card">
      <!-- Header -->
      <div class="outcome-header">
        <div class="outcome-logo">🏗️</div>
        <p class="outcome-label">Final Report — StartupCo</p>
        <h1 class="outcome-headline">
          {{ game.outcomeResult.value.theme.headline }}
        </h1>
        <p class="outcome-body">
          {{ game.outcomeResult.value.theme.body }}
        </p>
      </div>

      <!-- Metrics -->
      <div class="metrics-section">
        <h3 class="section-title">System Metrics</h3>
        <div class="metric-list">
          <div v-for="band in game.outcomeResult.value.bands" :key="band.key" class="metric-item">
            <div class="metric-top">
              <span class="metric-icon">{{ METRIC_ICONS[band.key] }}</span>
              <span class="metric-label">{{ METRIC_LABELS[band.key] }}</span>
              <span class="metric-band-label">{{ band.label }}</span>
            </div>
            <div class="bar-track">
              <div
                class="bar-fill"
                :style="{
                  width: `${band.value}%`,
                  background: barColor(band.key as MetricKey, band.value),
                }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <button class="restart-btn" @click="game.restartGame()">Play Again</button>
    </div>
  </div>
</template>

<style scoped>
.outcome-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 24px;
  animation: fadeIn 0.4s ease-out;
  overflow-y: auto;
}

.outcome-card {
  background: #1d1c1d;
  color: #ffffff;
  border-radius: var(--radius-lg);
  padding: 40px;
  max-width: 600px;
  width: 100%;
  box-shadow: var(--shadow-md);
  animation: slideUp 0.4s ease-out;
}

.outcome-header {
  margin-bottom: 32px;
  text-align: center;
}

.outcome-logo {
  font-size: 40px;
  margin-bottom: 8px;
}

.outcome-label {
  font-size: 12px;
  font-weight: 700;
  color: #ababad;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
}

.outcome-headline {
  font-size: 24px;
  font-weight: 800;
  line-height: 1.3;
  margin-bottom: 12px;
  color: #ffffff;
}

.outcome-body {
  font-size: 15px;
  color: #c9c9ca;
  line-height: 1.6;
}

.section-title {
  font-size: 12px;
  font-weight: 700;
  color: #ababad;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
}

.metrics-section {
  margin-bottom: 28px;
}

.metric-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.metric-item {
}

.metric-top {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.metric-icon {
  font-size: 14px;
}

.metric-label {
  font-size: 14px;
  color: #e8e8e8;
  flex: 1;
}

.metric-band-label {
  font-size: 13px;
  color: #ababad;
  font-style: italic;
}

.bar-track {
  height: 6px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 1s ease;
}

.decisions-section {
  margin-bottom: 28px;
}

.decision-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.decision-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-sm);
}

.decision-num {
  font-size: 12px;
  font-weight: 700;
  color: #ababad;
  width: 16px;
  flex-shrink: 0;
  margin-top: 2px;
}

.decision-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.decision-choice {
  font-size: 14px;
  font-weight: 600;
  color: #e8e8e8;
}

.decision-tagline {
  font-size: 13px;
  color: #ababad;
  font-style: italic;
}

.restart-btn {
  width: 100%;
  padding: 14px;
  background: #1164a3;
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.restart-btn:hover {
  background: #0f5290;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
