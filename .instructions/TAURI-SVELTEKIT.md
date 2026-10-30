# Svelte 5 + SvelteKit Frontend Standard for Tauri v2

Frontend complement of `TAURI.md` for this repository: the `@oito2/*` Svelte component libraries and the SvelteKit showcase app. Always apply it together with `TAURI.md`; when both cover a topic, `TAURI.md` rules the Rust and configuration side and this file rules the webview side.

---

## Stack

| Tool | Version line | Notes |
|---|---|---|
| Node | 24 LTS | `engines.node >= 24`, `engine-strict=true` |
| pnpm | 12 (pinned in `packageManager`) | Enabled through `corepack enable` |
| Svelte | 5 | Runes mode everywhere (`compilerOptions.runes: true`) |
| SvelteKit | 3 | Showcase only; the libraries don't depend on it |
| Vite | 8 | |
| TypeScript | 6.0 | **Not 7**: SvelteKit, `@sveltejs/package`, `svelte-check` and `typescript-eslint` still require 6 |
| Vitest | 5 | Browser mode with the Playwright provider |
| `@sveltejs/package` | 3 | Standalone; builds `src/lib` into `dist` |
| Tauri | 2.12 | `@tauri-apps/api` and `@tauri-apps/cli` on the same major.minor as the `tauri` crate |

Every version lives once in the `catalog:` of `pnpm-workspace.yaml`; package manifests refer to it with `"catalog:"`. Internal packages use `"workspace:*"`. Upgrade a version in the catalog only, and check the peer ranges (`npm view <pkg> peerDependencies`) before moving a major.

### WebView baseline

| Platform | Minimum WebView | Systems |
|---|---|---|
| Linux | WebKitGTK 2.50 | Ubuntu 22.04+, Debian 12+, Linux Mint 21+, Zorin OS 17+, current Fedora |
| Windows | WebView2 Evergreen | Windows 10 22H2 and 11 |
| macOS | Safari/WebKit 26 | macOS 14 Sonoma and later |

- Every CSS, DOM and JavaScript feature a library uses must work on the whole baseline. Check new features with the showcase page `/spikes/baseline`.
- Known gaps on WebKitGTK 2.50: `field-sizing` (use it only as progressive enhancement, with a script fallback that sizes the field from its `scrollHeight`) and `scrollbar-color` (not needed: `ScrollArea` draws its own scrollbar).
- Available on the whole baseline: anchor positioning, the Popover API, View Transitions, scroll-driven animations, `@starting-style`, `color-mix()`, `oklch()`, `light-dark()`, `:has()`, CSS nesting, `@layer`, container queries, `<dialog>` and `inert`. Overlay positioning still goes through `@floating-ui/dom`.
- The baseline is reviewed in April 2027, when Ubuntu 22.04 leaves standard support: it then moves to WebKitGTK 2.52 and the fallbacks above are removed.

---

## Repository Layout

```text
packages/<name>/          # @oito2/<name> library (no SvelteKit)
├── package.json          # exports → dist, "svelte" condition, sideEffects: ["**/*.css"]
├── svelte.config.js      # runes mode
├── vite.config.ts        # svelte() + Vitest projects "browser" and "node"
├── tsconfig.json         # extends ../../tsconfig.base.json
└── src/lib/              # sources; svelte-package copies non-TS files (CSS, fonts) as they are
apps/showcase/            # SvelteKit 3 app + src-tauri/ (see TAURI.md)
plugins/tauri-plugin-*/   # Rust plugins (see TAURI.md)
```

- Libraries are built with `svelte-package` and checked with `publint`. The showcase consumes the **built** packages: run `pnpm build` at the root before `pnpm tauri dev` or after changing a library.
- Import relative TypeScript modules with the `.js` extension (`import { x } from './x.js'`); `svelte-package` keeps import paths as written.
- Assets that ship with a library (fonts, their `OFL.txt`) live under `src/lib/assets/` and are referenced with relative `url()`s, so they survive packaging.

---

## SvelteKit 3 (showcase)

- The Kit configuration lives in `vite.config.ts`, inside `sveltekit({ ... })` (adapter, `paths`, compiler options). There is no `svelte.config.js` in the app.
- App-internal imports use the `#lib` subpath import (`import x from '#lib/spikes/bridge.js'`), declared in the app's `package.json` `imports`. `$lib` is not used.
- `tsconfig.json` extends `$app/tsconfig` and adds `"types": ["$app/types", "node"]`.
- The app is a client-only SPA: `export const ssr = false` in the root `+layout.ts`, `adapter-static` with `fallback: 'index.html'`.
- Links go through `resolve()` from `$app/paths`, so the GitHub Pages build under `BASE_PATH=/oito2_uikit` works. Never hardcode root-relative URLs.

---

## Component Conventions

- **Atomic components** (one concept, no parts) are single `.svelte` files exported by name: `import { Button } from '@oito2/ui'`.
- **Compound components** export a namespace of parts: `export * as Tabs from './components/tabs/index.js'` → `<Tabs.Root>`, `<Tabs.List>`, `<Tabs.Trigger>`, `<Tabs.Content>`. `Root` creates the state class and publishes it with `setContext`; the parts read it.
- **No `Oito2` prefix** in component or type names; the npm scope is the namespace. CSS uses `--oito2-*` variables, `.oito2-*` classes and `data-oito2-*` attributes.
- **Props:** `class`, a `$bindable` `ref`, `...rest` spread on the root element, `disabled`, and controllable state (`value`/`open`/`checked` with `bind:`, an `on<Name>Change` callback and a `default<Name>` for uncontrolled use).
- **Snippets** for customizable content (`icon`, `label`, `trailing`, `empty`).
- **State and controllers** are classes in `.svelte.ts` files with `$state`/`$derived` fields. No Svelte stores.
- **Context:** each provider has a `set<Name>(get)` function, which takes a getter so props and `$state` stay reactive, and a `use<Name>()` function that returns a live ref (`.current`, or named getters) with a documented fallback when no provider exists. A provider component (`SystemScope`, `LocaleProvider`) only calls `set<Name>` and renders its children.
- **Reusable behaviors** are attachments (`{@attach ...}`), not `use:` actions.
- **Interaction primitives** live in `packages/ui/src/lib/internal/` and are not exported: focus scope, roving focus, typeahead, dismissable layer, `Portal`, floating positioning, presence, scroll lock, live region and `Controllable`. Components build on them instead of re-implementing focus or dismissal.
- **Icons** are `@lucide/svelte` components imported one by one (`import X from '@lucide/svelte/icons/x'`); props that take an icon are typed `IconComponent`.
- **Components** live in `packages/ui/src/lib/components/<group>/`; compound parts sit in a subfolder with an `index.ts` (`export { default as Root } …`).
- **Overlays** render through `Portal`, which targets the host the closest `ThemeProvider` renders at the end of its `div`, so they keep the theme; they are positioned with `position: fixed`.
- **SSR-safe:** no `window`, `document` or `navigator` access at module level; touch the DOM only inside `$effect`, attachments, event handlers or `onMount`.
- **Behavior is written in-house** following the WAI-ARIA Authoring Practices pattern of each widget (roles, keyboard, focus). The only positioning dependency is `@floating-ui/dom`. Ark UI is a conceptual reference: never copy its code.
- **Strings** come from the `@oito2/ui` localizations (en and pt-BR) and can be overridden by a prop.
- **TSDoc in English** on every public export and prop; it feeds the generated API docs.

## Styling

- Plain CSS with custom properties; no CSS framework.
- Every component rule sits inside `@layer oito2 { ... }` in the component's scoped `<style>`, so unlayered app CSS always wins.
- Read tokens through `var(--oito2-...)`; never hardcode a color, radius, spacing or size that has a token.
- Token values live only in `packages/ui/src/lib/tokens/values.ts` (a module without imports). `tokens.css` is generated from it: after changing a value run `pnpm generate`; CI runs `pnpm generate:check`. Parity with oito2_ui is tested against `packages/ui/src/fixtures/parity/*.json`, exported by `tools/parity` (`flutter test` there).
- Colors come from the active theme's custom properties: `--oito2-color-<role>` (Material 3 roles in kebab-case, plus `background`, `primary-text`, `error-text`, `success`, `warning`, `info` and `link`), `--oito2-chrome-<surface>` and `--oito2-syntax-<role>`. Text uses the text-safe roles (`on-surface`, `on-surface-variant`, `primary-text`, `error-text`, status colors); `primary` and `error` are fills.
- Style states through data attributes (`data-state`, `data-disabled`, `data-orientation`, `data-highlighted`, `data-placement`).
- Density: pointer sizes by default; touch sizes under `@media (pointer: coarse)` or `[data-oito2-density='touch']`. Components read the density variables of `density.css` (`--oito2-control-height`, `--oito2-icon-size`, `--oito2-toggle-size`…), never a fixed pointer size.
- Selected controls use `--oito2-color-selected-fill` and `--oito2-color-on-selected-fill`; the focus ring is a 2-pixel `outline` in `--oito2-color-primary-text`.
- Motion respects `prefers-reduced-motion`.

---

## Tauri on the Webview Side

- Libraries must work outside Tauri (the showcase also ships as a web build). Guard native calls with `isTauri()` from `@tauri-apps/api/core`, and load Tauri-only modules with a dynamic `import()` behind that guard in library code.
- Window actions use `getCurrentWindow()` from `@tauri-apps/api/window`; plugin calls use `invoke('plugin:<name>|<command>')` wrapped in a typed function of the plugin's `@oito2/ui-*` package.
- Every window action or plugin command the showcase uses needs its permission in `src-tauri/capabilities/` (least privilege, see `TAURI.md`).
- Title bars get their window through `WindowScope` (`@oito2/ui`), fed by `initWindow()` from `@oito2/ui-window`, which returns `null` outside Tauri; components never call `getCurrentWindow()` themselves.
- `tauri-plugin-oito2-window` is the only crate that may use `unsafe`, and only in `src/menu.rs` (native window menu); every other crate keeps the workspace `unsafe_code = "forbid"`.
- Tests mock IPC with `@tauri-apps/api/mocks` (`mockIPC`, `mockWindows`, `clearMocks`).
- `@material/material-color-utilities` (used by the color schemes) imports its own modules without file extensions, which only a bundler resolves. Every Vitest config inlines it (`test.server.deps.inline`), build scripts load the sources through Vite's module runner, and an app that renders `@oito2/ui` on a Node server (SSR) must add it to `ssr.noExternal`. Tauri apps, which are client-only SPAs, need nothing.

---

## Tests

| File name | Runs in | Use for |
|---|---|---|
| `*.test.ts` | Node | Pure logic: tokens, colors, parsers, collections, formatting |
| `*.svelte.test.ts` | Chromium and WebKit | Components (`vitest-browser-svelte` `render`, `page` locators) |
| `*.browser.test.ts` | Chromium and WebKit | DOM/CSS behavior without a component (fonts, focus utilities) |

- Chromium stands in for WebView2, WebKit for WebKitGTK and WKWebView. A test that passes in only one engine is a bug, not a flaky test.
- Visual goldens use Vitest's `toMatchScreenshot`; reference images live in `__screenshots__/` next to the test and are committed. Regenerate them only on purpose (`vitest run --update`).
- `expect.requireAssertions` is on: every test asserts something.
- Accessibility: component galleries run `axe-core` inside the browser tests (keep the gallery inside the viewport, axe measures contrast only there); axe checks on every showcase page from phase F14.
- Test harnesses import `styles.css` and wrap their content in a `ThemeProvider`: without the tokens the controls have no size.
- The local machine needs `libavif16` for Playwright's WebKit (`sudo apt-get install libavif16`).

---

## Headers

Every hand-written source file starts with the GPL-3.0 notice of `tools/templates/` in its comment syntax: `header.txt` for `.ts`/`.js`/`.rs`, `header.css.txt` for `.css`, `header.html.txt` for `.svelte`/`.html`, and `header.hash.txt` for `.toml`/`.yaml`. JSON files carry no header.

---

## Quality

Run from the repository root before reporting a task as done (Prettier reads `.prettierignore` from the current directory only, so always run it from the root):

```bash
pnpm lint      # prettier --check + eslint
pnpm check     # svelte-check in every package and the showcase
pnpm test      # Vitest node + browser projects
pnpm build     # svelte-package + publint, showcase static build
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
```
