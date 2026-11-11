🌐 [English](../../en/reference/repository-scripts.md) | **Português** | 🏠 [Índice](../index.md)

---

# Scripts do repositório

Todos os scripts do workspace, os comandos Cargo, as ferramentas de `tools/` e os workflows do GitHub Actions. Rode os scripts pnpm a partir da raiz do repositório, salvo indicação contrária. Como usá-los no dia a dia está em [contribuindo.md](../contribuindo.md).

## Índice

- [Scripts da raiz](#scripts-da-raiz)
- [Scripts dos pacotes](#scripts-dos-pacotes)
- [Scripts do showcase](#scripts-do-showcase)
- [Comandos Cargo](#comandos-cargo)
- [Ferramentas](#ferramentas)
- [Workflows de CI](#workflows-de-ci)

## Scripts da raiz

Do [`package.json`](../../../package.json) da raiz (o pnpm 12.16.1 está fixado em `packageManager`; é necessário Node.js 24 ou mais recente):

| Script            | Comando                                                                                          | O que faz                                                                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `build`           | `pnpm -r build`                                                                                  | Gera todos os pacotes (`svelte-package` + `publint`) e o build estático do showcase                                                                                                           |
| `check`           | `pnpm -r --parallel check`                                                                       | `svelte-check` em cada pacote e no showcase                                                                                                                                                   |
| `test`            | `pnpm -r test`                                                                                   | Vitest (projetos node e de navegador) em cada pacote e, depois, os testes Playwright do showcase                                                                                              |
| `lint`            | `prettier --check . && eslint . && node tools/lint-headers/check.ts`                             | Verificações de formatação, lint e cabeçalhos de licença                                                                                                                                      |
| `lint:headers`    | `node tools/lint-headers/check.ts`                                                               | Falha listando os arquivos-fonte escritos à mão que não começam com o aviso de licença                                                                                                        |
| `format`          | `prettier --write .`                                                                             | Formata todos os arquivos (rode-o da raiz)                                                                                                                                                    |
| `generate`        | `node tools/generate-css/generate.ts`                                                            | Grava `tokens.css`, `schemes.css` e `presets.css` a partir das fontes TypeScript                                                                                                              |
| `generate:check`  | `node tools/generate-css/generate.ts --check`                                                    | Falha quando um arquivo CSS gerado está desatualizado                                                                                                                                         |
| `docs:generate`   | `node tools/generate-docs/generate.ts`                                                           | Grava a referência de API do showcase, `apps/showcase/src/lib/api/api.json`                                                                                                                   |
| `docs:check`      | `node tools/generate-docs/generate.ts --check`                                                   | Falha quando `api.json` está desatualizado, ou quando um export não pode ser rastreado até a sua declaração                                                                                   |
| `test:tools`      | `node --test "tools/**/*.test.ts"`                                                               | Testes unitários das ferramentas (`tools/generate-docs/api.test.ts` contra `tools/generate-docs/fixtures/`, `tools/parity/sync.test.ts`)                                                      |
| `parity:sync`     | `node tools/parity/sync.ts`                                                                      | Copia as fixtures de paridade do checkout do oito2_ui em `.references/oito2_ui` para os pacotes e grava o `tools/parity/source.json` (`--from <dir>` lê outro checkout)                       |
| `parity:check`    | `node tools/parity/sync.ts --check`                                                              | Falha quando uma fixture de paridade difere da que o oito2_ui exporta                                                                                                                         |
| `showcase`        | `pnpm --filter @oito2/showcase`                                                                  | Roda um script do showcase: `pnpm showcase dev`, `pnpm showcase build`, ...                                                                                                                   |
| `tauri`           | `pnpm --filter @oito2/showcase tauri`                                                            | Roda a CLI do Tauri no showcase: `pnpm tauri dev`, `pnpm tauri build`, ...                                                                                                                    |
| `changeset`       | `changeset`                                                                                      | Registra uma mudança visível ao usuário para o próximo release                                                                                                                                |
| `release:version` | `changeset version && node tools/release/sync-versions.ts && prettier --write "**/CHANGELOG.md"` | Aplica os changesets, copia a nova versão para o workspace Cargo, o `Cargo.lock`, o `package.json` do showcase e o `tauri.conf.json`, e formata os changelogs                                 |
| `release:check`   | `node tools/release/sync-versions.ts --check`                                                    | Verifica se todas as versões, inclusive as dos três crates do workspace no `Cargo.lock`, são iguais a uma tag passada como argumento: `pnpm release:check vX.Y.Z` (sem uma, termina com erro) |

`pnpm docs` é um comando embutido do pnpm; por isso os scripts da referência de API se chamam `docs:generate` e `docs:check`.

## Scripts dos pacotes

Todo pacote em `packages/` tem os mesmos três scripts:

| Script  | Comando                                                      | Observações                                                                                                                 |
| ------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `build` | `svelte-package && publint`                                  | `@oito2/ui-test-utils` roda só o `svelte-package`                                                                           |
| `check` | `svelte-check --tsconfig ./tsconfig.json --fail-on-warnings` | `@oito2/ui-themes` o roda sem `--fail-on-warnings`; `@oito2/ui-test-utils` (só TypeScript) roda `tsc --noEmit` no lugar     |
| `test`  | `vitest run`                                                 | O projeto `node` (`*.test.ts`) e os projetos de navegador no Chromium e no WebKit (`*.svelte.test.ts`, `*.browser.test.ts`) |

Durante o desenvolvimento, rode um arquivo de teste de navegador por vez, como descreve o guia de contribuição:

```bash
cd packages/ui
pnpm exec vitest run src/lib/components/controls.svelte.test.ts \
  --project "browser (chromium)" --project "browser (webkit)" \
  --maxWorkers=1 --no-file-parallelism
pnpm exec vitest run --project node
```

Os projetos de navegador precisam dos navegadores do Playwright: `pnpm --filter @oito2/ui exec playwright install chromium webkit` (no Linux, o WebKit do Playwright também precisa de `libavif16`).

## Scripts do showcase

Do [`apps/showcase/package.json`](../../../apps/showcase/package.json):

| Script    | Comando                                                                         | O que faz                                                                                      |
| --------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `dev`     | `vite dev`                                                                      | Servidor de desenvolvimento na porta 5173 (fixa, como o Tauri espera)                          |
| `build`   | `vite build` e uma cópia de `build/index.html` para `build/404.html`            | Build estático em `build/`; `BASE_PATH=/oito2_uikit` o gera para o GitHub Pages                |
| `preview` | `vite preview`                                                                  | Serve o build                                                                                  |
| `prepare` | `svelte-kit sync \|\| echo ''`                                                  | Gera os tipos do SvelteKit após a instalação                                                   |
| `check`   | `svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --fail-on-warnings` | Verificação de tipos                                                                           |
| `test`    | `playwright test`                                                               | Testes de ponta a ponta do showcase **gerado**, no Chromium e no WebKit, servido na porta 4173 |
| `tauri`   | `tauri`                                                                         | A CLI do Tauri                                                                                 |

O showcase consome os pacotes gerados: rode `pnpm build` na raiz depois de alterar uma biblioteca. O `tauri.conf.json` roda `pnpm dev` antes de `tauri dev` e `pnpm build` antes de `tauri build`:

| Comando                                                              | Resultado                                                                                                           |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `pnpm tauri dev`                                                     | O showcase como app de desktop, com o servidor de desenvolvimento do Vite                                           |
| `pnpm tauri build`                                                   | Build de release e todos os pacotes de `bundle.targets` (`"all"`)                                                   |
| `pnpm tauri build --bundles deb,rpm,appimage`                        | Os pacotes Linux, como o workflow de release os gera                                                                |
| `pnpm tauri build --bundles msi,nsis`                                | Os instaladores do Windows                                                                                          |
| `pnpm tauri build --target universal-apple-darwin --bundles app,dmg` | O app universal e a imagem de disco do macOS (exige os targets Rust `aarch64-apple-darwin` e `x86_64-apple-darwin`) |

Os pacotes são gravados em `target/release/bundle/` na raiz do repositório (o target do workspace Cargo), ou em `target/universal-apple-darwin/release/bundle/` no build do macOS.

`apps/showcase/smoke/webdriver.ts` é um teste de fumaça do desktop via WebDriver (`node smoke/webdriver.ts <application> [tauri-driver arguments...]`, com o `tauri-driver`); ele não está ligado a nenhum script nem à CI.

## Comandos Cargo

O workspace Cargo ([`Cargo.toml`](../../../Cargo.toml)) tem três membros: os dois plugins e `apps/showcase/src-tauri`. O toolchain está fixado em `rust-toolchain.toml` (1.99.0, com `rustfmt` e `clippy`); os crates declaram `rust-version = "1.90"`.

| Comando                                                 | O que faz                  |
| ------------------------------------------------------- | -------------------------- |
| `cargo fmt --all -- --check`                            | Verifica a formatação (CI) |
| `cargo fmt --all`                                       | Formata os crates          |
| `cargo clippy --workspace --all-targets -- -D warnings` | Lint, avisos como erros    |
| `cargo test --workspace`                                | Roda os testes Rust        |

A CI acrescenta `--locked` ao `clippy` e ao `test`. O crate do showcase embute o build estático do frontend, então rode `pnpm build` antes de compilá-lo. Os lints do workspace proíbem código `unsafe` (só o módulo `menu` de `tauri-plugin-oito2-window` o permite) e negam `unwrap`, `panic!` e `todo!`.

## Ferramentas

| Caminho                           | Como rodar                                                                                                            | Finalidade                                                                                                                                                                       |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tools/generate-css/generate.ts`  | `pnpm generate` / `pnpm generate:check`                                                                               | Gera `packages/ui/src/lib/styles/tokens.css`, `.../schemes.css` e `packages/ui-themes/src/lib/presets.css`                                                                       |
| `tools/generate-docs/generate.ts` | `pnpm docs:generate` / `pnpm docs:check`                                                                              | A CLI do gerador da referência de API; a leitura fica em `tools/generate-docs/api.ts`, testada por `api.test.ts` contra `fixtures/` (`pnpm test:tools`)                          |
| `tools/release/sync-versions.ts`  | `pnpm release:version` / `pnpm release:check vX.Y.Z` (o workflow de release roda a forma `--check` com a tag enviada) | Copia a versão npm para o workspace Cargo, o `Cargo.lock`, o `package.json` do showcase e o `tauri.conf.json`, ou confere todos (as entradas do `Cargo.lock` também) com uma tag |
| `tools/parity/sync.ts`            | `pnpm parity:sync` / `pnpm parity:check`                                                                              | Copia byte a byte as fixtures de paridade exportadas pelo oito2_ui; o `tools/parity/source.json` registra o commit do oito2_ui e o `manifest.json` dele                          |
| `tools/templates/`                | —                                                                                                                     | O cabeçalho GPL-3.0 de cada sintaxe de comentário: `header.txt` (`//`), `header.css.txt`, `header.html.txt`, `header.sharp.txt` (`#`)                                            |
| `tools/lint-headers/check.ts`     | `pnpm lint:headers` (parte do `pnpm lint`)                                                                            | Confere que todo arquivo-fonte escrito à mão começa com o cabeçalho correspondente; `app.html` e os arquivos gerados são pulados                                                 |

## Workflows de CI

### `ci.yml` — CI

Gatilhos: push na `main`, todo pull request, execução manual. Execuções simultâneas do mesmo pull request cancelam umas às outras.

| Job        | Runner                                            | Etapas                                                                                                                                                                                                                                           |
| ---------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `frontend` | `ubuntu-latest`                                   | `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm generate:check`, `pnpm docs:check`, `pnpm test:tools`, `pnpm build`, `pnpm check`, instalação do Chromium e do WebKit do Playwright, `pnpm test`; envia os diffs de screenshot quando falha |
| `rust`     | `ubuntu-latest`, `windows-latest`, `macos-latest` | Dependências de build do Linux, `pnpm install`, `pnpm build`, `cargo fmt --all -- --check`, `cargo clippy --workspace --all-targets --locked -- -D warnings`, `cargo test --workspace --locked`                                                  |
| `msrv`     | `ubuntu-latest`                                   | `cargo +1.90 check --locked` dos dois crates de plugin com a versão mínima suportada do Rust (`rust-version` do `Cargo.toml`)                                                                                                                    |
| `smoke`    | `ubuntu-latest`                                   | Smoke test desktop: gera o showcase em debug pela CLI do Tauri, instala o `tauri-driver` 2.1.0 e o WebKitWebDriver e roda `apps/showcase/smoke/webdriver.ts` sob `xvfb-run` (abre a página Button e confere a ponte do Tauri)                    |

### `pages.yml` — Pages

Gatilhos: push na `main`, execução manual. Gera tudo com `BASE_PATH=/oito2_uikit` e publica `apps/showcase/build` no GitHub Pages: <https://oito2.github.io/oito2_uikit/>.

| Job      | Etapas                                                                      |
| -------- | --------------------------------------------------------------------------- |
| `build`  | `pnpm install`, `pnpm build` com o caminho base, envio do artefato do Pages |
| `deploy` | Publica no ambiente `github-pages`                                          |

### `parity.yml` — Parity

Gatilhos: toda segunda-feira às 06:00 UTC, execução manual. Faz checkout do `oito2/oito2_ui` em `.references/oito2_ui`, configura o Node e roda `node tools/parity/sync.ts --from .references/oito2_ui --check`, que falha quando algum arquivo em `packages/*/src/fixtures/parity/` difere das fixtures que o oito2_ui exporta: o oito2_ui avançou e a mudança precisa ser portada.

### `release.yml` — Release

Gatilho: push de uma tag no formato `v*.*.*`.

| Job        | Depende de        | Runner                                           | Etapas                                                                                                                                                                   |
| ---------- | ----------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `verify`   | —                 | `ubuntu-latest`                                  | `node tools/release/sync-versions.ts --check "$GITHUB_REF_NAME"`                                                                                                         |
| `npm`      | `verify`          | `ubuntu-latest`, ambiente `release`              | Gera, depois empacota e publica cada pacote não privado cuja versão ainda não está no npm, com proveniência (OIDC, ou `NPM_TOKEN` quando definido)                       |
| `binaries` | `verify`          | `ubuntu-22.04`, `windows-latest`, `macos-latest` | Gera os pacotes, depois `pnpm tauri build -- --locked` com os bundles de cada sistema (o `beforeBuildCommand` do Tauri gera o showcase), depois renomeia os instaladores |
| `release`  | `npm`, `binaries` | `ubuntu-latest`                                  | Grava `SHA256SUMS`, monta as notas a partir da seção da versão do `CHANGELOG.md` de cada pacote público e cria um **rascunho** de GitHub Release com os arquivos         |

Os arquivos do release são `oito2-uikit-showcase-X.Y.Z-linux-amd64.deb`, `-linux-x86_64.rpm`, `-linux-amd64.AppImage`, `-windows-x64.msi`, `-windows-x64-setup.exe`, `-macos-universal.dmg` e `SHA256SUMS`. Eles não têm assinatura de código. Os pacotes Linux são gerados no Ubuntu 22.04, o sistema suportado mais antigo.

## Veja também

- [contribuindo.md](../contribuindo.md) — ambiente de desenvolvimento e processo de release.
- [Paridade e geradores](../architecture/parity-and-generators.md) — o que as ferramentas geram e por quê.
