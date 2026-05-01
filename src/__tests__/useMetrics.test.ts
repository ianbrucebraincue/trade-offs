import { describe, it, expect } from 'vitest'
import {
  applyDeltas,
  evaluateCondition,
  resetMetrics,
  INITIAL_METRICS,
} from '@/composables/useMetrics'
import type { MetricDelta, OutcomeCondition } from '@/types/game'

describe('resetMetrics', () => {
  it('returns all metrics at 50', () => {
    const m = resetMetrics()
    expect(m.performance).toBe(50)
    expect(m.cost).toBe(50)
    expect(m.maintainability).toBe(50)
    expect(m.userSatisfaction).toBe(50)
    expect(m.techDebt).toBe(50)
  })

  it('returns a new object each call', () => {
    expect(resetMetrics()).not.toBe(INITIAL_METRICS)
  })
})

describe('applyDeltas', () => {
  it('adds deltas to the correct metrics', () => {
    const deltas: MetricDelta[] = [
      { metric: 'performance', delta: 10, hidden: false },
      { metric: 'techDebt', delta: 20, hidden: true },
    ]
    const result = applyDeltas(resetMetrics(), deltas)
    expect(result.performance).toBe(60)
    expect(result.techDebt).toBe(70)
    expect(result.cost).toBe(50) // unchanged
  })

  it('clamps values at 100', () => {
    const deltas: MetricDelta[] = [{ metric: 'performance', delta: 100, hidden: false }]
    const result = applyDeltas(resetMetrics(), deltas)
    expect(result.performance).toBe(100)
  })

  it('clamps values at 0', () => {
    const deltas: MetricDelta[] = [{ metric: 'maintainability', delta: -100, hidden: false }]
    const result = applyDeltas(resetMetrics(), deltas)
    expect(result.maintainability).toBe(0)
  })

  it('does not mutate the original metrics', () => {
    const original = resetMetrics()
    const deltas: MetricDelta[] = [{ metric: 'performance', delta: 10, hidden: false }]
    applyDeltas(original, deltas)
    expect(original.performance).toBe(50)
  })

  it('applies multiple deltas to the same metric', () => {
    const deltas: MetricDelta[] = [
      { metric: 'techDebt', delta: 15, hidden: false },
      { metric: 'techDebt', delta: 10, hidden: true },
    ]
    const result = applyDeltas(resetMetrics(), deltas)
    expect(result.techDebt).toBe(75)
  })
})

describe('evaluateCondition', () => {
  const metrics = { ...INITIAL_METRICS, techDebt: 70, performance: 30 }

  it('evaluates gt correctly', () => {
    const c: OutcomeCondition = { metric: 'techDebt', operator: 'gt', threshold: 60 }
    expect(evaluateCondition(c, metrics)).toBe(true)
    const c2: OutcomeCondition = { metric: 'techDebt', operator: 'gt', threshold: 70 }
    expect(evaluateCondition(c2, metrics)).toBe(false)
  })

  it('evaluates gte correctly', () => {
    const c: OutcomeCondition = { metric: 'techDebt', operator: 'gte', threshold: 70 }
    expect(evaluateCondition(c, metrics)).toBe(true)
    const c2: OutcomeCondition = { metric: 'techDebt', operator: 'gte', threshold: 71 }
    expect(evaluateCondition(c2, metrics)).toBe(false)
  })

  it('evaluates lt correctly', () => {
    const c: OutcomeCondition = { metric: 'performance', operator: 'lt', threshold: 40 }
    expect(evaluateCondition(c, metrics)).toBe(true)
    const c2: OutcomeCondition = { metric: 'performance', operator: 'lt', threshold: 30 }
    expect(evaluateCondition(c2, metrics)).toBe(false)
  })

  it('evaluates lte correctly', () => {
    const c: OutcomeCondition = { metric: 'performance', operator: 'lte', threshold: 30 }
    expect(evaluateCondition(c, metrics)).toBe(true)
    const c2: OutcomeCondition = { metric: 'performance', operator: 'lte', threshold: 29 }
    expect(evaluateCondition(c2, metrics)).toBe(false)
  })
})
