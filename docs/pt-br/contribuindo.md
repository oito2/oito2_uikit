# Como contribuir com o oito2_uikit

🌐 **Idioma:** [English](../../CONTRIBUTING.md) · Português

Obrigado por ajudar! Este guia cobre o ambiente de desenvolvimento, as verificações que toda mudança precisa passar e como as versões são lançadas. Ao participar, você concorda com o [Código de Conduta](codigo-de-conduta.md). Problemas de segurança seguem a [Política de Segurança](seguranca.md), nunca issues públicas.

## Índice

- [Antes de começar](#antes-de-começar)
- [Ambiente de desenvolvimento](#ambiente-de-desenvolvimento)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Comandos do dia a dia](#comandos-do-dia-a-dia)
- [Convenções](#convenções)
- [Pull requests](#pull-requests)
- [Lançamentos (mantenedores)](#lançamentos-mantenedores)

## Antes de começar

- **O oito2_ui é a fonte de verdade do design.** Mudanças visuais (tokens, cores, tamanhos, textos) entram primeiro no [oito2_ui](https://github.com/oito2/oito2_ui) e depois são portadas para cá; as fixtures de paridade conferem que os dois concordam.
- Para qualquer coisa maior que uma correção pequena, abra uma issue antes, para combinar a abordagem.

## Ambiente de desenvolvimento

| Ferramenta                                            | Versão                                                                                                      |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Node.js                                               | 24 LTS ou mais recente                                                                                      |
| pnpm                                                  | a fixada no `package.json` (`corepack enable`, ou `npm install -g pnpm@<versão>` com a do `packageManager`) |
| Rust                                                  | fixada no `rust-toolchain.toml`; o rustup instala                                                           |
| Dependências de sistema do Tauri v2                   | veja abaixo                                                                                                 |
| Checkout do oito2_ui (só para sincronizar a paridade) | um clone de `oito2/oito2_ui`, ou um link simbólico para um, em `.references/oito2_ui`                       |

Pacotes de sistema no Linux (Debian/Ubuntu):

```bash
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev librsvg2-dev
# WebKit do Playwright, usado pelos testes de navegador
sudo apt install libavif16
```

O Windows precisa do Microsoft C++ Build Tools e do runtime WebView2; o macOS precisa do Xcode ou das suas ferramentas de linha de comando. A lista completa por sistema está nos [pré-requisitos do Tauri](https://v2.tauri.app/start/prerequisites/).

Prepare o repositório:

```bash
git clone https://github.com/oito2/oito2_uikit.git
cd oito2_uikit
corepack enable   # Node 25 e posteriores vêm sem Corepack: npm install -g pnpm@<versão do packageManager>
pnpm install
pnpm --filter @oito2/ui exec playwright install chromium webkit
pnpm build
```

Rode o showcase:

```bash
pnpm showcase dev   # no navegador
pnpm tauri dev      # como app desktop
```

O showcase usa os pacotes **compilados**: rode `pnpm build` de novo depois de mudar uma biblioteca.

## Estrutura do repositório

| Caminho                  | Conteúdo                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------- |
| `packages/ui`            | `@oito2/ui`: tokens, temas, primitivos de interação, chrome da janela, componentes     |
| `packages/ui-*`          | Os pacotes opcionais (themes, syntax, extras, files, window, settings)                 |
| `packages/ui-test-utils` | Utilitários de teste compartilhados pelos pacotes (privado, nunca publicado)           |
| `plugins/`               | Os plugins Tauri em Rust `tauri-plugin-oito2-window` e `-settings`                     |
| `apps/showcase`          | O catálogo SvelteKit, compilado como app Tauri e para o GitHub Pages                   |
| `tools/`                 | Geradores de CSS e da referência de API, sincronização da paridade, scripts de release |

## Comandos do dia a dia

Rode a partir da raiz do repositório:

| Comando                                                 | O que faz                                                                |
| ------------------------------------------------------- | ------------------------------------------------------------------------ |
| `pnpm lint`                                             | Prettier `--check`, ESLint e a verificação dos cabeçalhos de licença     |
| `pnpm format`                                           | Prettier `--write` (sempre a partir da raiz)                             |
| `pnpm check`                                            | `svelte-check` em todos os pacotes e no showcase                         |
| `pnpm build`                                            | `svelte-package` + `publint` nos pacotes, build estático do showcase     |
| `pnpm generate`                                         | Regenera o `tokens.css` e o CSS dos esquemas depois de mudar um token    |
| `pnpm docs:generate`                                    | Regenera a referência de API do showcase (`pnpm docs` é comando do pnpm) |
| `pnpm changeset`                                        | Registra uma mudança visível para quem usa                               |
| `cargo fmt --all`                                       | Formata os crates Rust                                                   |
| `cargo clippy --workspace --all-targets -- -D warnings` | Analisa os crates Rust                                                   |
| `cargo test --workspace`                                | Roda os testes Rust                                                      |

### Testes

As suítes de navegador são pesadas. Rode **um arquivo por vez**, em sequência, e deixe o `pnpm test` completo para a CI:

```bash
cd packages/ui
pnpm exec vitest run src/lib/components/controls.svelte.test.ts \
  --project "browser (chromium)" --project "browser (webkit)" \
  --maxWorkers=1 --no-file-parallelism
pnpm exec vitest run --project node     # lógica pura, rápido
```

Os testes ponta a ponta do showcase rodam sobre o showcase compilado, um motor por vez:

```bash
pnpm build
cd apps/showcase
pnpm exec playwright test --project chromium
pnpm exec playwright test --project webkit
```

| Arquivo                         | Roda em           | Para                                    |
| ------------------------------- | ----------------- | --------------------------------------- |
| `*.test.ts`                     | Node              | Lógica pura                             |
| `*.svelte.test.ts`              | Chromium + WebKit | Componentes, axe e goldens visuais      |
| `*.browser.test.ts`             | Chromium + WebKit | Comportamento de DOM/CSS sem componente |
| `apps/showcase/tests/*.spec.ts` | Chromium + WebKit | Todas as páginas do showcase e o shell  |

Um teste que passa em só um motor é um bug. Regenere goldens visuais só de propósito (`vitest run --update`) e faça commit das novas imagens.

### Paridade com o oito2_ui

O próprio oito2_ui exporta as fixtures de paridade (pelo pacote `tools/parity` dele, rodado com o Flutter lá). Com um checkout do oito2_ui (ou um link simbólico) em `.references/oito2_ui`, copie-as para os pacotes com:

```bash
pnpm parity:sync    # copia as fixtures e registra o commit em tools/parity/source.json
pnpm parity:check   # só compara
```

O [workflow Parity](../../.github/workflows/parity.yml) roda `pnpm parity:check` toda segunda-feira (e sob demanda, pela aba Actions) contra o oito2_ui atual e falha quando alguma fixture difere. Uma execução com falha significa que o oito2_ui avançou: sincronize as fixtures localmente, porte a mudança e faça commit do novo JSON junto com o `tools/parity/source.json`.

## Convenções

- **Runes do Svelte 5** em todo lugar; comportamentos reutilizáveis são attachments, o estado mora em classes `.svelte.ts`, sem stores.
- **Acessibilidade**: o comportamento segue o padrão do WAI-ARIA Authoring Practices de cada widget; as galerias rodam o axe nos testes de navegador.
- **Estilo**: CSS puro dentro de `@layer oito2`, valores pelos tokens `var(--oito2-…)`, estados por atributos `data-*`.
- **Rust**: `cargo fmt`, clippy com `-D warnings`, sem `unwrap`/`expect`/`panic!` nos caminhos de comando, `unsafe` só em `tauri-plugin-oito2-window/src/menu.rs`.
- **Cabeçalho de licença**: todo arquivo-fonte escrito à mão começa com o aviso GPL-3.0 de `tools/templates/` na sintaxe de comentário da linguagem (`header.txt` para `//`, `header.css.txt`, `header.html.txt`, `header.sharp.txt` para `#`); `pnpm lint:headers` (parte do `pnpm lint`) impõe isso. Arquivos JSON, Markdown, o `app.html`, os manifestos e os workflows não levam.
- **Idioma**: código, comentários, mensagens de commit e documentação em inglês; `docs/pt-br/` espelha `docs/en/` em português do Brasil.
- **TSDoc** em inglês em todo export público e prop: ele alimenta a referência de API.

As regras completas estão em [`.instructions/TAURI.md`](../../.instructions/TAURI.md) e [`.instructions/TAURI-SVELTEKIT.md`](../../.instructions/TAURI-SVELTEKIT.md).

## Pull requests

1. Crie um branch a partir do `main`.
2. Adicione um changeset (`pnpm changeset`) para toda mudança visível de um pacote publicado; escolha `patch`, `minor` ou `major`.
3. Adicione ou atualize testes, a página do showcase e a documentação (nos dois idiomas) junto com a mudança.
4. Rode `pnpm lint`, `pnpm check`, `pnpm build`, os testes dos arquivos que você mexeu e as verificações Rust se mudou um crate.
5. Abra o pull request e preencha o modelo. A CI precisa ficar verde.

## Lançamentos (mantenedores)

Todos os pacotes npm públicos e os dois crates compartilham uma única versão.

1. Num `main` atualizado e com a CI verde, aplique os changesets pendentes e propague a versão para o workspace Cargo, o `Cargo.lock` e o showcase:

   ```bash
   pnpm release:version
   ```

2. Revise as novas entradas dos `CHANGELOG.md` e as mudanças de versão, depois faça o commit e a tag:

   ```bash
   git add -A
   git commit -m "Release vX.Y.Z"
   git tag -a vX.Y.Z -m "Release vX.Y.Z"
   git push origin main vX.Y.Z
   ```

3. O [workflow de release](../../.github/workflows/release.yml) confere todas as versões contra a tag, publica no npm com provenance as versões `@oito2/*` que faltam, compila os instaladores do showcase no Linux, Windows e macOS e cria um GitHub Release em **rascunho** com os instaladores, o `SHA256SUMS` e o changelog.
4. Revise o rascunho no GitHub e publique.

A publicação no npm usa trusted publishing (OIDC) a partir do environment `release`, sem token guardado. Um pacote **novo** precisa existir no npm antes de receber um trusted publisher, então a primeira versão dele é publicada com um token granular de curta duração guardado no secret `NPM_TOKEN` do environment `release`; apague o secret e revogue o token logo depois desse lançamento.

Logo antes do próximo lançamento do pacote, configure o trusted publisher (npm 11.15 ou mais recente) e envie a tag em até dois dias: uma configuração que nenhuma publicação usa em dois dias expira.

```bash
npm trust github @oito2/<name> --file release.yml --repo oito2/oito2_uikit --env release --allow-publish
```
