<template>
  <div class="memo-list">
    <!-- 搜索 -->
    <div class="search-bar">
      <input
        v-model="store.search"
        placeholder="搜索备忘录..."
        class="search-input"
      />
      <button class="btn btn-primary" @click="openEditor()">+ 新增</button>
    </div>

    <!-- 列表 -->
    <div class="list-container">
      <div v-if="filteredMemos.length === 0" class="empty-state">
        <span>📝</span>
        <p>还没有备忘录</p>
      </div>
      <div
        v-for="memo in filteredMemos"
        :key="memo.id"
        :class="['memo-item', { selected: selected.includes(memo.id) }]"
        @click="handleClick(memo, $event)"
      >
        <div class="item-checkbox" @click.stop="toggleSelect(memo.id)">
          {{ selected.includes(memo.id) ? '✓' : '' }}
        </div>
        <div class="item-content" @click.stop="openEditor(memo)">
          <div class="item-title">{{ memo.title }}</div>
          <div class="item-preview">{{ memo.content.slice(0, 60) || '无内容' }}</div>
          <div class="item-meta">
            {{ formatDate(memo.updated) }}
            <span v-if="memo.reminder" class="reminder-tag">🔔</span>
          </div>
        </div>
        <button class="delete-btn" @click.stop="confirmDelete(memo.id)">🗑️</button>
      </div>
    </div>

    <!-- 批量操作 -->
    <div v-if="selected.length > 0" class="batch-bar">
      <span>已选择 {{ selected.length }} 项</span>
      <button class="btn btn-danger" @click="batchDeleteSelected">删除选中</button>
      <button class="btn btn-secondary" @click="selected = []">取消</button>
    </div>

    <!-- 编辑弹窗 -->
    <div v-if="editorVisible" class="modal-overlay" @click.self="closeEditor">
      <div class="modal">
        <div class="modal-header">
          <input v-model="editData.title" class="title-input" placeholder="标题" />
          <button class="close-btn" @click="closeEditor">×</button>
        </div>
        <textarea
          v-model="editData.content"
          class="content-input"
          placeholder="写点什么..."
          rows="8"
        />
        <div class="reminder-row">
          <label>
            <input type="checkbox" v-model="editData.hasReminder" />
            提醒
          </label>
          <input
            v-if="editData.hasReminder"
            type="datetime-local"
            v-model="editData.reminder"
          />
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeEditor">取消</button>
          <button class="btn btn-primary" @click="saveEdit">保存</button>
        </div>
      </div>
    </div>

    <!-- 确认删除弹窗 -->
    <div v-if="deleteConfirm.visible" class="modal-overlay">
      <div class="modal confirm-modal">
        <p>确定要删除这条备忘录吗？</p>
        <p class="sub">删除后可在垃圾桶中恢复，7天后自动清除。</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="deleteConfirm.visible = false">取消</button>
          <button class="btn btn-danger" @click="doDelete">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { store, filteredMemos, addMemo, updateMemo, deleteMemo, batchDelete, syncReminderToTodo, formatDate } from '../stores/memo.js'

const selected = ref([])
const editorVisible = ref(false)
const editData = reactive({ id: null, title: '', content: '', hasReminder: false, reminder: '' })
const deleteConfirm = reactive({ visible: false, id: null })

function openEditor(memo = null) {
  if (memo) {
    editData.id = memo.id
    editData.title = memo.title
    editData.content = memo.content
    editData.hasReminder = !!memo.reminder
    editData.reminder = memo.reminder ? memo.reminder.slice(0, 16) : ''
  } else {
    editData.id = null
    editData.title = ''
    editData.content = ''
    editData.hasReminder = false
    editData.reminder = ''
  }
  editorVisible.value = true
}

function closeEditor() {
  editorVisible.value = false
}

async function saveEdit() {
  if (editData.id) {
    const updates = { title: editData.title, content: editData.content, reminder: editData.hasReminder ? editData.reminder : '' }
    const updated = await updateMemo(editData.id, updates)
    if (updated && updated.reminder && !store.memos.find(m => m.id === editData.id)?.reminder) {
      await syncReminderToTodo(updated)
    }
  } else {
    await addMemo(editData.title, editData.content, editData.hasReminder ? editData.reminder : '')
  }
  closeEditor()
}

function handleClick(memo, e) {
  if (e.ctrlKey || e.metaKey) toggleSelect(memo.id)
  else openEditor(memo)
}

function toggleSelect(id) {
  const idx = selected.value.indexOf(id)
  if (idx >= 0) selected.value.splice(idx, 1)
  else selected.value.push(id)
}

function confirmDelete(id) {
  deleteConfirm.id = id
  deleteConfirm.visible = true
}

async function doDelete() {
  await deleteMemo(deleteConfirm.id)
  deleteConfirm.visible = false
  deleteConfirm.id = null
}

async function batchDeleteSelected() {
  await batchDelete(selected.value)
  selected.value = []
}
</script>

<style scoped>
.memo-list {
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
.search-input {
  flex: 1;
}
.list-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px;
}
.memo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  margin-bottom: 6px;
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.memo-item:hover {
  background: var(--bg-tertiary);
}
.memo-item.selected {
  outline: 2px solid var(--accent);
}
.item-checkbox {
  width: 20px;
  height: 20px;
  border: 1px solid var(--border);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}
.item-content {
  flex: 1;
  min-width: 0;
}
.item-title {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-preview {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-meta {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 4px;
}
.reminder-tag {
  margin-left: 6px;
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
.memo-item:hover .delete-btn {
  opacity: 0.6;
}
.delete-btn:hover {
  opacity: 1 !important;
}
.batch-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--bg-tertiary);
  font-size: 13px;
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
  max-width: 480px;
  box-shadow: 0 16px 48px var(--shadow);
}
.modal-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.title-input {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
}
.close-btn {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0 4px;
}
.content-input {
  width: 100%;
  margin-bottom: 12px;
}
.reminder-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 13px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.confirm-modal {
  text-align: center;
}
.confirm-modal p {
  margin-bottom: 8px;
}
.confirm-modal .sub {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>