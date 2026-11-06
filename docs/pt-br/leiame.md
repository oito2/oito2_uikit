# oito2_uikit

Um design system em Svelte 5 para apps desktop Tauri v2 no Linux, Windows e macOS, com a mesma identidade visual do [oito2_ui](https://github.com/oito2/oito2_ui) para Flutter, mais plugins Rust para o chrome nativo da janela e as configurações do sistema.

[![CI](https://github.com/oito2/oito2_uikit/actions/workflows/ci.yml/badge.svg)](https://github.com/oito2/oito2_uikit/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@oito2/ui?label=%40oito2%2Fui)](https://www.npmjs.com/package/@oito2/ui)
[![Svelte](https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte)](https://svelte.dev)
[![Tauri](https://img.shields.io/badge/Tauri-2-24C8DB?logo=tauri)](https://v2.tauri.app)
[![Licença](https://img.shields.io/github/license/oito2/oito2_uikit?label=licen%C3%A7a)](../../LICENSE)

🌐 **Idioma:** [English](../../README.md) · Português

## Índice

- [Visão geral](#visão-geral)
- [Pré-requisitos e instalação rápida](#pré-requisitos-e-instalação-rápida)
- [Como atualizar](#como-atualizar)
- [Documentação](#documentação)
- [Licença](#licença)

## Visão geral

Os apps oito2 são escritos em Dart + Flutter (desktop, Android, web) e em Rust (só desktop). O oito2_uikit dá aos apps Rust, feitos com Tauri v2, a mesma aparência dos apps Flutter: neutros no estilo GTK, densidade desktop de 34 px, papéis de cor do Material 3, 13 presets nomeados e contraste verificado pela WCAG. O oito2_ui continua sendo a fonte de verdade do design, e fixtures de paridade exportadas dele são conferidas na CI.

O que ele oferece:

- **Cerca de 100 componentes** — botões, campos, seletores, menus, diálogos, abas, tabelas, árvores, toasts, uma paleta de comandos e mais — com comportamento de teclado e leitor de tela seguindo o WAI-ARIA Authoring Practices, testados com o axe no Chromium e no WebKit.
- **Chrome da janela** — barras de título e controles da janela em seis estilos (GNOME, Breeze, Xfwm, COSMIC, Windows, macOS), decorações no lado do cliente no Linux e no Windows, semáforos nativos no macOS.
- **Integração com o sistema** — detecção do ambiente desktop, layout dos botões da janela, cor de destaque e alto contraste lidos do sistema e acompanhados ao vivo.
- **Temas** — esquemas claro, escuro e de alto contraste a partir de qualquer cor de destaque, e 13 presets (Everforest, Rosé Pine, Nord, Dracula/Alucard, Catppuccin).
- **Pacotes opcionais** — realce de sintaxe, QR codes, um painel de assinatura, um recortador de imagens e envio/download de arquivos para Tauri e navegador.
- **Funciona sem Tauri** — os componentes rodam em qualquer app Svelte 5; o [showcase](https://oito2.github.io/oito2_uikit/) é o mesmo app compilado para a web.

O oito2_uikit é licenciado sob a GPL-3.0: um app que o usa precisa ser distribuído sob uma licença compatível com a GPL.

![O showcase do oito2_uikit](../img/showcase.png)

<!-- TODO: capture a screenshot of the showcase main window -->

### Pacotes

| Pacote                                                                     | Conteúdo                                                                                 |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [`@oito2/ui`](../../packages/ui)                                           | Tokens, temas, chrome da janela, primitivos de interação e os componentes                |
| [`@oito2/ui-themes`](../../packages/ui-themes)                             | Os 13 presets de cor nomeados                                                            |
| [`@oito2/ui-syntax`](../../packages/ui-syntax)                             | Realce de sintaxe (highlight.js) e um bloco de código                                    |
| [`@oito2/ui-extras`](../../packages/ui-extras)                             | QR code, painel de assinatura, recortador de imagens, menu de navegação                  |
| [`@oito2/ui-files`](../../packages/ui-files)                               | Envio de arquivos, área de soltar e download, para Tauri e navegador                     |
| [`@oito2/ui-window`](../../packages/ui-window)                             | Integração com a janela nativa (lado guest do `tauri-plugin-oito2-window`)               |
| [`@oito2/ui-settings`](../../packages/ui-settings)                         | Integração com as configurações do sistema (lado guest do `tauri-plugin-oito2-settings`) |
| [`tauri-plugin-oito2-window`](../../plugins/tauri-plugin-oito2-window)     | Rust: decorações, menu da janela                                                         |
| [`tauri-plugin-oito2-settings`](../../plugins/tauri-plugin-oito2-settings) | Rust: ambiente desktop, layout dos botões, cor de destaque, alto contraste               |

## Pré-requisitos e instalação rápida

### Sistemas suportados

| SO      | Status    | Versão mínima / distribuições                                         | WebView                |
| ------- | --------- | --------------------------------------------------------------------- | ---------------------- |
| Linux   | Suportado | Ubuntu 22.04+, Debian 12+, Linux Mint 21+, Zorin OS 17+, Fedora atual | WebKitGTK 2.50+        |
| Windows | Suportado | Windows 10 22H2 e Windows 11                                          | WebView2 (Evergreen)   |
| macOS   | Suportado | macOS 14 Sonoma e posteriores                                         | WKWebView (Safari 26+) |

No Linux, os apps precisam do runtime WebKitGTK 4.1 (`libwebkit2gtk-4.1-0` no Debian/Ubuntu, `webkit2gtk4.1` no Fedora), que o próprio Tauri exige.

### Requisitos

- Node.js 24+ e pnpm (ou npm).
- Um app Svelte 5; para builds desktop, um projeto Tauri v2 e os seus [pré-requisitos de sistema](https://v2.tauri.app/start/prerequisites/).

O [guia de instalação](getting-started/installation.md) cobre cada sistema em detalhe, e o [início rápido](getting-started/quickstart.md) monta um app completo.

### Adicione os componentes

```bash
pnpm add @oito2/ui
```

Importe os estilos uma vez e envolva o app num `ThemeProvider`:

```svelte
<script lang="ts">
	import '@oito2/ui/styles.css';
	import { Button, ThemeProvider } from '@oito2/ui';

	let { children } = $props();
</script>

<ThemeProvider mode="system" accent="blue">
	<Button variant="tonal">Olá</Button>
	{@render children()}
</ThemeProvider>
```

### Adicione a integração nativa (Tauri)

```bash
pnpm add @oito2/ui-window @oito2/ui-settings
```

```toml
# src-tauri/Cargo.toml
[dependencies]
tauri-plugin-oito2-window = { git = "https://github.com/oito2/oito2_uikit", tag = "v0.1.0" }
tauri-plugin-oito2-settings = { git = "https://github.com/oito2/oito2_uikit", tag = "v0.1.0" }
```

```rust
// src-tauri/src/lib.rs
tauri::Builder::default()
    .plugin(tauri_plugin_oito2_window::init())
    .plugin(tauri_plugin_oito2_settings::init())
```

Depois conceda `oito2-window:default` e `oito2-settings:default` na capability da janela. O README de cada pacote detalha a configuração.

### Experimente o showcase

Abra o [showcase web](https://oito2.github.io/oito2_uikit/) ou baixe o showcase desktop para o seu sistema na [versão mais recente](https://github.com/oito2/oito2_uikit/releases/latest). Os instaladores não têm assinatura de código; confira-os com o `SHA256SUMS`.

## Como atualizar

Todos os pacotes e crates compartilham uma única versão.

```bash
pnpm update "@oito2/*" --latest
```

Para os plugins Rust, troque `tag = "vX.Y.Z"` no `Cargo.toml` pela nova versão e rode `cargo update -p tauri-plugin-oito2-window -p tauri-plugin-oito2-settings`. Mantenha os pacotes npm e os crates na mesma versão. As mudanças de cada versão estão nos arquivos `CHANGELOG.md` dos pacotes e na [página de releases](https://github.com/oito2/oito2_uikit/releases). A remoção dos pacotes e do showcase está em [Desinstalação](getting-started/uninstallation.md).

## Documentação

- [Site de documentação](index.md) — o guia completo: [instalação](getting-started/installation.md), [início rápido](getting-started/quickstart.md), [arquitetura](concepts/architecture.md), [guias](guides/theming.md), [referência](reference/components.md) e [solução de problemas](troubleshooting/common-issues.md).
- [Showcase ao vivo](https://oito2.github.io/oito2_uikit/) — todos os componentes, com exemplos, código-fonte e referência de API.
- READMEs dos pacotes — configuração e uso de cada pacote (veja a [tabela acima](#pacotes)).
- [Como contribuir](contribuindo.md) — ambiente de desenvolvimento, verificações e o processo de lançamento.
- [Código de Conduta](codigo-de-conduta.md) e [Política de Segurança](seguranca.md).

## Licença

GPL-3.0 — veja [LICENSE](../../LICENSE).
