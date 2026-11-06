🌐 [Português](../../pt-br/getting-started/uninstallation.md) | **English** | 🏠 [Index](../index.md)

---

# Uninstallation

How to remove the oito2_uikit libraries from an app, and how to remove the showcase and the data it leaves on the system.

## Removing the libraries from an app

The libraries install nothing outside your project. Undo the steps of [Installation](./installation.md#adding-the-libraries-to-an-app):

1. **npm packages** — remove the ones you added:

   ```bash
   pnpm remove @oito2/ui @oito2/ui-themes @oito2/ui-syntax @oito2/ui-extras @oito2/ui-files @oito2/ui-window @oito2/ui-settings
   ```

   Then delete the imports of `@oito2/*` modules and stylesheets (`@oito2/ui/styles.css`, `@oito2/ui-syntax/fonts.css`) from your sources.

2. **Rust plugins** — delete the `tauri-plugin-oito2-window` and `tauri-plugin-oito2-settings` lines from `src-tauri/Cargo.toml`, or run:

   ```bash
   cargo remove --manifest-path src-tauri/Cargo.toml tauri-plugin-oito2-window tauri-plugin-oito2-settings
   ```

3. **Plugin registration** — in `src-tauri/src/lib.rs`, delete `.plugin(tauri_plugin_oito2_window::init())`, `.plugin(tauri_plugin_oito2_settings::init())` and any `apply_decoration_mode` call in `setup`. Make sure the window still becomes visible: if it was configured with `"visible": false`, set it back to `true` or keep a `window.show()`.

4. **Capabilities** — remove `oito2-window:default` and `oito2-settings:default` (or the individual `oito2-window:*` / `oito2-settings:*` permissions) from `src-tauri/capabilities/*.json`. Once the crates are gone, their permission identifiers no longer exist and the build fails while they are still listed. Remove the `core:window:*`, `dialog:*` and `fs:*` permissions too if nothing else in the app uses them.

5. **Platform window settings** — if you copied the showcase's `tauri.linux.conf.json` (`"transparent": true`) or `tauri.macos.conf.json` (`"titleBarStyle": "Overlay"`, `"hiddenTitle": true`, `trafficLightPosition`), revert them: without the oito2 title bar, an overlaid macOS title bar leaves the content under the traffic lights.

## Removing the showcase

### Linux

The `.deb` and `.rpm` packages are named `oito2-uikit-showcase` (the product name in kebab case):

```bash
# Debian, Ubuntu, Linux Mint, Zorin OS
sudo apt remove oito2-uikit-showcase

# Fedora
sudo dnf remove oito2-uikit-showcase
```

The AppImage is not installed: delete the `oito2-uikit-showcase-X.Y.Z-linux-amd64.AppImage` file.

### Windows

Open **Settings** → **Apps** → **Installed apps** (on Windows 10, **Settings** → **Apps** → **Apps & features**), find **oito2_uikit Showcase** and choose **Uninstall**. This works for both the `-setup.exe` and the `.msi` installer.

### macOS

Quit the app and drag **oito2_uikit Showcase** from **Applications** to the Trash, then empty the Trash.

## Data left behind

The showcase keeps its settings (theme, accent, locale, density...) in the webview's `localStorage`. The webview stores it, with its caches, in a folder named after the app identifier `io.github.oito2.uikit-showcase`. Uninstalling the app does not remove it; delete it by hand:

| OS      | Folder                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------- |
| Linux   | `~/.local/share/io.github.oito2.uikit-showcase` (`$XDG_DATA_HOME/io.github.oito2.uikit-showcase`)       |
| Windows | `%LOCALAPPDATA%\io.github.oito2.uikit-showcase`                                                         |
| macOS   | `~/Library/WebKit/io.github.oito2.uikit-showcase` and `~/Library/Caches/io.github.oito2.uikit-showcase` |

```bash
# Linux
rm -rf ~/.local/share/io.github.oito2.uikit-showcase

# macOS
rm -rf ~/Library/WebKit/io.github.oito2.uikit-showcase ~/Library/Caches/io.github.oito2.uikit-showcase
```

```powershell
# Windows
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\io.github.oito2.uikit-showcase"
```

Running the showcase from source (`pnpm tauri dev`) uses the same folders.

### Removing a source checkout

If you built the showcase from source, deleting the repository folder removes everything the build produced (`node_modules/`, `target/`, `build/`, `.svelte-kit/`). The rustup toolchain, Node.js, pnpm and the system packages of the [prerequisites](./prerequisites.md) stay installed; remove them with their own tools if nothing else uses them. Playwright keeps its browsers in its own cache folder (`~/.cache/ms-playwright` on Linux); `pnpm exec playwright uninstall --all` removes them.
