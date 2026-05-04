# 桌面便签

轻量级 Windows 桌面便签应用，支持备忘录、代办事项、垃圾桶，本地 Markdown 存储。

## 功能

- ✅ 备忘录：增删改查、搜索、提醒同步
- ✅ 代办事项：添加、完成、删除
- ✅ 垃圾桶：7天自动清理、恢复、永久删除
- ✅ 主题切换（暗色/浅色/紫罗兰）
- ✅ 透明度调节
- ✅ 配色自定义
- 📁 本地 Markdown 存储（./worker 目录）

## 技术栈

- Tauri v2 (Rust)
- Vue3 + Vite
- Pinia 状态管理
- 本地文件系统存储

## 开发

```bash
# 安装依赖
npm install

# 本地开发
npm run tauri dev

# 构建 Windows exe
npm run tauri build
```

## 打包说明

使用 Tauri bundler 构建单文件 exe，安装包约 10-50MB，内存占用 <80MB。

## 开源协议

MIT License