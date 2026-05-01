<script setup lang="ts">
import { ref } from 'vue'
import type { Choice } from '@/types/game'

const props = defineProps<{
  choices: [Choice, Choice, Choice]
}>()

const emit = defineEmits<{
  select: [choiceId: string]
}>()

const selected = ref<string | null>(null)

function pick(choiceId: string): void {
  if (selected.value !== null) return
  selected.value = choiceId
  emit('select', choiceId)
}
</script>

<template>
  <div class="choice-panel">
    <p class="prompt">What do you do?</p>
    <div class="choices">
      <button
        v-for="choice in props.choices"
        :key="choice.id"
        class="choice-btn"
        :class="{
          'choice-btn--selected': selected === choice.id,
          'choice-btn--dismissed': selected !== null && selected !== choice.id,
        }"
        :disabled="selected !== null"
        @click="pick(choice.id)"
      >
        <span class="choice-label">{{ choice.label }}</span>
        <span class="choice-subtext">{{ choice.subtext }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.choice-panel {
  border-top: 1px solid var(--chat-border);
  padding: 16px 20px 20px;
  background: var(--chat-bg);
  flex-shrink: 0;
  animation: slideUp 0.25s ease-out;
}

.prompt {
  font-size: 13px;
  font-weight: 600;
  color: var(--msg-name-system);
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.choices {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.choice-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  background: var(--choice-bg);
  border: 1.5px solid var(--choice-border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, border-color 0.15s, opacity 0.2s;
  width: 100%;
}

.choice-btn:hover:not(:disabled) {
  background: var(--choice-hover-bg);
  border-color: var(--choice-hover-border);
}

.choice-btn--selected {
  background: var(--choice-hover-bg) !important;
  border-color: var(--player-choice-bg) !important;
}

.choice-btn--dismissed {
  opacity: 0.4;
}

.choice-btn:disabled {
  cursor: not-allowed;
}

.choice-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--choice-text);
}

.choice-subtext {
  font-size: 13px;
  color: var(--choice-subtext);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
