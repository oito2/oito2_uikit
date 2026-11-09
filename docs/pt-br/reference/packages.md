🌐 [English](../../en/reference/packages.md) | **Português** | 🏠 [Índice](../index.md)

---

# Pacotes

Todos os pacotes e crates do repositório: o que contêm, os seus pontos de entrada, as suas dependências e o que precisam do Tauri. Todos os pacotes npm publicados e os dois crates compartilham uma única versão. As faixas de versão escritas `catalog:` nos manifestos são resolvidas pelo `catalog` de `pnpm-workspace.yaml` quando um pacote é empacotado; as versões abaixo são as entradas atuais do catálogo.

## Resumo

| Pacote                        | Tipo  | Publicado                    | Conteúdo                                                                  |
| ----------------------------- | ----- | ---------------------------- | ------------------------------------------------------------------------- |
| `@oito2/ui`                   | npm   | Sim                          | Tokens, temas, chrome da janela, primitivos de interação e os componentes |
| `@oito2/ui-themes`            | npm   | Sim                          | Os 13 presets de cor nomeados                                             |
| `@oito2/ui-syntax`            | npm   | Sim                          | Destaque de sintaxe (highlight.js) e `CodeBlock`                          |
| `@oito2/ui-extras`            | npm   | Sim                          | QR code, área de assinatura, recorte de imagem, menu de navegação         |
| `@oito2/ui-files`             | npm   | Sim                          | Envio de arquivos, área de soltar e download, para o Tauri e o navegador  |
| `@oito2/ui-window`            | npm   | Sim                          | Lado do webview de `tauri-plugin-oito2-window`                            |
| `@oito2/ui-settings`          | npm   | Sim                          | Lado do webview de `tauri-plugin-oito2-settings`                          |
| `tauri-plugin-oito2-window`   | crate | Tag do Git, não no crates.io | Moldura da janela (decorações) e menu nativo da janela                    |
| `tauri-plugin-oito2-settings` | crate | Tag do Git, não no crates.io | Ambiente de desktop, disposição dos botões, destaque e alto contraste     |
| `@oito2/ui-test-utils`        | npm   | Não (`private`)              | Auxiliares de teste compartilhados pelos pacotes                          |
| `@oito2/showcase`             | app   | Não (`private`)              | O showcase, como app Tauri e como build web estático                      |
| `oito2-uikit-showcase`        | crate | Não (`publish = false`)      | O crate Tauri do showcase                                                 |

O primeiro release será o `v0.1.0`; ele ainda não foi publicado.

## Comum a todos os pacotes npm

| Campo                   | Valor                                                                                                                                                                                                                                    |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Licença                 | `GPL-3.0-only`                                                                                                                                                                                                                           |
| Tipo de módulo          | Módulos ES (`"type": "module"`), gerados de `src/lib` para `dist` pelo `svelte-package`                                                                                                                                                  |
| Condições de exportação | `types`, `svelte` e `default` em todo ponto de entrada JavaScript                                                                                                                                                                        |
| `sideEffects`           | `["**/*.css"]` — só os imports de CSS têm efeitos colaterais                                                                                                                                                                             |
| Dependências peer       | `svelte` `^5.57.0`; nos pacotes satélites também `@oito2/ui` (mesma versão) e, nos pacotes Tauri, `@tauri-apps/*` — o app os instala, para que uma única cópia de cada seja compartilhada e os pacotes Tauri acompanhem os crates do app |

## `@oito2/ui`

O design system: tokens, temas de cor, os providers de tema e de idioma, chrome da janela, primitivos de interação, coleções, atalhos e cerca de 100 componentes. Não depende do Tauri e roda em qualquer navegador.

| Ponto de entrada        | Arquivo                   | Conteúdo                                                                                                    |
| ----------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `@oito2/ui`             | `dist/index.js`           | Todos os componentes e funções                                                                              |
| `@oito2/ui/icons`       | `dist/icons/index.js`     | Todos os ícones Lucide reexportados de `@lucide/svelte`, mais `freedesktopIcon` / `freedesktopIcons`        |
| `@oito2/ui/theme`       | `dist/theme/index.js`     | As funções de esquema de cor sem Svelte (sem a condição `svelte`), para scripts de build e pacotes de temas |
| `@oito2/ui/styles.css`  | `dist/styles/styles.css`  | `fonts.css` + `tokens.css` + `density.css` + `base.css` — o import único habitual                           |
| `@oito2/ui/fonts.css`   | `dist/styles/fonts.css`   | A fonte variável Inter (OFL-1.1), embutida                                                                  |
| `@oito2/ui/tokens.css`  | `dist/styles/tokens.css`  | Os tokens de design `--oito2-*`                                                                             |
| `@oito2/ui/density.css` | `dist/styles/density.css` | Tamanhos de controles para ponteiro e toque                                                                 |
| `@oito2/ui/base.css`    | `dist/styles/base.css`    | Dimensionamento border-box, tipografia do corpo, estilos de borda de foco e de sombra de rolagem            |
| `@oito2/ui/schemes.css` | `dist/styles/schemes.css` | Esquemas base pré-calculados sob seletores `[data-oito2-scheme]` (fora de `styles.css`)                     |

| Dependência de execução              | Versão | Usada para                    |
| ------------------------------------ | ------ | ----------------------------- |
| `@floating-ui/dom`                   | 1.8.0  | Posicionar sobreposições      |
| `@lucide/svelte`                     | 1.59.0 | Ícones                        |
| `@material/material-color-utilities` | 0.4.0  | Esquemas de cor do Material 3 |

Tauri: nenhum. Um app que renderiza `@oito2/ui` num servidor Node (SSR) precisa acrescentar `@material/material-color-utilities` a `ssr.noExternal`; apps só de cliente, como as SPAs do Tauri, não precisam de nada. Veja o [README de `@oito2/ui`](../../../packages/ui/README.md).

## `@oito2/ui-themes`

| Ponto de entrada               | Arquivo            | Conteúdo                                                                                                                       |
| ------------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `@oito2/ui-themes`             | `dist/index.js`    | `presetTheme`, `presetColorTheme`, `presetRoles`, `presetSchemeName`, `themePresets`, `themePresetNames`, as paletas de origem |
| `@oito2/ui-themes/presets.css` | `dist/presets.css` | Cada preset e a sua variante de alto contraste sob seletores `[data-oito2-scheme]`                                             |

Dependência peer: `@oito2/ui` (mesma versão). Dependência de execução: `@catppuccin/palette` 1.8.0. Tauri: nenhum. Veja o [README](../../../packages/ui-themes/README.md).

## `@oito2/ui-syntax`

| Ponto de entrada             | Arquivo                 | Conteúdo                                                                                        |
| ---------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------- |
| `@oito2/ui-syntax`           | `dist/index.js`         | `CodeBlock`, `Highlighter`, `defaultLanguages`, `HighlighterTheme`, `roleOfScope`, `scopeRoles` |
| `@oito2/ui-syntax/fonts.css` | `dist/styles/fonts.css` | A fonte variável JetBrains Mono (OFL-1.1), opcional                                             |

Dependência peer: `@oito2/ui`. Dependência de execução: `highlight.js` 11.12.0. Tauri: nenhum. Veja o [README](../../../packages/ui-syntax/README.md).

## `@oito2/ui-extras`

| Ponto de entrada   | Arquivo         | Conteúdo                                                                                                                    |
| ------------------ | --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `@oito2/ui-extras` | `dist/index.js` | `QrCode`, `SignaturePad`, `SignatureController`, `ImageCropper`, `CropPreview`, `CropController`, `NavigationMenu`, funções |

Dependência peer: `@oito2/ui`. Dependências de execução: `@lucide/svelte` 1.59.0, `qrcode-generator` 2.0.4. Tauri: nenhum. Veja o [README](../../../packages/ui-extras/README.md).

## `@oito2/ui-files`

| Ponto de entrada  | Arquivo         | Conteúdo                                                                                                                  |
| ----------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `@oito2/ui-files` | `dist/index.js` | `FileUpload`, `FileUploadController`, `FileDropZone`, `DownloadTrigger`, `Downloads`, os adaptadores e funções de arquivo |

Dependências peer: `@oito2/ui`, `@tauri-apps/api` `^2.12.0`, `@tauri-apps/plugin-dialog` `^2.8.0`, `@tauri-apps/plugin-fs` `^2.7.0` (instaladas pelo app, também num build só para web; os módulos do Tauri só são carregados dentro do Tauri). Dependência de execução: `@lucide/svelte` 1.59.0.

Tauri: os crates oficiais `tauri-plugin-dialog` e `tauri-plugin-fs`, registrados no Builder, e as permissões `dialog:allow-open`, `dialog:allow-save`, `fs:allow-stat`, `fs:allow-read-file`, `fs:allow-write-file`. Veja [Arquivos](../guides/files.md) e o [README](../../../packages/ui-files/README.md).

## `@oito2/ui-window`

| Ponto de entrada   | Arquivo         | Conteúdo                                                                                                                                                 |
| ------------------ | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@oito2/ui-window` | `dist/index.js` | `initWindow`, `NativeWindowController`, `WindowResizeHandles`, `setDecorationMode`, `decorationMode`, `showWindowMenu`, `CommandError`, `isCommandError` |

Dependências peer: `@oito2/ui`, `@tauri-apps/api` `^2.12.0`. Sem dependências de execução.

Tauri: o crate `tauri-plugin-oito2-window` com `oito2-window:default`, mais `core:window:allow-minimize`, `-toggle-maximize`, `-close`, `-start-dragging` e `-start-resize-dragging` para a barra de título. Fora do Tauri, `initWindow()` devolve `null`. Veja [Integração com o desktop](../guides/desktop-integration.md) e o [README](../../../packages/ui-window/README.md).

## `@oito2/ui-settings`

| Ponto de entrada     | Arquivo         | Conteúdo                                                                                                                                                                                                   |
| -------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@oito2/ui-settings` | `dist/index.js` | `SystemSettingsScope`, `loadSystemSettings`, `composeSystemSettings`, `sameSystemSettings`, `tauriSettingsSource`, `settingsChangedEvent`, `isRawSettings`, `CommandError`, `isCommandError`, tipos brutos |

Dependências peer: `@oito2/ui`, `@tauri-apps/api` `^2.12.0`. Sem dependências de execução.

Tauri: o crate `tauri-plugin-oito2-settings` com `oito2-settings:default`; `core:default` cobre o evento de mudança. Fora do Tauri, o escopo mantém os padrões da plataforma. Veja o [README](../../../packages/ui-settings/README.md).

## `tauri-plugin-oito2-window` e `tauri-plugin-oito2-settings`

| Campo                  | Valor                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------- |
| Origem                 | `git = "https://github.com/oito2/oito2_uikit", tag = "vX.Y.Z"` (fora do crates.io)      |
| Edição / MSRV          | Rust 2024, `rust-version = "1.90"`                                                      |
| `tauri`                | 2.12                                                                                    |
| Nome do plugin         | `oito2-window` / `oito2-settings` (prefixo das permissões e `plugin:<name>\|<command>`) |
| Dependência no Linux   | `gtk` 0.18 (ambos)                                                                      |
| Dependência no Windows | `windows` 0.62 (ambos)                                                                  |
| Dependência no macOS   | `objc2-app-kit` 0.3 (só o de configurações)                                             |

Os seus comandos, permissões e eventos estão em [Plugins Tauri](./tauri-plugins.md).

## Pacotes privados

| Pacote                 | Caminho                   | Observações                                                                                                                                                                                                    |
| ---------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@oito2/ui-test-utils` | `packages/ui-test-utils`  | `"private": true`, ignorado pelo Changesets; exporta os auxiliares dos testes de navegador que os pacotes compartilham (`el`, `wait`, `settleAnimations`, `settleFonts`, `frames`, `pointer`, `stubClipboard`) |
| `@oito2/showcase`      | `apps/showcase`           | `"private": true`, ignorado pelo Changesets; o release distribui os seus instaladores, não o pacote                                                                                                            |
| `oito2-uikit-showcase` | `apps/showcase/src-tauri` | `publish = false`; binário `oito2-uikit-showcase`, identificador `io.github.oito2.uikit-showcase`                                                                                                              |

## Veja também

- [Componentes](./components.md) — de qual pacote vem cada componente.
- [Scripts do repositório](./repository-scripts.md) — os comandos de build, verificação e release.
- [Instalação](../getting-started/installation.md)
