use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // 获取窗口
            let window = app.get_webview_window("main").unwrap();
            // 设置窗口可调整大小
            window.set_resizable(true).unwrap();
            // 设置窗口最小尺寸
            window.set_min_size(Some(tauri::Size::Physical(tauri::PhysicalSize {
                width: 400,
                height: 500,
            }))).unwrap();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("错误：启动桌面便签失败");
}