<script setup lang="ts">
import type { MetricState, MetricKey } from '@/types/game'
import { METRIC_ICONS, METRIC_LABELS, METRIC_HIGHER_IS_BETTER } from '@/composables/useMetrics'

defineProps<{
  metrics: Readonly<MetricState>
}>()

const METRIC_ORDER: MetricKey[] = [
  'performance',
  'userSatisfaction',
  'maintainability',
  'techDebt',
  'cost',
]

function barColor(key: MetricKey, value: number): string {
  const higherIsBetter = METRIC_HIGHER_IS_BETTER[key]
  const goodValue = higherIsBetter ? value : 100 - value
  if (goodValue >= 65) return 'var(--metric-bar-fill-good)'
  if (goodValue >= 35) return 'var(--metric-bar-fill-warn)'
  return 'var(--metric-bar-fill-bad)'
}
</script>

<template>
  <div class="metrics-hud">
    <p class="hud-title">System Health</p>
    <div class="metric-rows">
      <div
        v-for="key in METRIC_ORDER"
        :key="key"
        class="metric-row"
      >
        <span class="metric-icon">{{ METRIC_ICONS[key] }}</span>
        <div class="metric-info">
          <span class="metric-name">{{ METRIC_LABELS[key] }}</span>
          <div class="bar-track">
            <div
              class="bar-fill"
              :style="{
                width: `${metrics[key]}%`,
                background: barColor(key, metrics[key]),
              }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.metrics-hud {
  padding: 12px 12px 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
}

.hud-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--sidebar-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}

.metric-rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.metric-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.metric-icon {
  font-size: 12px;
  width: 16px;
  text-align: center;
  flex-shrink: 0;
}

.metric-info {
  flex: 1;
  min-width: 0;
}

.metric-name {
  display: block;
  font-size: 11px;
  color: var(--sidebar-text);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bar-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s ease, background 0.6s ease;
}
</style>
