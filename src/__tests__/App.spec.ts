import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

// Keep timers fake so the game engine doesn't fire on mount
afterEach(() => {
  vi.useRealTimers()
})

describe('App', () => {
  it('mounts without errors', () => {
    vi.useFakeTimers()
    const wrapper = mount(App)
    expect(wrapper.exists()).toBe(true)
  })
})
