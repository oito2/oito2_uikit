---
'@oito2/ui-settings': patch
'@oito2/ui-window': patch
---

The Tauri plugins are now built on the `oito2_settings` and `oito2_foundation` crates of oito2_rs, with the same commands, events, permissions and JSON. `tauri-plugin-oito2-settings` now watches the settings on Windows and macOS too, so `oito2-settings://changed` reaches `SystemSettingsScope` there without waiting for the window to regain focus, and `RawSettings` gains `colorScheme`, `config.kdeLookAndFeelPackage` and `config.cosmicIsDark`. `tauri-plugin-oito2-window` re-exports `DecorationMode` and `ParseDecorationModeError` from `oito2_foundation`.
