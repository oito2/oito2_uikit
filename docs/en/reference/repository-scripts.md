🌐 [Português](../../pt-br/reference/repository-scripts.md) | **English** | 🏠 [Index](../index.md)

---

# Repository scripts

Every script of the workspace, the Cargo commands, the tools under `tools/`, and the GitHub Actions workflows. Run the pnpm scripts from the repository root unless stated otherwise. How to use them day to day is in [CONTRIBUTING.md](../../../CONTRIBUTING.md).

## Table of Contents

- [Root scripts](#root-scripts)
- [Package scripts](#package-scripts)
- [Showcase scripts](#showcase-scripts)
- [Cargo commands](#cargo-commands)
- [Tools](#tools)
- [CI workflows](#ci-workflows)

## Root scripts

From the root [`package.json`](../../../package.json) (pnpm 12.16.1 is pinned in `packageManager`; Node.js 24 or later is required):

| Script            | Command                                                                                          | What it does                                                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `build`           | `pnpm -r build`                                                                                  | Builds every package (`svelte-package` + `publint`) and the showcase's static build                                                                                              |
| `check`           | `pnpm -r --parallel check`                                                                       | `svelte-check` in every package and the showcase                                                                                                                                 |
| `test`            | `pnpm -r test`                                                                                   | Vitest (node and browser projects) in every package, then the showcase's Playwright tests                                                                                        |
| `lint`            | `prettier --check . && eslint . && node tools/lint-headers/check.ts`                             | Formatting, lint and license-header checks                                                                                                                                       |
| `lint:headers`    | `node tools/lint-headers/check.ts`                                                               | Fails listing the hand-written source files that do not start with the license notice                                                                                            |
| `format`          | `prettier --write .`                                                                             | Formats every file (run it from the root)                                                                                                                                        |
| `generate`        | `node tools/generate-css/generate.ts`                                                            | Writes `tokens.css`, `schemes.css` and `presets.css` from the TypeScript sources                                                                                                 |
| `generate:check`  | `node tools/generate-css/generate.ts --check`                                                    | Fails when a generated CSS file is out of date                                                                                                                                   |
| `docs:generate`   | `node tools/generate-docs/generate.ts`                                                           | Writes the showcase API reference, `apps/showcase/src/lib/api/api.json`                                                                                                          |
| `docs:check`      | `node tools/generate-docs/generate.ts --check`                                                   | Fails when `api.json` is out of date, or when an export cannot be traced to its declaration                                                                                      |
| `test:tools`      | `node --test "tools/**/*.test.ts"`                                                               | Unit tests of the tools (`tools/generate-docs/api.test.ts` against `tools/generate-docs/fixtures/`)                                                                              |
| `showcase`        | `pnpm --filter @oito2/showcase`                                                                  | Runs a showcase script: `pnpm showcase dev`, `pnpm showcase build`, ...                                                                                                          |
| `tauri`           | `pnpm --filter @oito2/showcase tauri`                                                            | Runs the Tauri CLI in the showcase: `pnpm tauri dev`, `pnpm tauri build`, ...                                                                                                    |
| `changeset`       | `changeset`                                                                                      | Records a user-facing change for the next release                                                                                                                                |
| `release:version` | `changeset version && node tools/release/sync-versions.ts && prettier --write "**/CHANGELOG.md"` | Applies the changesets, copies the new version to the Cargo workspace, `Cargo.lock`, the showcase `package.json` and `tauri.conf.json`, and formats the changelogs               |
| `release:check`   | `node tools/release/sync-versions.ts --check`                                                    | Checks that every version, the three workspace crates in `Cargo.lock` included, equals a tag given as argument: `pnpm release:check vX.Y.Z` (without one it exits with an error) |

`pnpm docs` is a built-in pnpm command, which is why the API reference scripts are named `docs:generate` and `docs:check`.

## Package scripts

Every package under `packages/` has the same three scripts:

| Script  | Command                                                      | Notes                                                                                                                         |
| ------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `build` | `svelte-package && publint`                                  | `@oito2/ui-test-utils` runs `svelte-package` only                                                                             |
| `check` | `svelte-check --tsconfig ./tsconfig.json --fail-on-warnings` | `@oito2/ui-themes` runs it without `--fail-on-warnings`; `@oito2/ui-test-utils` (TypeScript only) runs `tsc --noEmit` instead |
| `test`  | `vitest run`                                                 | The `node` project (`*.test.ts`) and the browser projects in Chromium and WebKit (`*.svelte.test.ts`, `*.browser.test.ts`)    |

Run one browser test file at a time while developing, as CONTRIBUTING describes:

```bash
cd packages/ui
pnpm exec vitest run src/lib/components/controls.svelte.test.ts \
  --project "browser (chromium)" --project "browser (webkit)" \
  --maxWorkers=1 --no-file-parallelism
pnpm exec vitest run --project node
```

The browser projects need the Playwright browsers: `pnpm --filter @oito2/ui exec playwright install chromium webkit` (on Linux, Playwright's WebKit also needs `libavif16`).

## Showcase scripts

From [`apps/showcase/package.json`](../../../apps/showcase/package.json):

| Script    | Command                                                                         | What it does                                                                           |
| --------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `dev`     | `vite dev`                                                                      | Development server on port 5173 (fixed, as Tauri expects)                              |
| `build`   | `vite build` and a copy of `build/index.html` to `build/404.html`               | Static build in `build/`; `BASE_PATH=/oito2_uikit` builds it for GitHub Pages          |
| `preview` | `vite preview`                                                                  | Serves the build                                                                       |
| `prepare` | `svelte-kit sync \|\| echo ''`                                                  | Generates the SvelteKit types after install                                            |
| `check`   | `svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --fail-on-warnings` | Type checks                                                                            |
| `test`    | `playwright test`                                                               | End-to-end tests of the **built** showcase in Chromium and WebKit, served on port 4173 |
| `tauri`   | `tauri`                                                                         | The Tauri CLI                                                                          |

The showcase consumes the built packages: run `pnpm build` at the root after changing a library. `tauri.conf.json` runs `pnpm dev` before `tauri dev` and `pnpm build` before `tauri build`:

| Command                                                              | Result                                                                                                           |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `pnpm tauri dev`                                                     | The showcase as a desktop app, with the Vite dev server                                                          |
| `pnpm tauri build`                                                   | Release build and every bundle of `bundle.targets` (`"all"`)                                                     |
| `pnpm tauri build --bundles deb,rpm,appimage`                        | The Linux packages, as the release workflow builds them                                                          |
| `pnpm tauri build --bundles msi,nsis`                                | The Windows installers                                                                                           |
| `pnpm tauri build --target universal-apple-darwin --bundles app,dmg` | The macOS universal app and disk image (needs the `aarch64-apple-darwin` and `x86_64-apple-darwin` Rust targets) |

Bundles are written under `target/release/bundle/` at the repository root (the Cargo workspace target), or `target/universal-apple-darwin/release/bundle/` for the macOS build.

`apps/showcase/smoke/webdriver.ts` is a desktop smoke test over WebDriver (`node smoke/webdriver.ts <application> [tauri-driver arguments...]`, with `tauri-driver`); it is not wired to a script or to CI.

## Cargo commands

The Cargo workspace ([`Cargo.toml`](../../../Cargo.toml)) has three members: both plugins and `apps/showcase/src-tauri`. The toolchain is pinned in `rust-toolchain.toml` (1.99.0, with `rustfmt` and `clippy`); the crates declare `rust-version = "1.90"`.

| Command                                                 | What it does               |
| ------------------------------------------------------- | -------------------------- |
| `cargo fmt --all -- --check`                            | Checks the formatting (CI) |
| `cargo fmt --all`                                       | Formats the crates         |
| `cargo clippy --workspace --all-targets -- -D warnings` | Lints, warnings as errors  |
| `cargo test --workspace`                                | Runs the Rust tests        |

CI adds `--locked` to `clippy` and `test`. The showcase crate embeds the static frontend build, so run `pnpm build` before building it. The workspace lints forbid `unsafe` code (only `tauri-plugin-oito2-window`'s `menu` module allows it) and deny `unwrap`, `panic!` and `todo!`.

## Tools

| Path                              | Run with                                                                                                                | Purpose                                                                                                                                                                         |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tools/generate-css/generate.ts`  | `pnpm generate` / `pnpm generate:check`                                                                                 | Generates `packages/ui/src/lib/styles/tokens.css`, `.../schemes.css` and `packages/ui-themes/src/lib/presets.css`                                                               |
| `tools/generate-docs/generate.ts` | `pnpm docs:generate` / `pnpm docs:check`                                                                                | The CLI of the API reference generator; the reading lives in `tools/generate-docs/api.ts`, tested by `api.test.ts` against `fixtures/` (`pnpm test:tools`)                      |
| `tools/release/sync-versions.ts`  | `pnpm release:version` / `pnpm release:check vX.Y.Z` (the release workflow runs the `--check` form with the pushed tag) | Copies the npm version to the Cargo workspace, `Cargo.lock`, the showcase `package.json` and `tauri.conf.json`, or checks them all (the `Cargo.lock` entries too) against a tag |
| `tools/parity/`                   | `flutter test` in that folder                                                                                           | Exports the parity fixtures from an oito2_ui checkout at `.references/oito2_ui`                                                                                                 |
| `tools/templates/`                | —                                                                                                                       | The GPL-3.0 header of each comment syntax: `header.txt` (`//`), `header.css.txt`, `header.html.txt`, `header.sharp.txt` (`#`)                                                   |
| `tools/lint-headers/check.ts`     | `pnpm lint:headers` (part of `pnpm lint`)                                                                               | Checks that every hand-written source file starts with the matching header; `app.html` and generated files are skipped                                                          |

## CI workflows

### `ci.yml` — CI

Triggers: push to `main`, every pull request, manual run. Concurrent runs of the same pull request cancel each other.

| Job        | Runner                                            | Steps                                                                                                                                                                                                                                       |
| ---------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `frontend` | `ubuntu-latest`                                   | `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm generate:check`, `pnpm docs:check`, `pnpm test:tools`, `pnpm build`, `pnpm check`, Playwright Chromium and WebKit install, `pnpm test`; uploads the screenshot diffs when it fails     |
| `rust`     | `ubuntu-latest`, `windows-latest`, `macos-latest` | Linux build dependencies, `pnpm install`, `pnpm build`, `cargo fmt --all -- --check`, `cargo clippy --workspace --all-targets --locked -- -D warnings`, `cargo test --workspace --locked`                                                   |
| `msrv`     | `ubuntu-latest`                                   | `cargo +1.90 check --locked` of the two plugin crates with the minimum supported Rust version (`rust-version` of `Cargo.toml`)                                                                                                              |
| `smoke`    | `ubuntu-latest`                                   | Desktop smoke test: builds the showcase in debug through the Tauri CLI, installs `tauri-driver` 2.1.0 and WebKitWebDriver, and runs `apps/showcase/smoke/webdriver.ts` under `xvfb-run` (opens the Button page and checks the Tauri bridge) |

### `pages.yml` — Pages

Triggers: push to `main`, manual run. Builds everything with `BASE_PATH=/oito2_uikit` and deploys `apps/showcase/build` to GitHub Pages: <https://oito2.github.io/oito2_uikit/>.

| Job      | Steps                                                                         |
| -------- | ----------------------------------------------------------------------------- |
| `build`  | `pnpm install`, `pnpm build` with the base path, upload of the Pages artifact |
| `deploy` | Deploys to the `github-pages` environment                                     |

### `parity.yml` — Parity

Triggers: every Monday at 06:00 UTC, manual run. Checks out `oito2/oito2_ui` into `.references/oito2_ui`, installs Flutter, runs `flutter test` in `tools/parity` and fails when any file under `packages/*/src/fixtures/parity/` would change: oito2_ui moved ahead and the change has to be ported.

### `release.yml` — Release

Trigger: push of a tag matching `v*.*.*`.

| Job        | Needs             | Runner                                           | Steps                                                                                                                                                                      |
| ---------- | ----------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `verify`   | —                 | `ubuntu-latest`                                  | `node tools/release/sync-versions.ts --check "$GITHUB_REF_NAME"`                                                                                                           |
| `npm`      | `verify`          | `ubuntu-latest`, `release` environment           | Builds, then packs and publishes every non-private package whose version is not on npm yet, with provenance (OIDC, or `NPM_TOKEN` when set)                                |
| `binaries` | `verify`          | `ubuntu-22.04`, `windows-latest`, `macos-latest` | Builds the packages, then `pnpm tauri build -- --locked` with the bundles of each system (the Tauri `beforeBuildCommand` builds the showcase), then renames the installers |
| `release`  | `npm`, `binaries` | `ubuntu-latest`                                  | Writes `SHA256SUMS`, builds the notes from the version's section of every public package's `CHANGELOG.md`, and creates a **draft** GitHub Release with the files           |

The release files are `oito2-uikit-showcase-X.Y.Z-linux-amd64.deb`, `-linux-x86_64.rpm`, `-linux-amd64.AppImage`, `-windows-x64.msi`, `-windows-x64-setup.exe`, `-macos-universal.dmg` and `SHA256SUMS`. They are not code-signed. The Linux packages are built on Ubuntu 22.04, the oldest supported system.

## See also

- [CONTRIBUTING.md](../../../CONTRIBUTING.md) — development environment and the release process.
- [Parity and generators](../architecture/parity-and-generators.md) — what the tools generate and why.
