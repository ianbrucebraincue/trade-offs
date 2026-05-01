import { describe, it, expect } from 'vitest'
import { scenarios } from '@/data/scenarios'
import outcomesData from '@/data/outcomes.json'
import type { OutcomesData } from '@/types/game'

const outcomes = outcomesData as OutcomesData

describe('Scenario data validation', () => {
  it('loads exactly 5 scenarios', () => {
    expect(scenarios).toHaveLength(5)
  })

  it('each scenario has required fields', () => {
    for (const s of scenarios) {
      expect(s.id).toBeTruthy()
      expect(s.title).toBeTruthy()
      expect(s.channelName).toBeTruthy()
      expect(s.openingMessages.length).toBeGreaterThan(0)
      expect(s.choices).toHaveLength(3)
    }
  })

  it('each choice has required fields', () => {
    for (const scenario of scenarios) {
      for (const choice of scenario.choices) {
        expect(choice.id).toBeTruthy()
        expect(choice.label).toBeTruthy()
        expect(choice.subtext).toBeTruthy()
        expect(choice.tagline).toBeTruthy()
        expect(Array.isArray(choice.metricDeltas)).toBe(true)
        expect(choice.metricDeltas.length).toBeGreaterThan(0)
        expect(Array.isArray(choice.followUpMessages)).toBe(true)
        expect(choice.followUpMessages.length).toBeGreaterThan(0)
      }
    }
  })

  it('each message has required fields', () => {
    for (const scenario of scenarios) {
      const allMessages = [
        ...scenario.openingMessages,
        ...scenario.choices.flatMap((c) => c.followUpMessages),
      ]
      for (const msg of allMessages) {
        expect(msg.id).toBeTruthy()
        expect(msg.from).toBeTruthy()
        expect(msg.text).toBeTruthy()
        expect(typeof msg.delayMs).toBe('number')
      }
    }
  })

  it('metric delta values reference valid metric keys', () => {
    const validKeys = new Set(['performance', 'cost', 'maintainability', 'userSatisfaction', 'techDebt'])
    for (const scenario of scenarios) {
      for (const choice of scenario.choices) {
        for (const delta of choice.metricDeltas) {
          expect(validKeys.has(delta.metric)).toBe(true)
          expect(typeof delta.delta).toBe('number')
          expect(typeof delta.hidden).toBe('boolean')
        }
      }
    }
  })

  it('choice IDs are unique across all scenarios', () => {
    const ids = scenarios.flatMap((s) => s.choices.map((c) => c.id))
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('message IDs are unique across all scenarios', () => {
    const ids = scenarios.flatMap((s) => [
      ...s.openingMessages.map((m) => m.id),
      ...s.choices.flatMap((c) => c.followUpMessages.map((m) => m.id)),
    ])
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })
})

describe('Outcomes data validation', () => {
  it('has at least one theme', () => {
    expect(outcomes.themes.length).toBeGreaterThan(0)
  })

  it('has a default theme with empty conditions', () => {
    const defaultTheme = outcomes.themes.find((t) => t.conditions.length === 0)
    expect(defaultTheme).toBeDefined()
  })

  it('has metric bands for all 5 metric keys', () => {
    const keys = new Set(outcomes.metricBands.map((b) => b.metricKey))
    expect(keys.has('performance')).toBe(true)
    expect(keys.has('cost')).toBe(true)
    expect(keys.has('maintainability')).toBe(true)
    expect(keys.has('userSatisfaction')).toBe(true)
    expect(keys.has('techDebt')).toBe(true)
  })

  it('each theme has headline and body text', () => {
    for (const theme of outcomes.themes) {
      expect(theme.id).toBeTruthy()
      expect(theme.headline).toBeTruthy()
      expect(theme.body).toBeTruthy()
    }
  })
})
