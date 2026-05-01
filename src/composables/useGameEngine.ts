import { reactive, ref, computed } from 'vue'
import type { ComputedRef, Ref, InjectionKey } from 'vue'
import type {
  MetricState,
  Decision,
  DisplayMessage,
  SubPhase,
  OutcomeResult,
  MetricKey,
  Scenario,
  Choice,
  Stakeholder,
} from '@/types/game'
import { scenarios } from '@/data/scenarios'
import outcomesData from '@/data/outcomes.json'
import type { OutcomesData } from '@/types/game'
import { applyDeltas, evaluateCondition, resetMetrics, METRIC_LABELS } from './useMetrics'
import { useMessageQueue } from './useMessageQueue'

const outcomes = outcomesData as OutcomesData

const DEFAULT_THEME = {
  id: 'default',
  conditions: [] as never[],
  headline: 'You built a product. It exists.',
  body: 'The trade-offs are yours to live with.',
}

function computeOutcome(metrics: Readonly<MetricState>): OutcomeResult {
  const theme =
    outcomes.themes.find((t) =>
      t.conditions.every((c) => evaluateCondition(c, metrics)),
    ) ?? DEFAULT_THEME

  const bands = (Object.keys(metrics) as MetricKey[]).map((key) => {
    const value = metrics[key]
    const band = outcomes.metricBands
      .filter((b) => b.metricKey === key)
      .find((b) => value >= b.min && value <= b.max)
    return {
      key,
      value,
      label: band?.label ?? METRIC_LABELS[key],
    }
  })

  return { theme, bands }
}

export interface GameEngine {
  scenarioIndex: ComputedRef<number>
  subPhase: ComputedRef<SubPhase>
  metrics: Readonly<MetricState>
  decisionHistory: ComputedRef<readonly Decision[]>
  displayedMessages: ComputedRef<readonly DisplayMessage[]>
  isTyping: Ref<boolean>
  activeTypist: Ref<Stakeholder | null>
  currentScenario: ComputedRef<Scenario | undefined>
  outcomeResult: ComputedRef<OutcomeResult>
  selectChoice: (choiceId: string) => void
  restartGame: () => void
}

export const GAME_KEY: InjectionKey<GameEngine> = Symbol('game')

export function useGameEngine(): GameEngine {
  const queue = useMessageQueue()

  const _scenarioIndex = ref(0)
  const _subPhase = ref<SubPhase>('opening')
  const metrics = reactive<MetricState>(resetMetrics())
  const _decisionHistory = ref<Decision[]>([])
  const _displayedMessages = ref<DisplayMessage[]>([])

  const scenarioIndex = computed(() => _scenarioIndex.value)
  const subPhase = computed(() => _subPhase.value)
  const decisionHistory = computed<readonly Decision[]>(() => _decisionHistory.value)
  const displayedMessages = computed<readonly DisplayMessage[]>(() => _displayedMessages.value)

  const currentScenario = computed<Scenario | undefined>(
    () => scenarios[_scenarioIndex.value],
  )

  const outcomeResult = computed<OutcomeResult>(() => computeOutcome(metrics))

  function resolveText(text: string): string {
    const last = _decisionHistory.value[_decisionHistory.value.length - 1]
    return text.replace(/\{\{prevChoice\}\}/g, last?.label ?? '...')
  }

  function addMessage(id: string, from: string, text: string, reactions?: string[]): void {
    _displayedMessages.value = [
      ..._displayedMessages.value,
      {
        id,
        type: 'chat',
        from: from as DisplayMessage['from'],
        text,
        reactions,
      },
    ]
  }

  function startScenario(index: number): void {
    const scenario = scenarios[index]
    if (!scenario) return

    _displayedMessages.value = []
    _subPhase.value = 'opening'

    queue.run(
      scenario.openingMessages,
      { ...metrics },
      resolveText,
      (msg, resolvedText) => {
        addMessage(msg.id, msg.from, resolvedText, msg.reactions)
      },
      () => {
        _subPhase.value = 'choosing'
      },
    )
  }

  function applyChoice(choice: Choice): void {
    const updated = applyDeltas(metrics, choice.metricDeltas)
    Object.assign(metrics, updated)
  }

  function selectChoice(choiceId: string): void {
    const scenario = currentScenario.value
    if (!scenario || _subPhase.value !== 'choosing') return

    const choice = scenario.choices.find((c) => c.id === choiceId)
    if (!choice) return

    _decisionHistory.value = [
      ..._decisionHistory.value,
      {
        scenarioId: scenario.id,
        choiceId,
        label: choice.label,
        tagline: choice.tagline,
      },
    ]

    _displayedMessages.value = [
      ..._displayedMessages.value,
      {
        id: `player-${choiceId}`,
        type: 'player-choice',
        text: choice.label,
      },
    ]

    applyChoice(choice)
    _subPhase.value = 'followup'

    queue.run(
      choice.followUpMessages,
      { ...metrics },
      resolveText,
      (msg, resolvedText) => {
        addMessage(msg.id, msg.from, resolvedText, msg.reactions)
      },
      () => {
        const nextIndex = _scenarioIndex.value + 1

        if (nextIndex < scenarios.length) {
          _subPhase.value = 'transitioning'

          const nextScenario = scenarios[nextIndex]
          if (nextScenario) {
            _displayedMessages.value = [
              ..._displayedMessages.value,
              {
                id: `divider-${nextIndex}`,
                type: 'divider',
                text: nextScenario.channelName,
              },
            ]
          }

          setTimeout(() => {
            _scenarioIndex.value = nextIndex
            startScenario(nextIndex)
          }, 1200)
        } else {
          _subPhase.value = 'outcome'
        }
      },
    )
  }

  function restartGame(): void {
    queue.cancel()
    _scenarioIndex.value = 0
    Object.assign(metrics, resetMetrics())
    _decisionHistory.value = []
    _displayedMessages.value = []
    startScenario(0)
  }

  startScenario(0)

  return {
    scenarioIndex,
    subPhase,
    metrics: metrics as Readonly<MetricState>,
    decisionHistory,
    displayedMessages,
    isTyping: queue.isTyping,
    activeTypist: queue.activeTypist,
    currentScenario,
    outcomeResult,
    selectChoice,
    restartGame,
  }
}
