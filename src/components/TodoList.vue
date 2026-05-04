<template>
  <div class="todo-list">
    <div class="search-bar">
      <input
        v-model="newTodoTitle"
        placeholder="添加新代办..."
        class="todo-input"
        @keyup.enter="addNewTodo"
      />
      <button class="btn btn-primary" @click="addNewTodo">+ 添加</button>
    </div>

    <div class="list-container">
      <div v-if="store.todos.length === 0" class="empty-state">
        <span>📋</span>
        <p>还没有代办事项</p>
      </div>
      <div
        v-for="todo in store.todos"
        :key="todo.id"
        :class="['todo-item', { completed: todo.completed }]"
      >
        <div
          class="todo-check"
          :class="{ checked: todo.completed }"
          @click="toggleTodo(todo.id)"
        >
          {{ todo.completed ? '✓' : '' }}
        </div>
        <div class="todo-content">
          <div class="todo-title">{{ todo.title }}</div>
          <div v-if="todo.reminder" class="todo-time">
            🔔 {{ formatDateTime(todo.reminder) }}
          </div>
        </div>
        <button class="delete-btn" @click="confirmDelete(todo.id)">🗑️</button>
      </div>
    </div>

    <!-- 确认删除弹窗 -->
    <div v-if="deleteConfirm.visible" class="modal-overlay">
      <div class="modal confirm-modal">
        <p>确定要删除这条代办吗？</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="deleteConfirm.visible = false">取消</button>
          <button class="btn btn-danger" @click="doDelete">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { store, addTodo, toggleTodo as toggle, deleteTodo, formatDate } from '../stores/memo.js'

const newTodoTitle = ref('')
const deleteConfirm = reactive({ visible: false, id: null })

async function addNewTodo() {
  const title = newTodoTitle.value.trim()
  if (!title) return
  await addTodo(title)
  newTodoTitle.value = ''
}

async function toggle(id) {
  await toggle(id)
}

function confirmDelete(id) {
  deleteConfirm.id = id
  deleteConfirm.visible = true
}

async function doDelete() {
  await deleteTodo(deleteConfirm.id)
  deleteConfirm.visible = false
  deleteConfirm.id = null
}

function formatDateTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
</script>

<style scoped>
.todo-list {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.search-bar {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: var(--bg-secondary);
}
.todo-input {
  flex: 1;
}
.list-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px;
}
.todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  margin-bottom: 6px;
  background: var(--bg-secondary);
  border-radius: 8px;
  transition: background 0.2s;
}
.todo-item:hover {
  background: var(--bg-tertiary);
}
.todo-check {
  width: 22px;
  height: 22px;
  border: 2px solid var(--border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  font-size: 12px;
  transition: all 0.2s;
}
.todo-check.checked {
  background: var(--success);
  border-color: var(--success);
  color: var(--bg-primary);
}
.todo-content {
  flex: 1;
  min-width: 0;
}
.todo-title {
  font-size: 14px;
}
.todo-item.completed .todo-title {
  text-decoration: line-through;
  color: var(--text-secondary);
}
.todo-time {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 4px;
}
.delete-btn {
  background: transparent;
  border: none;
  opacity: 0;
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  transition: opacity 0.2s;
}
.todo-item:hover .delete-btn {
  opacity: 0.6;
}
.delete-btn:hover {
  opacity: 1 !important;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 20px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 16px 48px var(--shadow);
}
.confirm-modal {
  text-align: center;
}
.confirm-modal p {
  margin-bottom: 16px;
}
.modal-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
}
.empty-state p {
  margin-top: 10px;
  font-size: 13px;
}
</style>