---
'@oito2/ui-settings': minor
---

Add the system settings. `SystemSettingsScope` provides the real desktop environment, window control style and button layout, accent color and high-contrast preference to the components inside it (and to `ThemeProvider`, which follows the system accent and contrast by default): it reads them through `tauri-plugin-oito2-settings` when it mounts, follows the changes the plugin reports on Linux and reads them again when the window regains focus. `loadSystemSettings` reads them once, and `composeSystemSettings` turns the values the plugin reads into a `SystemSettings` with the rules of `oito2_ui_settings`. The plugin now has the `read_settings` command and the `oito2-settings://changed` event: on Linux it reads GSettings, the XDG desktop portal and the KDE, Xfce and COSMIC configuration files and watches them; on Windows and macOS it reads the accent color and the contrast preference.
