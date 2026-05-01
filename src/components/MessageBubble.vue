<script setup lang="ts">
import type { DisplayMessage } from '@/types/game'

const props = defineProps<{
  message: DisplayMessage
}>()

const STAKEHOLDER_NAMES: Record<string, string> = {
  pm: 'Alex',
  engineer: 'Jordan',
  designer: 'Sam',
  ceo: 'Marcus',
}

const STAKEHOLDER_ROLES: Record<string, string> = {
  pm: 'PM',
  engineer: 'Engineer',
  designer: 'Designer',
  ceo: 'CEO',
}

const name = props.message.from ? (STAKEHOLDER_NAMES[props.message.from] ?? props.message.from) : ''
const role = props.message.from ? (STAKEHOLDER_ROLES[props.message.from] ?? '') : ''
const initial = name.charAt(0).toUpperCase()
</script>

<template>
  <!-- Divider between scenarios -->
  <div v-if="message.type === 'divider'" class="divider">
    <span class="divider-line" />
    <span class="divider-label">{{ message.text }}</span>
    <span class="divider-line" />
  </div>

  <!-- Player choice bubble -->
  <div v-else-if="message.type === 'player-choice'" class="player-choice-wrapper">
    <div class="player-choice-bubble">{{ message.text }}</div>
  </div>

  <!-- Regular chat message -->
  <div v-else class="message">
    <div class="avatar" :class="`avatar--${message.from}`">{{ initial }}</div>
    <div class="content">
      <div class="header">
        <span class="name" :class="`name--${message.from}`">{{ name }}</span>
        <span v-if="role" class="role">{{ role }}</span>
      </div>
      <p class="text">{{ message.text }}</p>
      <div v-if="message.reactions?.length" class="reactions">
        <span
          v-for="reaction in message.reactions"
          :key="reaction"
          class="reaction"
        >{{ reaction }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message {
  display: flex;
  gap: 10px;
  padding: 4px 20px;
  animation: slideIn 0.2s ease-out;
}

.message:hover {
  background: #f8f8f8;
}

.avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: white;
  margin-top: 2px;
}

.avatar--pm { background: var(--avatar-pm); }
.avatar--engineer { background: var(--avatar-engineer); }
.avatar--designer { background: var(--avatar-designer); }
.avatar--ceo { background: var(--avatar-ceo); }

.content {
  flex: 1;
  min-width: 0;
}

.header {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 2px;
}

.name {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
}

.name--pm { color: var(--msg-name-pm); }
.name--engineer { color: var(--msg-name-engineer); }
.name--designer { color: var(--msg-name-designer); }
.name--ceo { color: var(--msg-name-ceo); }

.role {
  font-size: 12px;
  color: var(--msg-name-system);
}

.text {
  font-size: 15px;
  line-height: 1.5;
  color: #1d1c1d;
  word-wrap: break-word;
}

.reactions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.reaction {
  background: #f8f8f8;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 14px;
  cursor: default;
}

/* Player choice */
.player-choice-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 4px 20px;
  animation: slideIn 0.2s ease-out;
}

.player-choice-bubble {
  background: var(--player-choice-bg);
  color: var(--player-choice-text);
  border-radius: 18px 18px 4px 18px;
  padding: 8px 16px;
  font-size: 15px;
  max-width: 60%;
  word-wrap: break-word;
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  animation: fadeIn 0.3s ease-out;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: var(--divider-line);
}

.divider-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--divider-text);
  white-space: nowrap;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
