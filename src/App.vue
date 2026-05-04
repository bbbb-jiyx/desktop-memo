<template>
  <div id="app" :style="{ '--opacity': settings.opacity }">
    <TabNav :active="activeTab" @change="activeTab = $event" />
    <div class="content">
      <MemoList v-if="activeTab === 'memo'" />
      <TodoList v-if="activeTab === 'todo'" />
      <TrashList v-if="activeTab === 'trash'" />
      <SettingsPanel v-if="activeTab === 'settings'" />
    </div>
    <div v-if="!store.initialized" class="loading">加载中...</div>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import { store, init } from './stores/memo.js'
import TabNav from './components/TabNav.vue'
import MemoList from './components/MemoList.vue'
import TodoList from './components/TodoList.vue'
import TrashList from './components/TrashList.vue'
import SettingsPanel from './components/SettingsPanel.vue'

const activeTab = ref('memo')
const settings = ref({
  opacity: 1,
  theme: 'dark',
  fontColor: '#cdd6f4',
  accentColor: '#89b4fa'
})
provide('settings', settings)

// 初始化
init().catch(console.error)
</script>

<style scoped>
.content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--text-secondary);
}
</style>