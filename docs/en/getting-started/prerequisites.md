🌐 [Português](../../pt-br/getting-started/prerequisites.md) | **English** | 🏠 [Index](../index.md)

---

# Prerequisites

What you need to build a Tauri v2 app with oito2_uikit, or to build the showcase from this repository. To only **run** the showcase from a release installer, you need nothing but the [runtime dependencies](#runtime-dependencies-for-end-users).

## Supported systems

| OS      | Status    | Minimum version / distributions                                         | WebView                |
| ------- | --------- | ----------------------------------------------------------------------- | ---------------------- |
| Linux   | Supported | Ubuntu 22.04+, Debian 12+, Linux Mint 21+, Zorin OS 17+, current Fedora | WebKitGTK 2.50+        |
| Windows | Supported | Windows 10 22H2 and Windows 11                                          | WebView2 (Evergreen)   |
| macOS   | Supported | macOS 14 Sonoma and later                                               | WKWebView (Safari 26+) |

Mobile platforms (Android, iOS) are not supported.

## Development tools

| Tool                     | Version                                                                                                             | Needed for                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Node.js                  | 24 or later (`engines.node >= 24`)                                                                                  | Apps using the npm packages; the repository              |
| pnpm                     | Any recent version for apps; `pnpm@12.16.1` for this repository (pinned in `package.json`)                          | Installing packages; the repository uses pnpm workspaces |
| Rust                     | 1.90 or later for apps (the crates' `rust-version`); `1.99.0` for this repository (pinned in `rust-toolchain.toml`) | The Tauri side and the two plugins                       |
| Tauri v2 system packages | See below                                                                                                           | Building any Tauri app                                   |

An app can also use npm to add the packages; the examples in this documentation use pnpm.

### Node.js and pnpm

Install Node.js 24 LTS from <https://nodejs.org> or your system's package manager, then enable pnpm through Corepack:

```bash
corepack enable
```

Inside this repository, Corepack picks the pnpm version pinned in `package.json`.

### Rust

On Linux and macOS:

```bash
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
```

On Windows, download and run `rustup-init.exe` from <https://rustup.rs>, and keep the MSVC toolchain as the default host (`rustup default stable-msvc` if Rust is already installed).

In this repository, rustup installs the toolchain pinned in `rust-toolchain.toml` (with `rustfmt` and `clippy`) the first time a `cargo` command runs.

## Tauri v2 system packages

These are the packages of the official [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/). Tauri v2 needs **WebKitGTK 4.1** on Linux; `webkit2gtk-4.0` belongs to Tauri v1 and does not work.

### Linux

Debian, Ubuntu, Linux Mint, Zorin OS:

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev librsvg2-dev
```

Fedora:

```bash
sudo dnf check-update
sudo dnf install webkit2gtk4.1-devel openssl-devel curl wget file librsvg2-devel libxdo-devel
sudo dnf group install "c-development"
```

Arch Linux:

```bash
sudo pacman -Syu
sudo pacman -S --needed webkit2gtk-4.1 base-devel curl wget file openssl librsvg xdotool
```

Arch Linux is not part of the tested baseline; the command is listed because it is the official Tauri one.

### Windows

- **Microsoft C++ Build Tools**, with the **Desktop development with C++** workload.
- **WebView2 runtime** — already present on Windows 10 22H2 and Windows 11. If it is missing, install the Evergreen Bootstrapper from Microsoft's WebView2 download page.
- **VBSCRIPT** (Windows optional feature) — only to build `.msi` installers; enable it if the build fails with `failed to run light.exe`.

### macOS

Xcode, or only its command line tools (enough for desktop apps):

```bash
xcode-select --install
```

To build the universal macOS showcase, also add both Apple targets:

```bash
rustup target add aarch64-apple-darwin x86_64-apple-darwin
```

## Extra tools for this repository

| Tool                | Needed for                                   | Install                                                                                           |
| ------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Playwright browsers | The browser tests and the showcase e2e tests | `pnpm --filter @oito2/ui exec playwright install chromium webkit`                                 |
| `libavif16` (Linux) | Playwright's WebKit                          | `sudo apt install libavif16`                                                                      |
| Flutter (stable)    | Only to regenerate the parity fixtures       | With an oito2_ui checkout in `.references/oito2_ui`; see [CONTRIBUTING](../../../CONTRIBUTING.md) |

## Runtime dependencies for end users

A built Tauri app uses the system WebView; users install no Node.js or Rust.

| OS      | What the user needs                                                                                                                                                                                                                                                                                               |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Linux   | The WebKitGTK 4.1 runtime: `libwebkit2gtk-4.1-0` (Debian/Ubuntu) or `webkit2gtk4.1` (Fedora). The `.deb` and `.rpm` packages declare it as a dependency, so the package manager installs it. The AppImage needs FUSE 2 (see [Troubleshooting](../troubleshooting/common-issues.md#appimage-does-not-start-fuse)). |
| Windows | WebView2 (Evergreen), present on every supported Windows version                                                                                                                                                                                                                                                  |
| macOS   | Nothing: WKWebView is part of the system                                                                                                                                                                                                                                                                          |

## Next steps

- [Installation](./installation.md) — add the libraries to an app, install or build the showcase.
- [Quickstart](./quickstart.md) — a themed Tauri window with the oito2 title bar.
