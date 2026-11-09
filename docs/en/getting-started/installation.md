🌐 [Português](../../pt-br/getting-started/installation.md) | **English** | 🏠 [Index](../index.md)

---

# Installation

This page covers three things: adding the oito2_uikit libraries to your app, installing the showcase from a release, and building the showcase from source. Install the [prerequisites](./prerequisites.md) first.

## Table of Contents

- [Supported systems](#supported-systems)
- [Adding the libraries to an app](#adding-the-libraries-to-an-app)
- [Linux](#linux)
- [Windows](#windows)
- [macOS](#macos)
- [Which bundle builds where](#which-bundle-builds-where)
- [Verifying a download](#verifying-a-download)

## Supported systems

| OS      | Status    | Minimum version / distributions                                         | WebView                |
| ------- | --------- | ----------------------------------------------------------------------- | ---------------------- |
| Linux   | Supported | Ubuntu 22.04+, Debian 12+, Linux Mint 21+, Zorin OS 17+, current Fedora | WebKitGTK 2.50+        |
| Windows | Supported | Windows 10 22H2 and Windows 11                                          | WebView2 (Evergreen)   |
| macOS   | Supported | macOS 14 Sonoma and later                                               | WKWebView (Safari 26+) |

Android and iOS are not supported. The Svelte packages also run in a browser, which is how the [web showcase](https://oito2.github.io/oito2_uikit/) is built.

## Adding the libraries to an app

These steps are the same on Linux, Windows and macOS. Every npm package and both Rust crates share one version; keep them on the same release.

### 1. npm packages

`@oito2/ui` is the only required package; it needs `svelte` 5 (`^5.57.0`) as a peer dependency. The other packages declare `@oito2/ui` as a peer dependency too, and `@oito2/ui-files`, `@oito2/ui-window` and `@oito2/ui-settings` declare the `@tauri-apps/*` packages they use (`@tauri-apps/api` `^2.12.0`; for `ui-files` also `@tauri-apps/plugin-dialog` `^2.8.0` and `@tauri-apps/plugin-fs` `^2.7.0`): add them to the app, on the same major.minor as its Tauri crates.

```bash
pnpm add @oito2/ui
```

Add the optional packages you use:

| Package              | Adds                                                                | Rust side                                |
| -------------------- | ------------------------------------------------------------------- | ---------------------------------------- |
| `@oito2/ui-themes`   | The 13 named color presets                                          | —                                        |
| `@oito2/ui-syntax`   | Syntax highlighting and a code block                                | —                                        |
| `@oito2/ui-extras`   | QR code, signature pad, image cropper, navigation menu              | —                                        |
| `@oito2/ui-files`    | File upload, drop zone and download                                 | `tauri-plugin-dialog`, `tauri-plugin-fs` |
| `@oito2/ui-window`   | The window controller for the title bars                            | `tauri-plugin-oito2-window`              |
| `@oito2/ui-settings` | The real system settings (desktop, button layout, accent, contrast) | `tauri-plugin-oito2-settings`            |

### 2. Styles and fonts

Import the stylesheet once, in the root layout. It brings the Inter font (bundled with the package), the tokens, the density sizes and the base styles:

```ts
import '@oito2/ui/styles.css';
```

`@oito2/ui-syntax` ships its monospace font (JetBrains Mono) separately: `import '@oito2/ui-syntax/fonts.css';`. Then wrap the app in a `ThemeProvider` — see the [Quickstart](./quickstart.md).

### 3. Rust plugins

The two plugins are not on crates.io. Add them from the repository, pinned to the release tag, in `src-tauri/Cargo.toml`:

```toml
[dependencies]
tauri-plugin-oito2-window = { git = "https://github.com/oito2/oito2_uikit", tag = "v0.1.0" }
tauri-plugin-oito2-settings = { git = "https://github.com/oito2/oito2_uikit", tag = "v0.1.0" }
```

They are built against `tauri` 2.12 and need Rust 1.90 or later. Register them in `src-tauri/src/lib.rs`:

```rust
tauri::Builder::default()
    .plugin(tauri_plugin_oito2_window::init())
    .plugin(tauri_plugin_oito2_settings::init())
```

For `@oito2/ui-files`, also add and register the official `tauri-plugin-dialog` and `tauri-plugin-fs` plugins (with their `@tauri-apps/plugin-*` packages on the same major.minor).

### 4. Capabilities

Grant the permissions to the window in a capability file (`src-tauri/capabilities/default.json`). This is the showcase's capability, which uses everything:

```json
{
	"$schema": "../gen/schemas/desktop-schema.json",
	"identifier": "main-capability",
	"windows": ["main"],
	"permissions": [
		"core:default",
		"core:window:allow-minimize",
		"core:window:allow-toggle-maximize",
		"core:window:allow-close",
		"core:window:allow-start-dragging",
		"core:window:allow-start-resize-dragging",
		"oito2-window:default",
		"oito2-settings:default",
		"dialog:allow-open",
		"dialog:allow-save",
		"fs:allow-stat",
		"fs:allow-read-file",
		"fs:allow-write-file"
	]
}
```

| Permissions                                                                                             | Needed by                                                    |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `core:window:allow-minimize`, `-toggle-maximize`, `-close`, `-start-dragging`, `-start-resize-dragging` | The window controls, dragging and resizing of the title bars |
| `oito2-window:default` (`allow-set-decoration-mode`, `allow-decoration-mode`, `allow-show-window-menu`) | `@oito2/ui-window`                                           |
| `oito2-settings:default` (`allow-read-settings`)                                                        | `@oito2/ui-settings`                                         |
| `dialog:allow-open`, `dialog:allow-save`, `fs:allow-stat`, `fs:allow-read-file`, `fs:allow-write-file`  | `@oito2/ui-files`                                            |

Grant only what your app uses. `initWindow()` options that change the window need more permissions (listed in the [`@oito2/ui-window` README](../../../packages/ui-window/README.md)). The details of each package are in its README: [`@oito2/ui`](../../../packages/ui/README.md), [`@oito2/ui-window`](../../../packages/ui-window/README.md), [`@oito2/ui-settings`](../../../packages/ui-settings/README.md), [`@oito2/ui-files`](../../../packages/ui-files/README.md), [`tauri-plugin-oito2-window`](../../../plugins/tauri-plugin-oito2-window/README.md), [`tauri-plugin-oito2-settings`](../../../plugins/tauri-plugin-oito2-settings/README.md).

## Linux

### Runtime dependency

Tauri apps need the WebKitGTK 4.1 runtime: `libwebkit2gtk-4.1-0` (Debian/Ubuntu) or `webkit2gtk4.1` (Fedora). The showcase `.deb` and `.rpm` packages declare it, so the package manager installs it with them.

### Installing the showcase

Download the file for your system from the [latest release](https://github.com/oito2/oito2_uikit/releases/latest), together with `SHA256SUMS`, and [verify it](#verifying-a-download). The Linux builds are for x86-64 and are built on Ubuntu 22.04, the oldest system of the baseline.

| File                                              | For                                    |
| ------------------------------------------------- | -------------------------------------- |
| `oito2-uikit-showcase-X.Y.Z-linux-amd64.deb`      | Debian, Ubuntu, Linux Mint, Zorin OS   |
| `oito2-uikit-showcase-X.Y.Z-linux-x86_64.rpm`     | Fedora                                 |
| `oito2-uikit-showcase-X.Y.Z-linux-amd64.AppImage` | Any supported distribution, no install |

```bash
# Debian, Ubuntu, Linux Mint, Zorin OS
sudo apt install ./oito2-uikit-showcase-X.Y.Z-linux-amd64.deb

# Fedora
sudo dnf install ./oito2-uikit-showcase-X.Y.Z-linux-x86_64.rpm

# AppImage
chmod +x oito2-uikit-showcase-X.Y.Z-linux-amd64.AppImage
./oito2-uikit-showcase-X.Y.Z-linux-amd64.AppImage
```

The `.deb` and `.rpm` packages install the `oito2-uikit-showcase` binary in `/usr/bin` and add the app to the application menu as **oito2_uikit Showcase**. The AppImage needs FUSE 2; see [Troubleshooting](../troubleshooting/common-issues.md#appimage-does-not-start-fuse).

### Building the showcase from source

```bash
git clone https://github.com/oito2/oito2_uikit.git
cd oito2_uikit
corepack enable
pnpm install
pnpm build
pnpm tauri build --bundles deb,rpm,appimage
```

`pnpm build` builds the libraries the showcase consumes; `pnpm tauri build` then builds the showcase web app (its `beforeBuildCommand`), the Rust binary and the bundles. The Cargo workspace's target directory is at the repository root:

| Bundle   | Output                            |
| -------- | --------------------------------- |
| deb      | `target/release/bundle/deb/`      |
| rpm      | `target/release/bundle/rpm/`      |
| AppImage | `target/release/bundle/appimage/` |

Without `--bundles`, `pnpm tauri build` builds every bundle type of the current OS (`"targets": "all"` in `tauri.conf.json`). Add `--debug` for a faster debug build (`pnpm tauri build --debug --bundles deb` writes to `target/debug/bundle/`). Run `pnpm tauri dev` to start the showcase without bundling.

## Windows

### Runtime dependency

WebView2 (Evergreen), present on Windows 10 22H2 and Windows 11.

### Installing the showcase

Download one installer from the [latest release](https://github.com/oito2/oito2_uikit/releases/latest), together with `SHA256SUMS`, and [verify it](#verifying-a-download):

| File                                               | Installer                 |
| -------------------------------------------------- | ------------------------- |
| `oito2-uikit-showcase-X.Y.Z-windows-x64-setup.exe` | NSIS setup program        |
| `oito2-uikit-showcase-X.Y.Z-windows-x64.msi`       | Windows Installer package |

Run the installer and follow its steps. The installers are **not code-signed**, so Microsoft Defender SmartScreen may show **"Windows protected your PC"**. After checking the checksum, choose **More info** → **Run anyway**.

### Building the showcase from source

In PowerShell, with the [prerequisites](./prerequisites.md#windows) installed:

```powershell
git clone https://github.com/oito2/oito2_uikit.git
cd oito2_uikit
corepack enable
pnpm install
pnpm build
pnpm tauri build --bundles msi,nsis
```

| Bundle | Output                        | Builds on                |
| ------ | ----------------------------- | ------------------------ |
| msi    | `target\release\bundle\msi\`  | Windows only (WiX)       |
| nsis   | `target\release\bundle\nsis\` | Windows (the release CI) |

## macOS

### Runtime dependency

None: WKWebView is part of macOS.

### Installing the showcase

Download `oito2-uikit-showcase-X.Y.Z-macos-universal.dmg` from the [latest release](https://github.com/oito2/oito2_uikit/releases/latest), together with `SHA256SUMS`, and [verify it](#verifying-a-download). The disk image holds a universal app (Apple silicon and Intel). Open it and drag **oito2_uikit Showcase** to **Applications**.

The app is **not signed or notarized**, so Gatekeeper blocks it on the first launch. After checking the checksum:

- Open **System Settings** → **Privacy & Security**, find the message about the blocked app and choose **Open Anyway**, then confirm.
- On macOS 14, Control-click the app in Finder and choose **Open** also works.

If macOS reports that the app "is damaged and can't be opened", it is the quarantine attribute of the download on an unsigned app; remove it with:

```bash
xattr -dr com.apple.quarantine "/Applications/oito2_uikit Showcase.app"
```

### Building the showcase from source

```bash
git clone https://github.com/oito2/oito2_uikit.git
cd oito2_uikit
corepack enable
pnpm install
pnpm build
rustup target add aarch64-apple-darwin x86_64-apple-darwin
pnpm tauri build --target universal-apple-darwin --bundles app,dmg
```

| Bundle | Output                                                |
| ------ | ----------------------------------------------------- |
| app    | `target/universal-apple-darwin/release/bundle/macos/` |
| dmg    | `target/universal-apple-darwin/release/bundle/dmg/`   |

Without `--target`, the build is for the current Mac's architecture only and goes under `target/release/bundle/`. The `.app` and `.dmg` bundles build only on macOS.

## Which bundle builds where

| Bundle   | Built on | Release artifact                                   |
| -------- | -------- | -------------------------------------------------- |
| deb      | Linux    | `oito2-uikit-showcase-X.Y.Z-linux-amd64.deb`       |
| rpm      | Linux    | `oito2-uikit-showcase-X.Y.Z-linux-x86_64.rpm`      |
| appimage | Linux    | `oito2-uikit-showcase-X.Y.Z-linux-amd64.AppImage`  |
| msi      | Windows  | `oito2-uikit-showcase-X.Y.Z-windows-x64.msi`       |
| nsis     | Windows  | `oito2-uikit-showcase-X.Y.Z-windows-x64-setup.exe` |
| app      | macOS    | — (inside the `.dmg`)                              |
| dmg      | macOS    | `oito2-uikit-showcase-X.Y.Z-macos-universal.dmg`   |

The [release workflow](../../../.github/workflows/release.yml) builds each group on its own OS and renames the files as above.

## Verifying a download

Each release has a `SHA256SUMS` file covering every installer. Put it in the same folder as the download and check:

```bash
# Linux
sha256sum -c SHA256SUMS --ignore-missing

# macOS: compare the printed hash with the line of SHA256SUMS
shasum -a 256 oito2-uikit-showcase-X.Y.Z-macos-universal.dmg
```

```powershell
# Windows: compare the hash with the line of SHA256SUMS
Get-FileHash -Algorithm SHA256 .\oito2-uikit-showcase-X.Y.Z-windows-x64-setup.exe
```

To remove the libraries or the showcase, see [Uninstallation](./uninstallation.md).
