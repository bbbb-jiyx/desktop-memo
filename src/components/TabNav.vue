<template>
  <nav class="tab-nav">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      :class="['tab-btn', { active: active === tab.id }]"
      @click="$emit('change', tab.id)"
    >
      {{ tab.label }}
    </button>
    <div class="spacer" />
    <button class="icon-btn" @click="$emit('change', 'settings')" title="设置">
      ⚙️
    </button>
  </nav>
</template>

<script setup>
defineProps({ active: String })
defineEmits(['change'])

const tabs = [
  { id: 'memo', label: '备忘录' },
  { id: 'todo', label: '代办' },
  { id: 'trash', label: '垃圾桶' }
]
</script>

<style scoped>
.tab-nav {
  display: flex;
  align-items: center;
  padding: 8px 12px 0;
  background: var(--bg-secondary);
  border-radius: 8px 8px 0 0;
  gap: 4px;
}
.tab-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  border-radius: 6px 6px 0 0;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}
.tab-btn.active {
  color: var(--accent);
  background: var(--bg-primary);
}
.spacer {
  flex: 1;
}
.icon-btn {
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  opacity: 0.6;
  transition: opacity 0.2s;
}
.icon-btn:hover {
  opacity: 1;
  background: var(--bg-tertiary);
}
</style>