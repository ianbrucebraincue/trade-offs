<script setup lang="ts">
import { ref, watch, nextTick, inject, computed } from 'vue'
import MessageBubble from './MessageBubble.vue'
import TypingIndicator from './TypingIndicator.vue'
import ChoicePanel from './ChoicePanel.vue'
import { GAME_KEY } from '@/composables/useGameEngine'
import type { GameEngine } from '@/composables/useGameEngine'
import { scenarios } from '@/data/scenarios'

const emit = defineEmits<{ 'menu-click': [] }>()

const game = inject(GAME_KEY) as GameEngine

const scrollEl = ref<HTMLElement | null>(null)

const currentChannelName = computed(() => {
  if (game.subPhase.value === 'outcome') return '#team'
  return scenarios[game.scenarioIndex.value]?.channelName ?? '#general'
})

const currentScenarioTitle = computed(() => {
  return scenarios[game.scenarioIndex.value]?.title ?? ''
})

function scrollToBottom(): void {
  if (!scrollEl.value) return
  scrollEl.value.scrollTop = scrollEl.value.scrollHeight
}

watch(
  () => [game.displayedMessages.value, game.isTyping.value],
  () => nextTick(scrollToBottom),
  { deep: true },
)

function onChoiceSelected(choiceId: string): void {
  game.selectChoice(choiceId)
}
</script>

<template>
  <div class="chat-pane">
    <!-- Header -->
    <header class="chat-header">
      <div class="header-left">
        <button class="menu-btn" aria-label="Open menu" @click="emit('menu-click')">☰</button>
        <span class="header-hash">#</span>
        <span class="header-channel">{{ currentChannelName.slice(1) }}</span>
      </div>
      <div class="header-meta">
        <span class="scenario-pill">{{ currentScenarioTitle }}</span>
      </div>
    </header>

    <!-- Messages -->
    <div ref="scrollEl" class="messages-scroll">
      <div class="messages-inner">
        <!-- Intro banner -->
        <div class="channel-intro">
          <div class="intro-icon">💬</div>
          <h2 class="intro-title">{{ currentChannelName }}</h2>
          <p class="intro-desc">This is the beginning of the <strong>{{ currentChannelName }}</strong> channel.</p>
        </div>

        <MessageBubble
          v-for="msg in game.displayedMessages.value"
          :key="msg.id"
          :message="msg"
        />

        <TypingIndicator :typist="game.activeTypist.value" />
      </div>
    </div>

    <!-- Choices -->
    <ChoicePanel
      v-if="game.subPhase.value === 'choosing' && game.currentScenario.value"
      :choices="game.currentScenario.value.choices"
      @select="onChoiceSelected"
    />
  </div>
</template>

<style scoped>
.chat-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--chat-bg);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 49px;
  border-bottom: 1px solid var(--chat-header-border);
  flex-shrink: 0;
  background: var(--chat-header-bg);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-hash {
  font-size: 20px;
  color: #1d1c1d;
  line-height: 1;
  font-weight: 400;
}

.header-channel {
  font-size: 16px;
  font-weight: 700;
  color: #1d1c1d;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.scenario-pill {
  font-size: 12px;
  background: #f8f8f8;
  border: 1px solid var(--chat-border);
  border-radius: 12px;
  padding: 2px 10px;
  color: var(--msg-name-system);
  font-weight: 600;
}

.messages-scroll {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.messages-inner {
  padding: 12px 0 8px;
  display: flex;
  flex-direction: column;
}

.channel-intro {
  padding: 12px 20px 20px;
  border-bottom: 1px solid var(--chat-border);
  margin-bottom: 12px;
}

.intro-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.intro-title {
  font-size: 22px;
  font-weight: 800;
  color: #1d1c1d;
  margin-bottom: 4px;
}

.intro-desc {
  font-size: 15px;
  color: #616061;
}

.menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #1d1c1d;
  padding: 4px 6px;
  margin-right: 4px;
  border-radius: var(--radius-sm);
  line-height: 1;
}

.menu-btn:hover {
  background: #f1f1f1;
}

@media (max-width: 768px) {
  .menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
