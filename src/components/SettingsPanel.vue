<template>
  <div class="settings-panel">
    <h2>⚙️ 设置</h2>

    <div class="setting-group">
      <h3>外观</h3>

      <div class="setting-item">
        <label>窗口透明度</label>
        <input
          type="range"
          min="0.3"
          max="1"
          step="0.05"
          :value="settings.opacity"
          @input="settings.opacity = parseFloat($event.target.value)"
        />
        <span class="value">{{ Math.round(settings.opacity * 100) }}%</span>
      </div>

      <div class="setting-item">
        <label>主题</label>
        <div class="theme-btns">
          <button
            v-for="t in themes"
            :key="t.id"
            :class="['theme-btn', { active: settings.theme === t.id }]"
            :style="{ background: t.bg, color: t.text }"
            @click="applyTheme(t)"
          >
            {{ t.name }}
          </button>
        </div>
      </div>
    </div>

    <div class="setting-group">
      <h3>配色</h3>
      <div class="setting-item">
        <label>强调色</label>
        <div class="color-btns">
          <button
            v-for="c in accentColors"
            :key="c"
            class="color-btn"
            :style="{ background: c }"
            :class="{ active: settings.accentColor === c }"
            @click="settings.accentColor = c"
          />
        </div>
      </div>
    </div>

    <div class="setting-group">
      <h3>关于</h3>
      <div class="about">
        <p><strong>桌面便签</strong> v1.0.0</p>
        <p>轻量级 Windows 桌面便签工具</p>
        <p>本地 Markdown 存储 · Tauri + Vue3 构建</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'

const settings = inject('settings')

const themes = [
  { id: 'dark', name: '暗色', bg: '#1e1e2e', text: '#cdd6f4' },
  { id: 'light', name: '浅色', bg: '#f5f5f5', text: '#333333' },
  { id: 'purple', name: '紫罗兰', bg: '#2d1b4e', text: '#e0b0ff' }
]

const accentColors = ['#89b4fa', '#f38ba8', '#a6e3a1', '#f9e2af', '#cba6f7', '#fab387']

function applyTheme(t) {
  settings.value.theme = t.id
  document.documentElement.style.setProperty('--bg-primary', t.bg)
  document.documentElement.style.setProperty('--text-primary', t.text)
}
</script>

<style scoped>
.settings-panel {
  padding: 16px;
  overflow-y: auto;
  height: 100%;
}
.settings-panel h2 {
  margin-bottom: 20px;
  font-size: 18px;
}
.setting-group {
  margin-bottom: 24px;
}
.setting-group h3 {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.setting-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.setting-item label {
  width: 80px;
  font-size: 13px;
}
.setting-item input[type="range"] {
  flex: 1;
}
.value {
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 40px;
}
.theme-btns {
  display: flex;
  gap: 8px;
}
.theme-btn {
  padding: 6px 14px;
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}
.theme-btn.active {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent);
}
.color-btns {
  display: flex;
  gap: 8px;
}
.color-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}
.color-btn.active {
  border-color: var(--text-primary);
  transform: scale(1.15);
}
.about {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.8;
}
.about strong {
  color: var(--text-primary);
}
</style>