<template>
  <div class="trash-list">
    <div class="trash-header">
      <span>💀 垃圾桶 — 7天后自动清除</span>
    </div>

    <div class="list-container">
      <div v-if="store.trash.length === 0" class="empty-state">
        <span>🗑️</span>
        <p>垃圾桶是空的</p>
      </div>
      <div
        v-for="item in store.trash"
        :key="item.id"
        class="trash-item"
      >
        <div class="item-info">
          <div class="item-title">{{ item.title }}</div>
          <div class="item-meta">
            {{ item.sourceType === 'memo' ? '备忘录' : '代办' }} ·
            删除于 {{ formatDate(item.deletedAt) }}
          </div>
        </div>
        <div class="item-actions">
          <button class="btn btn-secondary" @click="restore(item.id)" title="恢复">↩️</button>
          <button class="btn btn-danger" @click="confirmDelete(item.id)" title="永久删除">🗑️</button>
        </div>
      </div>
    </div>

    <!-- 确认永久删除弹窗 -->
    <div v-if="deleteConfirm.visible" class="modal-overlay">
      <div class="modal confirm-modal">
        <p>确定要永久删除吗？此操作不可恢复。</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="deleteConfirm.visible = false">取消</button>
          <button class="btn btn-danger" @click="doPermanentDelete">永久删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { store, restoreItem, permanentlyDelete, formatDate } from '../stores/memo.js'

const deleteConfirm = reactive({ visible: false, id: null })

async function restore(id) {
  await restoreItem(id)
}

function confirmDelete(id) {
  deleteConfirm.id = id
  deleteConfirm.visible = true
}

async function doPermanentDelete() {
  await permanentlyDelete(deleteConfirm.id)
  deleteConfirm.visible = false
  deleteConfirm.id = null
}
</script>

<style scoped>
.trash-list {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.trash-header {
  padding: 12px;
  background: var(--bg-secondary);
  font-size: 12px;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--bg-tertiary);
}
.list-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px;
}
.trash-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  margin-bottom: 6px;
  background: var(--bg-secondary);
  border-radius: 8px;
}
.item-info {
  flex: 1;
  min-width: 0;
}
.item-title {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-meta {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 4px;
}
.item-actions {
  display: flex;
  gap: 6px;
}
.btn {
  padding: 4px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
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