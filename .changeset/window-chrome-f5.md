---
'@oito2/ui': minor
'@oito2/ui-window': minor
---

Add the window chrome. `@oito2/ui` gets `TitleBar`, `WindowTitleBar` (set up for the desktop from the closest `SystemScope`: the GNOME, KDE Breeze, Xfwm, COSMIC or Windows window controls in the desktop's button order, room for the macOS traffic lights, no controls in a browser), `DialogTitleBar`, `HeaderBar` with a built-in search field, `WindowControl` and `WindowControls` in seven styles, the `titleBarGestures` attachment (drag, double-click to maximize, window menu on the secondary button) and the `WindowController` interface with `WindowScope`. `@oito2/ui-window` adds `initWindow()`, `NativeWindowController` for Tauri windows, `WindowResizeHandles` for undecorated Linux windows and typed wrappers of the `tauri-plugin-oito2-window` commands, which now set and report the window frame and show the native window menu on Linux and Windows.
