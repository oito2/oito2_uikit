🌐 [English](../../en/concepts/architecture.md) | **Português** | 🏠 [Índice](../index.md)

---

# Arquitetura

Uma visão geral do oito2_uikit: como os dados circulam, onde cada parte fica, quais dependências ele usa e as decisões de design por trás dele. As páginas detalhadas, por subsistema, para quem contribui, estão em [`architecture/`](../architecture/tokens-and-themes.md).

## Fluxo de dados

### Configurações do sistema, do sistema operacional aos componentes

```text
Operating system
  (session variables, GSettings, XDG portal, KDE/Xfce/COSMIC files,
   Windows Runtime, AppKit)
        │  read by
        ▼
tauri-plugin-oito2-settings (Rust)
  read_settings command  ──►  RawSettings (camelCase JSON)
  oito2-settings://changed event (Linux, debounced 150 ms)
        │  invoke / listen
        ▼
@oito2/ui-settings (TypeScript)
  composeSystemSettings(raw, platform)  ──►  SystemSettings
  SystemSettingsScope: reads on mount, on every change event, on window focus
        │  context
        ▼
@oito2/ui  SystemScope  ──►  useSystemSettings()
        │
        ├──► ThemeProvider: accent and high contrast of the color scheme
        └──► WindowTitleBar / HeaderBar / DialogTitleBar: control style and button layout
```

O plugin devolve só valores brutos. Todas as regras — qual é o ambiente de desktop, qual fonte de layout de botões vale, qual acento vence — ficam em `composeSystemSettings`, uma função pura testada sem o Tauri. Fora do Tauri não há fonte, e o escopo mantém `fallbackSystemSettings(platform)`. Detalhes em [Configurações do sistema](../architecture/system-settings.md).

### Ações da janela, da barra de título à janela

```text
TitleBar (click, double click, secondary click, drag)
  ──► WindowController from the closest WindowScope
        NativeWindowController (@oito2/ui-window)
          ├──► @tauri-apps/api/window: minimize, toggleMaximize, close,
          │                            startDragging, startResizeDragging
          └──► tauri-plugin-oito2-window: show_window_menu, set_decoration_mode,
                                          decoration_mode
```

O estado da janela (maximizada, tela cheia, com foco) volta dos eventos da janela para o `state` reativo do controlador, que as barras de título renderizam. Detalhes em [Moldura da janela](../architecture/window-chrome.md).

### Tokens e temas, dos valores ao CSS

```text
tokens/values.ts ──(pnpm generate)──► tokens.css
theme/ (createColorTheme) ──(pnpm generate)──► schemes.css (36 base schemes)
ui-themes presets ──(pnpm generate)──► presets.css (13 presets + high contrast)

At run time:
SystemSettings + ThemeProvider props ──► createColorTheme / preset ──► ColorTheme
  ──► colorThemeStyle() ──► --oito2-color-*, --oito2-chrome-*, --oito2-syntax-*
      on the ThemeProvider div ──► components read var(--oito2-…)
```

A CI roda `pnpm generate:check` para que o CSS gerado nunca se afaste das fontes. Detalhes em [Tokens e temas](../architecture/tokens-and-themes.md).

## Organização de pastas e pacotes

| Caminho                               | O que fica ali                                                                                                                                                                                                               |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/ui`                         | `@oito2/ui`: tokens, temas de cor, fundação (plataforma, ambiente de desktop, layout de botões, escopo do sistema), localização, primitivas de interação, moldura da janela, coleções, atalhos, attachments e os componentes |
| `packages/ui-themes`                  | `@oito2/ui-themes`: os 13 presets nomeados e o `presets.css`                                                                                                                                                                 |
| `packages/ui-syntax`                  | `@oito2/ui-syntax`: highlight.js colorido com os papéis de sintaxe do esquema, `CodeBlock`, JetBrains Mono                                                                                                                   |
| `packages/ui-extras`                  | `@oito2/ui-extras`: QR code, bloco de assinatura, recortador de imagem, menu de navegação                                                                                                                                    |
| `packages/ui-files`                   | `@oito2/ui-files`: upload, área de soltar e download de arquivos, com um adaptador Tauri e um adaptador de navegador                                                                                                         |
| `packages/ui-window`                  | `@oito2/ui-window`: `initWindow`, `NativeWindowController`, `WindowResizeHandles`                                                                                                                                            |
| `packages/ui-settings`                | `@oito2/ui-settings`: `SystemSettingsScope`, `composeSystemSettings`, `loadSystemSettings`                                                                                                                                   |
| `packages/ui-test-utils`              | Utilitários de teste compartilhados pelos pacotes (privado)                                                                                                                                                                  |
| `plugins/tauri-plugin-oito2-window`   | Rust: modos de decoração e o menu nativo da janela                                                                                                                                                                           |
| `plugins/tauri-plugin-oito2-settings` | Rust: o comando `read_settings` e o evento de mudança sobre o `oito2_settings` (sessão de desktop, fontes do layout de botões, acento, alto contraste, esquema de cores, observadores)                                       |
| `apps/showcase`                       | O catálogo SvelteKit de todos os componentes, compilado para o GitHub Pages e como app Tauri (`src-tauri/`)                                                                                                                  |
| `tools/generate-css`                  | Gera `tokens.css`, `schemes.css` e `presets.css`                                                                                                                                                                             |
| `tools/generate-docs`                 | Gera a referência de API do showcase (`apps/showcase/src/lib/api/api.json`)                                                                                                                                                  |
| `tools/parity`                        | `sync.ts`, que copia as fixtures de paridade exportadas pelo oito2_ui                                                                                                                                                        |
| `tools/release`                       | `sync-versions.ts`, que mantém todas as versões iguais                                                                                                                                                                       |
| `tools/templates`                     | Os cabeçalhos de licença GPL-3.0, um por sintaxe de comentário                                                                                                                                                               |

Dentro de `packages/ui/src/lib`:

| Pasta                          | Conteúdo                                                                                                                           |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `tokens/`                      | `values.ts`, a fonte única de todos os valores de token (um módulo sem imports)                                                    |
| `theme/`                       | Funções de esquema de cores, saída de variáveis CSS, `ThemeProvider`, contexto de tema                                             |
| `foundation/`                  | `Platform`, utilitários de cor e contraste, detecção do ambiente de desktop, `WindowButtonLayout`, `SystemSettings`, `SystemScope` |
| `styles/`                      | `styles.css`, `fonts.css`, `tokens.css`, `density.css`, `base.css`, `schemes.css`                                                  |
| `internal/`                    | Primitivas de interação, não exportadas                                                                                            |
| `window/`                      | Barras de título, controles de janela, `WindowScope`, `titleBarGestures`                                                           |
| `collections/`                 | `ListCollection`, `TreeCollection`, `SelectionController`, `AsyncListController`                                                   |
| `shortcuts/`                   | `Shortcut`, `KeyChord`, `Commands`                                                                                                 |
| `attachments/`, `transitions/` | Attachments públicos (`focusBorder`, `edgeFocus`, `draggable`, `undershoot`) e `pageTransition`                                    |
| `l10n/`, `format/`             | Textos em inglês e português do Brasil, `LocaleProvider`, formatação de números, datas e bytes                                     |
| `icons/`                       | O subcaminho `@oito2/ui/icons`, `AnimatedIcon`, nomes de ícones freedesktop                                                        |
| `components/<grupo>/`          | Os componentes; as partes dos compostos ficam em uma subpasta com um `index.ts`                                                    |

## Principais dependências

### npm (tempo de execução)

| Dependência                                          | Usada por                                        | Por quê                                                                                                                   |
| ---------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `svelte` (peer, `^5.57.0`)                           | todos os pacotes                                 | O framework de componentes, no modo runas                                                                                 |
| `@floating-ui/dom`                                   | `@oito2/ui`                                      | A única dependência de posicionamento: coloca popovers, menus, tooltips e selects ao lado da âncora e os mantém visíveis  |
| `@lucide/svelte`                                     | `@oito2/ui`, `ui-extras`, `ui-files`             | Ícones, importados um a um para que os bundlers mantenham só os usados; reexportados por `@oito2/ui/icons`                |
| `@material/material-color-utilities`                 | `@oito2/ui`                                      | O esquema tonal-spot do Material 3 gerado a partir do acento, para que os papéis coincidam com o `ColorScheme` do Flutter |
| `@catppuccin/palette`                                | `@oito2/ui-themes`                               | As cores oficiais do Catppuccin para os quatro presets Catppuccin                                                         |
| `highlight.js`                                       | `@oito2/ui-syntax`                               | Separa o código-fonte em tokens para o realce de sintaxe                                                                  |
| `qrcode-generator`                                   | `@oito2/ui-extras`                               | Codifica QR codes                                                                                                         |
| `@tauri-apps/api`                                    | `ui-window`, `ui-settings`, `ui-files`, showcase | IPC (`invoke`, eventos) e a API de janela; carregada com `import()` dinâmico ou protegida por `isTauri()`                 |
| `@tauri-apps/plugin-dialog`, `@tauri-apps/plugin-fs` | `@oito2/ui-files`                                | O seletor de arquivos nativo, o diálogo Salvar como e a leitura e escrita de arquivos no Tauri                            |

### Rust

| Crate                                    | Usado por                 | Por quê                                                                                                                                                             |
| ---------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tauri` (2.12)                           | os dois plugins, showcase | O runtime do app e a API de plugins                                                                                                                                 |
| `tauri-plugin` (build)                   | os dois plugins           | Gera os arquivos de permissão a partir dos comandos                                                                                                                 |
| `serde`                                  | os dois plugins           | Serializa `RawSettings`, `DecorationMode` e os erros para o webview (pelos crates oito2 e pelo erro próprio do plugin de janela)                                    |
| `thiserror`                              | plugin de janela          | O enum de erro serializável dele                                                                                                                                    |
| `oito2_foundation` 0.1                   | os dois plugins           | `DecorationMode`, o suporte e a validação de posição do menu da janela, os tipos do `RawSettings`                                                                   |
| `oito2_settings` 0.1 (`watch`)           | plugin de configurações   | Os leitores e observadores de cada plataforma: GSettings, o portal XDG e os arquivos de configuração no Linux (pelo `gio`/`glib` 0.18), o Windows Runtime, o AppKit |
| `gtk` 0.18 (Linux)                       | plugin de janela          | Decorações client-side do GTK e o menu de janela do GDK                                                                                                             |
| `windows` 0.62 (Windows)                 | plugin de janela          | O menu do sistema (`Win32_UI_WindowsAndMessaging`)                                                                                                                  |
| `tauri-plugin-dialog`, `tauri-plugin-fs` | showcase                  | O lado Rust dos componentes de arquivo                                                                                                                              |

Cada versão é declarada uma vez: as do npm no `catalog:` do `pnpm-workspace.yaml`, as dos crates em `[workspace.dependencies]` do `Cargo.toml` da raiz.

## Principais decisões de design

| Decisão                                                             | Justificativa                                                                                                                                                                                                           |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| O oito2_ui é a fonte de verdade, conferida por fixtures de paridade | Duas implementações de um design se afastam se uma máquina não as comparar. O JSON exportado do Flutter é verificado nas suítes do Vitest.                                                                              |
| Comportamento escrito internamente, seguindo o WAI-ARIA APG         | Controle total sobre teclado, foco e leitor de tela, sem uma biblioteca headless para acompanhar. O Ark UI é só uma referência conceitual; seu código nunca é copiado.                                                  |
| Componentes atômicos por nome, compostos como namespaces            | `Button` e `Switch` são arquivos únicos; `Tabs.Root`, `Tabs.List`, `Tabs.Trigger` compartilham estado por um contexto criado pelo `Root`. As partes podem ser arranjadas e estilizadas livremente.                      |
| Sem prefixo `Oito2` nos nomes                                       | O escopo npm é o namespace. O CSS usa variáveis `--oito2-*`, classes `.oito2-*` e atributos `data-oito2-*`.                                                                                                             |
| Toda regra de componente dentro de `@layer oito2`                   | O CSS do app fora de camadas sempre vence, sem disputa de especificidade nem `!important`.                                                                                                                              |
| Runas e classes `.svelte.ts`, sem stores                            | Estado e controladores (`Controllable`, `Presence`, `SelectionController`) são classes com campos `$state`/`$derived`; os contextos expõem getters vivos (`.current`).                                                  |
| Attachments, não actions `use:`                                     | Comportamentos reutilizáveis (`focusScope`, `rovingFocus`, `dismissableLayer`, `floating`, `focusBorder`) são funções `{@attach …}` que rodam de novo quando suas entradas reativas mudam.                              |
| Código seguro para SSR                                              | Nada de `window`, `document` ou `navigator` no nível do módulo; o DOM só é tocado em efeitos, attachments, handlers ou `onMount`. As bibliotecas também funcionam em um app Svelte renderizado no servidor.             |
| Posicionamento de overlays só pelo `@floating-ui/dom`               | O anchor positioning do CSS existe na WebView baseline, mas um único motor de posicionamento atende todo overlay ancorado, com flip, shift, size e seta.                                                                |
| Overlays renderizados no hospedeiro do `ThemeProvider`              | Eles escapam do recorte e do empilhamento sem perder as custom properties do tema.                                                                                                                                      |
| Plugins devolvem valores brutos; o TypeScript os compõe             | As regras (detecção do desktop, fontes de layout, prioridade do acento) são puras e testáveis sem a plataforma, e o código Rust fica pequeno.                                                                           |
| As bibliotecas funcionam fora do Tauri                              | As chamadas nativas são protegidas por `isTauri()` e carregadas com `import()` dinâmico, então os mesmos pacotes rodam no navegador e o showcase é publicado como site.                                                 |
| `unsafe` só em `tauri-plugin-oito2-window/src/menu.rs`              | O workspace proíbe `unsafe_code` (`forbid`); o crate de janela só o nega (`deny`) para que o módulo do menu nativo (evento GDK bruto, `TrackPopupMenu`) possa permiti-lo, com cada bloco limitado às chamadas externas. |
| Uma versão para todos os pacotes e crates                           | O Changesets usa um grupo fixo para `@oito2/*`, e `tools/release/sync-versions.ts` copia a versão para o Cargo e o showcase, então uma tag nomeia um conjunto coerente.                                                 |
| GPL-3.0                                                             | O oito2 é software livre; todo arquivo-fonte escrito à mão leva o cabeçalho GPL-3.0 de `tools/templates/`.                                                                                                              |

As convenções completas estão em [`.instructions/TAURI-SVELTEKIT.md`](../../../.instructions/TAURI-SVELTEKIT.md) e em [Contribuindo](../contribuindo.md).
