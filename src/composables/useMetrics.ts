import type { MetricKey, MetricState, MetricDelta, OutcomeCondition } from '@/types/game'

export const INITIAL_METRICS: Readonly<MetricState> = {
  performance: 50,
  cost: 50,
  maintainability: 50,
  userSatisfaction: 50,
  techDebt: 50,
}

export const METRIC_LABELS: Record<MetricKey, string> = {
  performance: 'Performance',
  cost: 'Cost',
  maintainability: 'Maintainability',
  userSatisfaction: 'User Satisfaction',
  techDebt: 'Tech Debt',
}

export const METRIC_ICONS: Record<MetricKey, string> = {
  performance: '⚡',
  cost: '💸',
  maintainability: '🧠',
  userSatisfaction: '😊',
  techDebt: '🔥',
}

/**
 * Higher value = better for these metrics.
 * Lower value = better for these metrics (inverted display).
 */
export const METRIC_HIGHER_IS_BETTER: Record<MetricKey, boolean> = {
  performance: true,
  cost: false,
  maintainability: true,
  userSatisfaction: true,
  techDebt: false,
}

export function applyDeltas(
  current: Readonly<MetricState>,
  deltas: MetricDelta[],
): MetricState {
  const next = { ...current }
  for (const d of deltas) {
    next[d.metric] = Math.max(0, Math.min(100, next[d.metric] + d.delta))
  }
  return next
}

export function evaluateCondition(
  condition: OutcomeCondition,
  metrics: Readonly<MetricState>,
): boolean {
  const value = metrics[condition.metric]
  switch (condition.operator) {
    case 'gt': return value > condition.threshold
    case 'lt': return value < condition.threshold
    case 'gte': return value >= condition.threshold
    case 'lte': return value <= condition.threshold
  }
}

export function resetMetrics(): MetricState {
  return { ...INITIAL_METRICS }
}
