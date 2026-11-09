# Contributing to oito2_uikit

🌐 **Language:** English · [Português](docs/pt-br/contribuindo.md)

Thank you for helping! This guide covers the development environment, the checks every change must pass, and how releases are made. By taking part you agree to the [Code of Conduct](CODE_OF_CONDUCT.md). Security problems go through the [Security Policy](SECURITY.md), never through public issues.

## Table of Contents

- [Before you start](#before-you-start)
- [Development environment](#development-environment)
- [Repository layout](#repository-layout)
- [Everyday commands](#everyday-commands)
- [Conventions](#conventions)
- [Pull requests](#pull-requests)
- [Releases (maintainers)](#releases-maintainers)

## Before you start

- **oito2_ui is the design source of truth.** Visual changes (tokens, colors, sizes, strings) land first in [oito2_ui](https://github.com/oito2/oito2_ui) and are then ported here; the parity fixtures check that both agree.
- For anything bigger than a small fix, open an issue first so the approach can be agreed on.

## Development environment

| Tool                                    | Version                                                                                                                |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Node.js                                 | 24 LTS or later                                                                                                        |
| pnpm                                    | the one pinned in `package.json` (`corepack enable`, or `npm install -g pnpm@<version>` with the `packageManager` one) |
| Rust                                    | pinned in `rust-toolchain.toml`; rustup installs it                                                                    |
| Tauri v2 system dependencies            | see below                                                                                                              |
| Flutter (only to regenerate the parity) | stable, with an oito2_ui checkout in `.references/oito2_ui`                                                            |

Linux system packages (Debian/Ubuntu):

```bash
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev librsvg2-dev
# Playwright's WebKit, used by the browser tests
sudo apt install libavif16
```

Windows needs the Microsoft C++ Build Tools and the WebView2 runtime; macOS needs Xcode or its command line tools. The full list per system is in the [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/).

Set up the repository:

```bash
git clone https://github.com/oito2/oito2_uikit.git
cd oito2_uikit
corepack enable   # Node 25 and later ship without Corepack: npm install -g pnpm@<version in packageManager>
pnpm install
pnpm --filter @oito2/ui exec playwright install chromium webkit
pnpm build
```

Run the showcase:

```bash
pnpm showcase dev   # in the browser
pnpm tauri dev      # as the desktop app
```

The showcase uses the **built** packages: run `pnpm build` again after changing a library.

## Repository layout

| Path                     | Contents                                                                       |
| ------------------------ | ------------------------------------------------------------------------------ |
| `packages/ui`            | `@oito2/ui`: tokens, themes, interaction primitives, window chrome, components |
| `packages/ui-*`          | The optional packages (themes, syntax, extras, files, window, settings)        |
| `packages/ui-test-utils` | Test helpers shared by the packages (private, never published)                 |
| `plugins/`               | The Rust Tauri plugins `tauri-plugin-oito2-window` and `-settings`             |
| `apps/showcase`          | The SvelteKit catalogue, built as a Tauri app and for GitHub Pages             |
| `tools/`                 | CSS and API-reference generators, the parity exporter, release scripts         |

## Everyday commands

Run from the repository root:

| Command                                                 | What it does                                                           |
| ------------------------------------------------------- | ---------------------------------------------------------------------- |
| `pnpm lint`                                             | Prettier `--check`, ESLint and the license-header check                |
| `pnpm format`                                           | Prettier `--write` (always from the root)                              |
| `pnpm check`                                            | `svelte-check` in every package and the showcase                       |
| `pnpm build`                                            | `svelte-package` + `publint` for the packages, showcase static build   |
| `pnpm generate`                                         | Regenerates `tokens.css` and the scheme CSS after a token change       |
| `pnpm docs:generate`                                    | Regenerates the showcase API reference (`pnpm docs` is a pnpm command) |
| `pnpm changeset`                                        | Records a user-facing change                                           |
| `cargo fmt --all`                                       | Formats the Rust crates                                                |
| `cargo clippy --workspace --all-targets -- -D warnings` | Lints the Rust crates                                                  |
| `cargo test --workspace`                                | Runs the Rust tests                                                    |

### Tests

The browser suites are heavy. Run them **one file at a time**, sequentially, and leave the full `pnpm test` to CI:

```bash
cd packages/ui
pnpm exec vitest run src/lib/components/controls.svelte.test.ts \
  --project "browser (chromium)" --project "browser (webkit)" \
  --maxWorkers=1 --no-file-parallelism
pnpm exec vitest run --project node     # pure logic, fast
```

The showcase end-to-end tests run on the built showcase, one engine at a time:

```bash
pnpm build
cd apps/showcase
pnpm exec playwright test --project chromium
pnpm exec playwright test --project webkit
```

| File                            | Runs in           | For                                  |
| ------------------------------- | ----------------- | ------------------------------------ |
| `*.test.ts`                     | Node              | Pure logic                           |
| `*.svelte.test.ts`              | Chromium + WebKit | Components, axe and visual goldens   |
| `*.browser.test.ts`             | Chromium + WebKit | DOM/CSS behavior without a component |
| `apps/showcase/tests/*.spec.ts` | Chromium + WebKit | Every showcase page and the shell    |

A test that passes in only one engine is a bug. Regenerate visual goldens only on purpose (`vitest run --update`) and commit the new images.

### Parity with oito2_ui

With an oito2_ui checkout (or a symbolic link) at `.references/oito2_ui`, regenerate the fixtures with:

```bash
cd tools/parity
flutter test
```

The [Parity workflow](.github/workflows/parity.yml) runs the same export every Monday (and on demand, from the Actions tab) against the current oito2_ui and fails when any fixture would change. A failed run means oito2_ui moved ahead: regenerate the fixtures locally, port the change and commit the new JSON.

## Conventions

- **Svelte 5 runes** everywhere; reusable behaviors are attachments, state lives in `.svelte.ts` classes, no stores.
- **Accessibility**: behavior follows the WAI-ARIA Authoring Practices pattern of each widget; galleries run axe in the browser tests.
- **Styling**: plain CSS inside `@layer oito2`, values through `var(--oito2-…)` tokens, states through `data-*` attributes.
- **Rust**: `cargo fmt`, clippy with `-D warnings`, no `unwrap`/`expect`/`panic!` in command paths, `unsafe` only in `tauri-plugin-oito2-window/src/menu.rs`.
- **License header**: every hand-written source file starts with the GPL-3.0 notice from `tools/templates/` in its comment syntax (`header.txt` for `//`, `header.css.txt`, `header.html.txt`, `header.sharp.txt` for `#`); `pnpm lint:headers` (part of `pnpm lint`) enforces it. JSON, Markdown, `app.html`, the manifests and the workflows carry none.
- **Language**: code, comments, commit messages and documentation in English; `docs/pt-br/` mirrors `docs/en/` in Brazilian Portuguese.
- **TSDoc** in English on every public export and prop: it feeds the API reference.

The complete rules are in [`.instructions/TAURI.md`](.instructions/TAURI.md) and [`.instructions/TAURI-SVELTEKIT.md`](.instructions/TAURI-SVELTEKIT.md).

## Pull requests

1. Branch from `main`.
2. Add a changeset (`pnpm changeset`) for every user-facing change of a published package; pick `patch`, `minor` or `major`.
3. Add or update tests, the showcase page and the documentation (both languages) together with the change.
4. Run `pnpm lint`, `pnpm check`, `pnpm build`, the tests of the files you touched, and the Rust checks if you changed a crate.
5. Open the pull request and fill in its template. CI must be green.

## Releases (maintainers)

Every public npm package and both crates share one version.

1. On an up-to-date `main` with green CI, apply the pending changesets and propagate the version to the Cargo workspace, `Cargo.lock` and the showcase:

   ```bash
   pnpm release:version
   ```

2. Review the new `CHANGELOG.md` entries and the version changes, then commit and tag:

   ```bash
   git add -A
   git commit -m "Release vX.Y.Z"
   git tag -a vX.Y.Z -m "Release vX.Y.Z"
   git push origin main vX.Y.Z
   ```

3. The [Release workflow](.github/workflows/release.yml) checks every version against the tag, publishes the missing `@oito2/*` versions to npm with provenance, builds the showcase installers on Linux, Windows and macOS, and creates a **draft** GitHub Release with the installers, `SHA256SUMS` and the changelog.
4. Review the draft on GitHub and publish it.

npm publishing uses trusted publishing (OIDC) from the `release` environment, with no stored token. A **new** package must exist on npm before a trusted publisher can be added to it, so its first version is published with a short-lived granular token stored as the `NPM_TOKEN` secret of the `release` environment; delete the secret and revoke the token right after that release.

Right before the package's next release, configure its trusted publisher (npm 11.15 or later) and push the tag within two days: a configuration that no publish uses within two days expires.

```bash
npm trust github @oito2/<name> --file release.yml --repo oito2/oito2_uikit --env release --allow-publish
```
