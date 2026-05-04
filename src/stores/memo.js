import { reactive, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'

const WORKER_DIR = 'worker'

// 本地存储工具
function getBasePath() {
  return window.__TAURI__ ? window.__TAURI__.path : ''
}

async function ensureWorkerDir() {
  if (window.__TAURI__) {
    const { mkdir, exists } = window.__TAURI__.fs
    const dir = `${getBasePath()}/${WORKER_DIR}`
    const e = await exists(dir)
    if (!e) await mkdir(dir, { recursive: true })
  }
}

async function readFile(filename) {
  if (window.__TAURI__) {
    const { readTextFile, exists } = window.__TAURI__.fs
    const path = `${getBasePath()}/${WORKER_DIR}/${filename}`
    const e = await exists(path)
    if (!e) return null
    return await readTextFile(path)
  }
  return null
}

async function writeFile(filename, content) {
  if (window.__TAURI__) {
    const { writeTextFile } = window.__TAURI__.fs
    await writeTextFile(`${getBasePath()}/${WORKER_DIR}/${filename}`, content)
  }
}

async function deleteFile(filename) {
  if (window.__TAURI__) {
    const { remove } = window.__TAURI__.fs
    await remove(`${getBasePath()}/${WORKER_DIR}/${filename}`)
  }
}

// 解析 Markdown 文件
function parseMarkdown(content) {
  const lines = content.split('\n')
  const meta = {}
  const body = []
  let inMeta = false
  for (const line of lines) {
    if (line === '---') {
      inMeta = !inMeta
      continue
    }
    if (inMeta) {
      const [key, ...val] = line.split(':')
      if (key && val.length) meta[key.trim()] = val.join(':').trim()
    } else {
      body.push(line)
    }
  }
  return { meta, body: body.join('\n').trim() }
}

// 生成 Markdown 文件
function stringifyMarkdown(meta, body) {
  const metaLines = Object.entries(meta).map(([k, v]) => `${k}: ${v}`)
  return ['---', ...metaLines, '---', body].join('\n')
}

// 时间格式化
function formatDate(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 状态
const state = reactive({
  memos: [],
  todos: [],
  trash: [],
  search: '',
  initialized: false
})

// 计算属性
const filteredMemos = computed(() => {
  const q = state.search.toLowerCase()
  if (!q) return state.memos
  return state.memos.filter(m => m.title.toLowerCase().includes(q) || m.content.toLowerCase().includes(q))
})

// 初始化加载
async function init() {
  await ensureWorkerDir()
  await loadAll()
  state.initialized = true
  startTrashCleanup()
}

// 加载所有数据
async function loadAll() {
  await loadType('memo', state.memos)
  await loadType('todo', state.todos)
  await loadType('trash', state.trash)
}

async function loadType(type, target) {
  target.length = 0
  if (!window.__TAURI__) return
  const { readDir } = window.__TAURI__.fs
  const dir = `${getBasePath()}/${WORKER_DIR}`
  let entries
  try { entries = await readDir(dir) } catch { return }
  const prefix = `${type}_`
  for (const entry of entries) {
    if (!entry.name.startsWith(prefix) || !entry.name.endsWith('.md')) continue
    const content = await readFile(entry.name)
    if (!content) continue
    const { meta, body } = parseMarkdown(content)
    const item = {
      id: meta.id || entry.name.replace('.md', ''),
      title: meta.title || '无标题',
      content: body,
      created: meta.created || '',
      updated: meta.updated || '',
      reminder: meta.reminder || '',
      completed: meta.completed === 'true',
      deletedAt: meta.deletedAt || '',
      sourceType: meta.sourceType || type
    }
    // 判断是否在垃圾桶
    if (type === 'trash' || item.deletedAt) {
      const trashItem = { ...item, deletedAt: meta.deletedAt || '' }
      if (!state.trash.find(t => t.id === trashItem.id)) {
        state.trash.push(trashItem)
      }
    } else if (type === 'memo') {
      if (!state.memos.find(m => m.id === item.id)) state.memos.push(item)
    } else if (type === 'todo') {
      if (!state.todos.find(t => t.id === item.id)) state.todos.push(item)
    }
  }
  // 排序
  target.sort((a, b) => new Date(b.updated || b.created) - new Date(a.updated || a.created))
}

// 新增/保存
async function saveItem(type, item) {
  const filename = `${type}_${item.id}.md`
  const meta = {
    id: item.id,
    title: item.title,
    created: item.created,
    updated: item.updated,
    reminder: item.reminder || '',
    completed: item.completed ? 'true' : 'false',
    deletedAt: item.deletedAt || '',
    sourceType: type
  }
  await writeFile(filename, stringifyMarkdown(meta, item.content))
}

// 添加备忘录
async function addMemo(title, content = '', reminder = '') {
  const now = new Date().toISOString()
  const item = {
    id: uuidv4(),
    title: title || '新备忘录',
    content,
    created: now,
    updated: now,
    reminder
  }
  await saveItem('memo', item)
  state.memos.unshift(item)
  return item
}

// 更新备忘录
async function updateMemo(id, updates) {
  const idx = state.memos.findIndex(m => m.id === id)
  if (idx < 0) return
  const item = { ...state.memos[idx], ...updates, updated: new Date().toISOString() }
  state.memos[idx] = item
  await saveItem('memo', item)
  return item
}

// 删除备忘录（软删除进垃圾桶）
async function deleteMemo(id) {
  const idx = state.memos.findIndex(m => m.id === id)
  if (idx < 0) return
  const item = { ...state.memos[idx], deletedAt: new Date().toISOString() }
  await deleteFile(`memo_${id}.md`)
  await saveItem('trash', item)
  state.memos.splice(idx, 1)
  state.trash.unshift(item)
}

// 添加代办
async function addTodo(title, time = '') {
  const now = new Date().toISOString()
  const item = {
    id: uuidv4(),
    title,
    content: '',
    created: now,
    updated: now,
    reminder: time,
    completed: false
  }
  await saveItem('todo', item)
  state.todos.unshift(item)
  return item
}

// 切换完成状态
async function toggleTodo(id) {
  const todo = state.todos.find(t => t.id === id)
  if (!todo) return
  todo.completed = !todo.completed
  todo.updated = new Date().toISOString()
  await saveItem('todo', todo)
}

// 删除代办
async function deleteTodo(id) {
  const idx = state.todos.findIndex(t => t.id === id)
  if (idx < 0) return
  const item = { ...state.todos[idx], deletedAt: new Date().toISOString() }
  await deleteFile(`todo_${id}.md`)
  await saveItem('trash', item)
  state.todos.splice(idx, 1)
  state.trash.unshift(item)
}

// 从垃圾桶恢复
async function restoreItem(id) {
  const idx = state.trash.findIndex(t => t.id === id)
  if (idx < 0) return
  const item = { ...state.trash[idx], deletedAt: '' }
  await deleteFile(`trash_${id}.md`)
  // 判断类型恢复
  if (item.sourceType === 'memo') {
    await saveItem('memo', item)
    state.memos.unshift(item)
  } else if (item.sourceType === 'todo') {
    await saveItem('todo', item)
    state.todos.unshift(item)
  }
  state.trash.splice(idx, 1)
}

// 永久删除
async function permanentlyDelete(id) {
  const idx = state.trash.findIndex(t => t.id === id)
  if (idx < 0) return
  await deleteFile(`trash_${id}.md`)
  state.trash.splice(idx, 1)
}

// 批量删除
async function batchDelete(ids) {
  for (const id of ids) {
    const memo = state.memos.find(m => m.id === id)
    if (memo) await deleteMemo(id)
    const todo = state.todos.find(t => t.id === id)
    if (todo) await deleteTodo(id)
  }
}

// 垃圾桶清理（7天）
let cleanupTimer = null
function startTrashCleanup() {
  cleanupTimer = setInterval(async () => {
    const now = Date.now()
    const toDelete = []
    for (const item of state.trash) {
      if (item.deletedAt && now - new Date(item.deletedAt).getTime() > 7 * 24 * 60 * 60 * 1000) {
        toDelete.push(item.id)
      }
    }
    for (const id of toDelete) await permanentlyDelete(id)
  }, 60 * 60 * 1000) // 每小时检查一次
}

// 同步备忘录提醒到代办
async function syncReminderToTodo(memo) {
  if (!memo.reminder) return
  await addTodo(`[备忘] ${memo.title}`, memo.reminder)
}

export {
  state as store,
  filteredMemos,
  init,
  addMemo,
  updateMemo,
  deleteMemo,
  addTodo,
  toggleTodo,
  deleteTodo,
  restoreItem,
  permanentlyDelete,
  batchDelete,
  syncReminderToTodo,
  formatDate
}