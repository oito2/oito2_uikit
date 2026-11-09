🌐 [English](../../en/concepts/why-oito2_uikit.md) | **Português** | 🏠 [Índice](../index.md)

---

# Por que oito2_uikit

## O problema

Os apps oito2 são construídos com duas stacks:

| Stack          | Plataformas                | Design system                                 |
| -------------- | -------------------------- | --------------------------------------------- |
| Dart + Flutter | Desktop, Android, web      | [oito2_ui](https://github.com/oito2/oito2_ui) |
| Rust           | Somente desktop (Tauri v2) | oito2_uikit (este repositório)                |

Quem usa os dois tipos de app não deveria conseguir distingui-los pela aparência: as mesmas superfícies neutras no estilo GTK, os mesmos controles de 34 px no desktop, os mesmos papéis de cor e acentos do Material 3, as mesmas barras de título e botões de janela, os mesmos textos em inglês e português do Brasil.

O oito2_uikit dá essa identidade visual aos apps em Rust. Ele porta o oito2_ui para componentes Svelte 5 que rodam no webview do Tauri, mais dois plugins Rust para o que um webview não faz sozinho: desenhar a moldura da janela e ler as configurações do sistema.

O oito2_ui continua sendo a **fonte de verdade do design**. Mudanças visuais entram primeiro lá e são portadas para cá; fixtures JSON exportadas do oito2_ui conferem que os dois concordam (veja [Paridade e geradores](../architecture/parity-and-generators.md)).

## Por que Tauri v2

- **Binários pequenos.** O Tauri usa o webview do sistema (WebKitGTK no Linux, WebView2 no Windows, WKWebView no macOS) em vez de empacotar um motor de navegador.
- **Um backend em Rust.** A integração nativa — decorações client-side do GTK, o menu da janela, GSettings, o portal XDG, o Windows Runtime, o AppKit — é escrita em Rust, a linguagem dos próprios apps.
- **Menor privilégio por padrão.** O webview só alcança os comandos que uma capability concede; os dois plugins trazem conjuntos de permissões padrão estreitos (`oito2-window:default`, `oito2-settings:default`).

## Por que Svelte 5

- **Os design tokens viram custom properties CSS quase 1:1.** Cada token do oito2_ui (raio, espaçamento, tamanhos, tipografia, papéis de cor) vira uma variável `--oito2-*`; um tema é um conjunto de variáveis em um elemento.
- **Acessibilidade pela plataforma web.** Papéis, estados e teclado seguem as WAI-ARIA Authoring Practices, e o navegador os expõe ao leitor de tela de cada sistema. As galerias são verificadas com axe.
- **Reatividade granular sem DOM virtual.** As runas (`$state`, `$derived`) mantêm o estado dos componentes em classes pequenas, e o código compilado fica pequeno.
- **O mesmo código roda na web.** Os componentes não dependem do Tauri; o [showcase](https://oito2.github.io/oito2_uikit/) é o mesmo app SvelteKit compilado para o GitHub Pages e para o desktop.

## Compromissos

Estes são custos reais da abordagem, aceitos de propósito:

| Compromisso                      | O que significa                                                                                                                                                                                                     | Como o projeto lida com isso                                                                                                                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Três motores de webview          | O app renderiza no WebKitGTK, no WebView2 (Chromium) ou no WKWebView conforme o sistema, então CSS e DOM podem se comportar de forma diferente.                                                                     | Todo teste de componente roda no Chromium e no WebKit; um teste que passa em só um motor é tratado como bug. Uma [WebView baseline](glossary.md#webview-baseline) fixa limita os recursos usados. |
| O WebKitGTK é o elo mais fraco   | A baseline do Linux (WebKitGTK 2.50, para o Ubuntu 22.04) não tem alguns recursos, como `field-sizing` e `scrollbar-color`.                                                                                         | Esses recursos só são usados como melhoria progressiva, com fallback em script, ou não são necessários (o `ScrollArea` desenha a própria barra de rolagem).                                       |
| A aparência nativa é reproduzida | Botões, menus e barras de título são HTML desenhado para parecer GNOME, KDE Breeze, Xfwm, COSMIC, Windows ou macOS — não são os widgets do toolkit. Uma troca de tema do sistema não os reestiliza automaticamente. | Os plugins leem do sistema o layout dos botões, a cor de acento e o alto contraste, e os componentes os acompanham ao vivo. No macOS os semáforos reais são mantidos.                             |
| Licença copyleft                 | O oito2_uikit é GPL-3.0; um app que o usa precisa ser distribuído sob uma licença compatível com a GPL.                                                                                                             | Informado em todos os READMEs.                                                                                                                                                                    |

## Alternativas

Outras stacks constroem bons apps desktop; elas se encaixam menos na situação do oito2:

| Alternativa                        | Ponto forte                                                    | Por que não foi a escolha aqui                                                                                                                                              |
| ---------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Electron                           | Um Chromium empacotado: renderização idêntica em todo sistema. | Cada app leva o próprio motor de navegador e um backend Node.js; os apps desktop do oito2 são escritos em Rust.                                                             |
| Flutter para todos os apps         | O oito2_ui já existe e renderiza igual em todo lugar.          | Os apps em Rust precisariam de uma camada de UI em Dart e de uma ponte para o núcleo em Rust; o oito2_uikit os mantém em Rust com um frontend web.                          |
| GUIs nativas em Rust (Slint, Iced) | Sem webview; Rust puro.                                        | O design system inteiro — cerca de 100 componentes, sua acessibilidade e seu teclado — teria de ser refeito no modelo de cada toolkit, e não haveria build web do showcase. |

## Próximos passos

- [Como o oito2_uikit funciona](how-oito2_uikit-works.md) — um passeio conceitual.
- [Arquitetura](architecture.md) — fluxo de dados, organização, dependências e decisões de design.
- [Glossário](glossary.md) — os termos usados na documentação.
