🌐 [Português](../../pt-br/troubleshooting/common-issues.md) | **English** | 🏠 [Index](../index.md)

---

# Common issues

Problems you may meet when building an app with oito2_uikit or working on this repository, indexed by symptom.

| Symptom                                                                                       | Section                                                                             |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Rust build fails: `webkit2gtk-4.1` not found, or the app cannot load `libwebkit2gtk-4.1.so.0` | [WebKitGTK 4.1 missing](#webkitgtk-41-missing-linux)                                |
| Windows or macOS refuses to open the showcase installer or app                                | [Unsigned installers blocked](#unsigned-installers-blocked)                         |
| The AppImage does not start and mentions FUSE or `libfuse.so.2`                               | [AppImage does not start (FUSE)](#appimage-does-not-start-fuse)                     |
| A library change does not show up in the showcase or in your app                              | [Library changes not picked up](#library-changes-not-picked-up)                     |
| Builds or `pnpm tauri dev` fail after moving the repository folder                            | [Stale paths after moving the repository](#stale-paths-after-moving-the-repository) |
| Server-side rendering fails to import `@material/material-color-utilities`                    | [SSR apps](#ssr-apps-and-materialmaterial-color-utilities)                          |
| Playwright's WebKit does not launch on Linux                                                  | [Playwright WebKit needs libavif16](#playwright-webkit-needs-libavif16)             |
| Controls have no size or no colors                                                            | [Controls without size or colors](#controls-without-size-or-colors)                 |
| Dialogs, menus or popovers lose the theme                                                     | [Overlays lose the theme](#overlays-lose-the-theme)                                 |
| A window action or plugin call is rejected as "not allowed"                                   | [Missing capability permission](#missing-capability-permission)                     |
| `pnpm docs` opens a web page instead of generating the API reference                          | [`pnpm docs` is a pnpm command](#pnpm-docs-is-a-pnpm-command)                       |

## WebKitGTK 4.1 missing (Linux)

**Symptom:** `cargo build` or `pnpm tauri dev` stops with a `pkg-config` error saying the system library `webkit2gtk-4.1` (or `javascriptcoregtk-4.1`) was not found; or a built app fails to start with `error while loading shared libraries: libwebkit2gtk-4.1.so.0`.

**Cause:** Tauri v2 needs WebKitGTK **4.1**. The `webkit2gtk-4.0` packages are for Tauri v1 and do not satisfy it.

**Fix:** install the development packages listed in [Prerequisites](../getting-started/prerequisites.md#linux) to build (`libwebkit2gtk-4.1-dev` on Debian/Ubuntu, `webkit2gtk4.1-devel` on Fedora), or only the runtime to run an app (`libwebkit2gtk-4.1-0`, `webkit2gtk4.1`). The supported baseline is WebKitGTK 2.50 or later (Ubuntu 22.04+, Debian 12+, Linux Mint 21+, Zorin OS 17+, current Fedora).

## Unsigned installers blocked

**Symptom:** on Windows, Microsoft Defender SmartScreen shows "Windows protected your PC" when you run the showcase installer. On macOS, Gatekeeper refuses to open the app because Apple cannot check it for malicious software, or says it "is damaged and can't be opened".

**Cause:** the showcase installers are not code-signed (and not notarized on macOS). This is the standard behavior of both systems for unsigned downloads.

**Fix:** first verify the file against `SHA256SUMS` ([Installation](../getting-started/installation.md#verifying-a-download)). Then:

- **Windows:** choose **More info** → **Run anyway**.
- **macOS:** in **System Settings** → **Privacy & Security**, choose **Open Anyway** for the app. If macOS says the app is damaged, remove the quarantine attribute: `xattr -dr com.apple.quarantine "/Applications/oito2_uikit Showcase.app"`.

## AppImage does not start (FUSE)

**Symptom:** running `oito2-uikit-showcase-X.Y.Z-linux-amd64.AppImage` prints an error about FUSE or `libfuse.so.2`.

**Cause:** AppImages mount themselves with FUSE 2, which recent distributions no longer install by default (Ubuntu 22.04 and later ship FUSE 3).

**Fix:** install the FUSE 2 library — `sudo apt install libfuse2` on Ubuntu 22.04, `sudo apt install libfuse2t64` on Ubuntu 24.04 and later, `sudo dnf install fuse-libs` on Fedora. Or use the `.deb`/`.rpm` package instead.

## Library changes not picked up

**Symptom:** you changed a component in `packages/*`, but the showcase (`pnpm showcase dev`, `pnpm tauri dev`) or an app linked to the workspace still shows the old behavior.

**Cause:** the showcase consumes the **built** packages (`dist/`, produced by `svelte-package`), not the sources.

**Fix:** run `pnpm build` at the repository root after changing a library, then restart the dev server.

## Stale paths after moving the repository

**Symptom:** after moving or renaming the repository folder, the Rust build, `pnpm tauri dev` or the dev server fail, or refer to the old location.

**Cause:** Cargo build outputs, the Vite dependency caches and the SvelteKit generated files record absolute paths of the old location.

**Fix:** from the repository root, clear those caches and the showcase's webview data, then rebuild:

```bash
cargo clean -p tauri-plugin-oito2-window -p tauri-plugin-oito2-settings -p oito2-uikit-showcase
rm -rf node_modules/.vite apps/showcase/node_modules/.vite apps/showcase/.svelte-kit
rm -rf ~/.local/share/io.github.oito2.uikit-showcase
pnpm build
```

Removing the webview data also resets the showcase settings (see [Uninstallation](../getting-started/uninstallation.md#data-left-behind) for the folder on each OS).

## SSR apps and `@material/material-color-utilities`

**Symptom:** an app that renders `@oito2/ui` on a Node server (SvelteKit with SSR) fails with a module resolution error inside `@material/material-color-utilities`.

**Cause:** that package imports its own modules without file extensions, which only a bundler resolves.

**Fix:** let Vite bundle it for the server, in the app's Vite config:

```ts
export default defineConfig({
	// ...
	ssr: { noExternal: ['@material/material-color-utilities'] }
});
```

Client-only apps, including every Tauri app (`export const ssr = false`), need nothing.

## Playwright WebKit needs libavif16

**Symptom:** on Linux, the browser tests (`browser (webkit)` project) or the showcase e2e tests in WebKit fail to launch the browser, reporting a missing `libavif` library.

**Fix:** `sudo apt install libavif16`. The browsers themselves come from `pnpm --filter @oito2/ui exec playwright install chromium webkit`.

## Controls without size or colors

**Symptom:** buttons, entries and other controls render collapsed or unstyled, or without theme colors.

**Cause:** the sizes come from `@oito2/ui/styles.css` (tokens and density variables); the colors come from the `ThemeProvider`, which sets the `--oito2-color-*` properties on its element.

**Fix:** import `@oito2/ui/styles.css` once in the root layout and render the components inside a `ThemeProvider` (see [Quickstart](../getting-started/quickstart.md#7-theme-the-window)). Test harnesses need the same two things.

## Overlays lose the theme

**Symptom:** dialogs, menus, popovers or toasts show default or wrong colors while the rest of the app is themed.

**Cause:** overlays are rendered through a portal into a host that the closest `ThemeProvider` places at the end of its element. Without a `ThemeProvider` around the overlay's component, the portal falls back to `document.body`, outside any theme.

**Fix:** make sure the component that opens the overlay (and the `Toaster`) sits inside the `ThemeProvider`, typically by wrapping the whole app in the root layout.

## Missing capability permission

**Symptom:** a window control (minimize, maximize, close, drag, resize), the window frame, the system settings or a file dialog does nothing, and the rejected promise or the webview console says the command is not allowed and lists the permissions associated with it.

**Cause:** Tauri v2 exposes no command to the webview unless a capability grants its permission to that window.

**Fix:** add the missing permission to the window's capability in `src-tauri/capabilities/`; the list per package is in [Installation](../getting-started/installation.md#4-capabilities). Check that the capability's `windows` contains the window **label** (`main`), not its title. Do not grant broader permissions than the one named in the error.

## `pnpm docs` is a pnpm command

**Symptom:** running `pnpm docs` in the repository opens a package's web page instead of regenerating the API reference.

**Cause:** `docs` is a built-in pnpm command, which takes precedence over a script with the same name.

**Fix:** use the repository scripts `pnpm docs:generate` (regenerate) and `pnpm docs:check` (check that it is up to date).
