import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useMessageQueue } from '@/composables/useMessageQueue'
import { resetMetrics } from '@/composables/useMetrics'
import type { Message } from '@/types/game'

const metrics = resetMetrics()
const identity = (text: string): string => text

describe('useMessageQueue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls onComplete immediately when given an empty message list', () => {
    const queue = useMessageQueue()
    const onComplete = vi.fn<() => void>()
    queue.run([], metrics, identity, vi.fn(), onComplete)
    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('delivers messages in order with correct delays', () => {
    const queue = useMessageQueue()
    const delivered: string[] = []
    const onComplete = vi.fn<() => void>()

    const messages: Message[] = [
      { id: 'm1', from: 'pm', text: 'Hello', delayMs: 100 },
      { id: 'm2', from: 'engineer', text: 'World', delayMs: 200 },
    ]

    queue.run(messages, metrics, identity, (msg) => { delivered.push(msg.id) }, onComplete)

    expect(delivered).toHaveLength(0)

    vi.advanceTimersByTime(100)
    expect(delivered).toEqual(['m1'])
    expect(onComplete).not.toHaveBeenCalled()

    vi.advanceTimersByTime(200)
    expect(delivered).toEqual(['m1', 'm2'])
    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('resolves text via the resolveText function', () => {
    const queue = useMessageQueue()
    const received: string[] = []

    const messages: Message[] = [
      { id: 'm1', from: 'pm', text: 'Hello {{prevChoice}}', delayMs: 0 },
    ]

    const resolve = (text: string): string => text.replace('{{prevChoice}}', 'Ship it')

    queue.run(messages, metrics, resolve, (_, resolved) => { received.push(resolved) }, vi.fn())
    vi.runAllTimers()

    expect(received).toEqual(['Hello Ship it'])
  })

  it('skips messages whose condition is not met', () => {
    const queue = useMessageQueue()
    const delivered: string[] = []

    const messages: Message[] = [
      { id: 'm1', from: 'pm', text: 'Base', delayMs: 0 },
      {
        id: 'm2',
        from: 'engineer',
        text: 'High debt message',
        delayMs: 100,
        condition: { metric: 'techDebt', operator: 'gte', threshold: 70 },
      },
    ]

    // techDebt starts at 50, condition requires >=70
    queue.run(messages, metrics, identity, (msg) => { delivered.push(msg.id) }, vi.fn())
    vi.runAllTimers()

    expect(delivered).toEqual(['m1'])
    expect(delivered).not.toContain('m2')
  })

  it('includes conditional messages when condition is met', () => {
    const queue = useMessageQueue()
    const delivered: string[] = []
    const highDebtMetrics = { ...metrics, techDebt: 80 }

    const messages: Message[] = [
      { id: 'm1', from: 'pm', text: 'Base', delayMs: 0 },
      {
        id: 'm2',
        from: 'engineer',
        text: 'High debt message',
        delayMs: 0,
        condition: { metric: 'techDebt', operator: 'gte', threshold: 70 },
      },
    ]

    queue.run(messages, highDebtMetrics, identity, (msg) => { delivered.push(msg.id) }, vi.fn())
    vi.runAllTimers()

    expect(delivered).toEqual(['m1', 'm2'])
  })

  it('shows typing indicator for messages with delayMs > 300', () => {
    const queue = useMessageQueue()

    const messages: Message[] = [
      { id: 'm1', from: 'pm', text: 'Slow message', delayMs: 500 },
    ]

    queue.run(messages, metrics, identity, vi.fn(), vi.fn())

    expect(queue.isTyping.value).toBe(false) // not yet
    vi.advanceTimersByTime(1) // typing starts at cumDelay=0 for first message
    expect(queue.isTyping.value).toBe(true)
    expect(queue.activeTypist.value).toBe('pm')

    vi.advanceTimersByTime(500)
    expect(queue.isTyping.value).toBe(false)
  })

  it('cancel stops pending timers and resets state', () => {
    const queue = useMessageQueue()
    const delivered: string[] = []

    const messages: Message[] = [
      { id: 'm1', from: 'pm', text: 'A', delayMs: 100 },
      { id: 'm2', from: 'pm', text: 'B', delayMs: 100 },
    ]

    queue.run(messages, metrics, identity, (msg) => { delivered.push(msg.id) }, vi.fn())

    vi.advanceTimersByTime(100)
    expect(delivered).toEqual(['m1'])

    queue.cancel()

    vi.runAllTimers()
    expect(delivered).toEqual(['m1']) // m2 was cancelled
    expect(queue.isTyping.value).toBe(false)
  })
})
