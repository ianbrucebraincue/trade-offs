<script setup lang="ts">
import type { Stakeholder } from '@/types/game'

defineProps<{
  typist: Stakeholder | null
}>()

const STAKEHOLDER_NAMES: Record<string, string> = {
  pm: 'Alex',
  engineer: 'Jordan',
  designer: 'Sam',
  ceo: 'Marcus',
}
</script>

<template>
  <div v-if="typist" class="typing-indicator">
    <div class="avatar-sm" :class="`avatar-sm--${typist}`">
      {{ STAKEHOLDER_NAMES[typist]?.charAt(0) ?? '?' }}
    </div>
    <div class="bubble">
      <span class="dot" />
      <span class="dot" />
      <span class="dot" />
    </div>
    <span class="label">{{ STAKEHOLDER_NAMES[typist] ?? typist }} is typing…</span>
  </div>
</template>

<style scoped>
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 20px 8px;
  animation: fadeIn 0.15s ease-out;
}

.avatar-sm {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.avatar-sm--pm { background: var(--avatar-pm); }
.avatar-sm--engineer { background: var(--avatar-engineer); }
.avatar-sm--designer { background: var(--avatar-designer); }
.avatar-sm--ceo { background: var(--avatar-ceo); }

.bubble {
  display: flex;
  align-items: center;
  gap: 3px;
  background: #f1f1f1;
  border-radius: 12px;
  padding: 5px 10px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--typing-dot);
  animation: bounce 1.2s ease-in-out infinite;
}

.dot:nth-child(2) { animation-delay: 0.15s; }
.dot:nth-child(3) { animation-delay: 0.3s; }

.label {
  font-size: 12px;
  color: var(--msg-name-system);
}

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
