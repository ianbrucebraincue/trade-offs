export type MetricKey = 'performance' | 'cost' | 'maintainability' | 'userSatisfaction' | 'techDebt'

export type MetricState = Record<MetricKey, number>

export interface MetricDelta {
  metric: MetricKey
  delta: number
  hidden: boolean
}

export type Stakeholder = 'pm' | 'engineer' | 'designer' | 'ceo' | 'system'

export interface MessageCondition {
  metric: MetricKey
  operator: 'gt' | 'lt' | 'gte' | 'lte'
  threshold: number
}

export interface Message {
  id: string
  from: Stakeholder
  text: string
  delayMs: number
  reactions?: string[]
  condition?: MessageCondition
}

export interface Choice {
  id: string
  label: string
  subtext: string
  metricDeltas: MetricDelta[]
  followUpMessages: Message[]
  tagline: string
}

export interface Scenario {
  id: string
  title: string
  channelName: string
  openingMessages: Message[]
  choices: [Choice, Choice, Choice]
}

export interface OutcomeCondition {
  metric: MetricKey
  operator: 'gt' | 'lt' | 'gte' | 'lte'
  threshold: number
}

export interface OutcomeTheme {
  id: string
  conditions: OutcomeCondition[]
  headline: string
  body: string
}

export interface MetricBand {
  metricKey: MetricKey
  label: string
  min: number
  max: number
}

export interface OutcomesData {
  themes: OutcomeTheme[]
  metricBands: MetricBand[]
}

export interface Decision {
  scenarioId: string
  choiceId: string
  label: string
  tagline: string
}

export type SubPhase = 'opening' | 'choosing' | 'followup' | 'transitioning' | 'outcome'

export type MessageType = 'chat' | 'player-choice' | 'divider'

export interface DisplayMessage {
  id: string
  type: MessageType
  from?: Stakeholder
  text: string
  reactions?: string[]
}

export interface OutcomeResult {
  theme: OutcomeTheme
  bands: { key: MetricKey; value: number; label: string }[]
}
