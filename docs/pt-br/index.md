# Documentação — oito2_uikit

🌐 [English](../en/index.md) | **Português** | 🏠 [Voltar ao README](leiame.md)

---

O oito2_uikit é um design system em Svelte 5 para apps desktop Tauri v2 no Linux, Windows e macOS. Ele dá aos apps Rust a mesma identidade visual do design system Flutter oito2_ui — neutros no estilo GTK, densidade desktop de 34 px, papéis de cor do Material 3, 13 presets e contraste verificado pela WCAG — com cerca de 100 componentes acessíveis, chrome de janela para cada desktop e plugins Rust que leem as configurações do sistema. Os componentes também rodam em qualquer app Svelte 5 na web, como mostra o [showcase ao vivo](https://oito2.github.io/oito2_uikit/).

---

## 🚀 Primeiros passos

- [Pré-requisitos](./getting-started/prerequisites.md) — Node.js, pnpm, Rust e os pacotes de sistema do Tauri para cada sistema operacional.
- [Instalação](./getting-started/installation.md) — como adicionar os pacotes e plugins a um app, instalar o showcase e compilá-lo a partir do código, por sistema operacional.
- [Início rápido](./getting-started/quickstart.md) — o caminho mais curto até um app Tauri com janela temática e a barra de título do oito2.
- [Desinstalação](./getting-started/uninstallation.md) — como remover os pacotes de um app e o showcase do sistema, incluindo os dados que ele deixa.

---

## 🧠 Conceitos

- [Por que o oito2_uikit](./concepts/why-oito2_uikit.md) — o problema que ele resolve, por que Tauri v2 e Svelte 5, e os compromissos.
- [Como o oito2_uikit funciona](./concepts/how-oito2_uikit-works.md) — um passeio dos tokens de design aos componentes temáticos, barras de título e configurações do sistema.
- [Visão geral da arquitetura](./concepts/architecture.md) — fluxo de dados, organização dos pacotes, dependências principais e decisões de design.
- [Glossário](./concepts/glossary.md) — os termos do projeto, de papéis de cor a capabilities.

---

## 🏗️ Arquitetura (para contribuidores)

- [Tokens e temas](./architecture/tokens-and-themes.md) — valores dos tokens, CSS gerado, esquemas de cor, alto contraste e presets.
- [Primitivos de interação](./architecture/interaction-primitives.md) — foco, foco itinerante, typeahead, fechamento, portais, posicionamento, coleções e atalhos.
- [Chrome da janela](./architecture/window-chrome.md) — barras de título, controles da janela, o controlador de janela e o plugin de janela.
- [Configurações do sistema](./architecture/system-settings.md) — detecção do desktop, layout dos botões, cor de destaque, alto contraste e esquema de cores, do Rust aos componentes.
- [Paridade e geradores](./architecture/parity-and-generators.md) — as fixtures de paridade com o oito2_ui, os geradores de CSS e de API, scripts de release e CI.

---

## 🧭 Guias

- [Temas](./guides/theming.md) — modos, cores de destaque, presets, alto contraste, densidade e sobrescrita de tokens.
- [Integração com o desktop](./guides/desktop-integration.md) — configurações do sistema, barras de título próprias e configuração da janela num app Tauri.
- [Arquivos](./guides/files.md) — envio de arquivos, áreas de soltar e downloads no Tauri e no navegador.
- [Localização](./guides/localization.md) — textos em inglês e português, sobrescritas, formatação e layouts da direita para a esquerda.
- [Exemplos de fluxos](./guides/workflows/examples.md) — exemplos completos montados com os componentes.

---

## 📚 Referência

- [Pacotes](./reference/packages.md) — cada pacote, seus pontos de entrada, folhas de estilo e dependências.
- [Componentes](./reference/components.md) — todos os componentes do catálogo, com o pacote e a página no showcase.
- [Propriedades CSS personalizadas](./reference/css-custom-properties.md) — os tokens `--oito2-*`, papéis de cor e atributos de dados.
- [Plugins Tauri](./reference/tauri-plugins.md) — comandos, permissões e eventos dos dois plugins Rust.
- [Scripts do repositório](./reference/repository-scripts.md) — scripts pnpm, comandos Cargo e workflows de CI.

---

## 🛠️ Solução de problemas

- [Problemas comuns](./troubleshooting/common-issues.md) — erros e suas correções, organizados por sintoma.

---

## 🤝 Como contribuir

- [Guia de contribuição](contribuindo.md) — ambiente de desenvolvimento, verificações e o processo de lançamento.
- [Código de Conduta](codigo-de-conduta.md) e [Política de Segurança](seguranca.md).
