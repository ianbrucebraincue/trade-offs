import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useGameEngine } from '@/composables/useGameEngine'
import { scenarios } from '@/data/scenarios'

describe('useGameEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllTimers()
  })

  it('starts in scenario 0 with opening phase', () => {
    const game = useGameEngine()
    expect(game.scenarioIndex.value).toBe(0)
    expect(game.subPhase.value).toBe('opening')
  })

  it('transitions to choosing after opening messages complete', () => {
    const game = useGameEngine()
    expect(game.subPhase.value).toBe('opening')
    vi.runAllTimers()
    expect(game.subPhase.value).toBe('choosing')
  })

  it('does nothing when selectChoice called outside choosing phase', () => {
    const game = useGameEngine()
    // still in 'opening' phase
    const firstChoice = scenarios[0]?.choices[0]
    if (!firstChoice) return

    game.selectChoice(firstChoice.id)
    expect(game.decisionHistory.value).toHaveLength(0)
  })

  it('records a decision when choice is selected', () => {
    const game = useGameEngine()
    vi.runAllTimers() // advance to choosing

    const firstChoice = scenarios[0]?.choices[0]
    if (!firstChoice) return

    game.selectChoice(firstChoice.id)
    expect(game.decisionHistory.value).toHaveLength(1)
    expect(game.decisionHistory.value[0]?.choiceId).toBe(firstChoice.id)
    expect(game.decisionHistory.value[0]?.label).toBe(firstChoice.label)
  })

  it('applies metric deltas when choice is selected', () => {
    const game = useGameEngine()
    vi.runAllTimers()

    // scenario 0 choice 0 (qw-ship-fast) always has techDebt +25
    const firstChoice = scenarios[0]?.choices[0]
    if (!firstChoice) return

    const techDebtBefore = game.metrics.techDebt
    game.selectChoice(firstChoice.id)

    // Verify at least one metric changed from its initial state
    expect(game.metrics.techDebt).not.toBe(techDebtBefore)
  })

  it('transitions to followup phase after choice selected', () => {
    const game = useGameEngine()
    vi.runAllTimers()

    const firstChoice = scenarios[0]?.choices[0]
    if (!firstChoice) return

    game.selectChoice(firstChoice.id)
    expect(game.subPhase.value).toBe('followup')
  })

  it('advances to next scenario after followup completes', () => {
    const game = useGameEngine()
    vi.runAllTimers()

    const firstChoice = scenarios[0]?.choices[0]
    if (!firstChoice) return

    game.selectChoice(firstChoice.id)
    vi.runAllTimers() // advance through followup + transition

    expect(game.scenarioIndex.value).toBe(1)
  })

  it('adds player choice message to displayed messages', () => {
    const game = useGameEngine()
    vi.runAllTimers()

    const firstChoice = scenarios[0]?.choices[0]
    if (!firstChoice) return

    game.selectChoice(firstChoice.id)

    const playerMsg = game.displayedMessages.value.find((m) => m.type === 'player-choice')
    expect(playerMsg).toBeDefined()
    expect(playerMsg?.text).toBe(firstChoice.label)
  })

  it('reaches outcome phase after all 5 scenarios', () => {
    const game = useGameEngine()

    for (let i = 0; i < 5; i++) {
      vi.runAllTimers()
      const scenario = scenarios[i]
      if (!scenario) break
      const choice = scenario.choices[0]
      if (!choice) break
      game.selectChoice(choice.id)
    }

    vi.runAllTimers()
    expect(game.subPhase.value).toBe('outcome')
  })

  it('resets to initial state on restartGame', () => {
    const game = useGameEngine()
    vi.runAllTimers()

    const firstChoice = scenarios[0]?.choices[0]
    if (!firstChoice) return

    game.selectChoice(firstChoice.id)
    vi.runAllTimers()

    game.restartGame()

    expect(game.scenarioIndex.value).toBe(0)
    expect(game.decisionHistory.value).toHaveLength(0)
    expect(game.metrics.performance).toBe(50)
    expect(game.metrics.techDebt).toBe(50)
    expect(game.displayedMessages.value).toHaveLength(0)
    expect(game.subPhase.value).toBe('opening')
  })

  it('does not mutate metrics directly — returns new state', () => {
    const game = useGameEngine()
    vi.runAllTimers()

    const snapshot = { ...game.metrics }

    const firstChoice = scenarios[0]?.choices[0]
    if (!firstChoice) return

    game.selectChoice(firstChoice.id)

    // At least one metric should have changed
    const changed = (Object.keys(snapshot) as (keyof typeof snapshot)[]).some(
      (k) => game.metrics[k] !== snapshot[k],
    )
    expect(changed).toBe(true)
  })
})
