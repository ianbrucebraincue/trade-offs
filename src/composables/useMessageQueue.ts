import { ref } from 'vue'
import type { Ref } from 'vue'
import type { Message, MetricState, Stakeholder } from '@/types/game'
import { evaluateCondition } from './useMetrics'

export interface MessageQueueState {
  isTyping: Ref<boolean>
  activeTypist: Ref<Stakeholder | null>
  run: (
    messages: Message[],
    metricsSnapshot: Readonly<MetricState>,
    resolveText: (text: string) => string,
    onMessage: (msg: Message, resolvedText: string) => void,
    onComplete: () => void,
  ) => void
  cancel: () => void
}

export function useMessageQueue(): MessageQueueState {
  const isTyping = ref(false)
  const activeTypist = ref<Stakeholder | null>(null)
  let pendingTimers: ReturnType<typeof setTimeout>[] = []

  function cancel(): void {
    for (const t of pendingTimers) {
      clearTimeout(t)
    }
    pendingTimers = []
    isTyping.value = false
    activeTypist.value = null
  }

  function run(
    messages: Message[],
    metricsSnapshot: Readonly<MetricState>,
    resolveText: (text: string) => string,
    onMessage: (msg: Message, resolvedText: string) => void,
    onComplete: () => void,
  ): void {
    cancel()

    const eligible = messages.filter((msg) => {
      if (!msg.condition) return true
      return evaluateCondition(msg.condition, metricsSnapshot)
    })

    if (eligible.length === 0) {
      onComplete()
      return
    }

    let cumDelay = 0

    eligible.forEach((msg, index) => {
      const typingStartAt = cumDelay
      cumDelay += msg.delayMs
      const revealAt = cumDelay

      // Show typing indicator for messages with meaningful delay
      if (msg.delayMs > 300) {
        const t1 = setTimeout(() => {
          isTyping.value = true
          activeTypist.value = msg.from
        }, typingStartAt)
        pendingTimers.push(t1)
      }

      const t2 = setTimeout(() => {
        isTyping.value = false
        activeTypist.value = null
        onMessage(msg, resolveText(msg.text))

        if (index === eligible.length - 1) {
          onComplete()
        }
      }, revealAt)

      pendingTimers.push(t2)
    })
  }

  return { isTyping, activeTypist, run, cancel }
}
