🌐 [English](../../en/concepts/glossary.md) | **Português** | 🏠 [Índice](../index.md)

---

# Glossário

Termos usados na documentação e no código do oito2_uikit, em ordem alfabética.

### Acento

A matiz que um esquema usa como cor primária. O `@oito2/ui` nomeia nove acentos da paleta de acentos do GNOME — `blue` (o padrão), `teal`, `green`, `yellow`, `orange`, `red`, `pink`, `purple` e `slate` (`accentColors`, também `--oito2-accent-<nome>`) — e o `ThemeProvider` aceita ainda qualquer cor hex. Sem a prop `accent`, ele usa o acento do sistema vindo do `SystemScope` e, na falta dele, o azul.

### Alto contraste

Uma variante de esquema cujas cores de texto e semânticas atingem 7:1 (WCAG AAA) e os contornos 4.5:1, em vez de 4.5:1 e 3:1. O `ThemeProvider` a ativa pelo sistema (`SystemSettings.highContrast` ou `prefers-contrast: more`) ou pela prop `highContrast`. No CSS estático, os esquemas de alto contraste levam o sufixo `-hc`.

### Ambiente de desktop

O desktop Linux em que o app roda, detectado por `XDG_CURRENT_DESKTOP` (primeira entrada reconhecida) e depois por `DESKTOP_SESSION`: `gnome`, `kde`, `xfce`, `budgie`, `cosmic`, `cinnamon`, `mate`, `lxqt`, `pantheon`, `unity` ou `unknown`. É `null` fora do Linux nativo.

### Attachment

Uma função do Svelte 5 aplicada a um elemento com `{@attach …}`. O oito2_uikit escreve todo comportamento reutilizável como attachment em vez de action `use:`: os públicos `focusBorder`, `edgeFocus`, `draggable` e `undershoot`, e os internos `focusScope`, `rovingFocus`, `dismissableLayer` e `floating`.

### Capability

Um arquivo do Tauri v2 em `src-tauri/capabilities/` que concede permissões a janelas pelo rótulo. Um webview só chama os comandos que sua capability concede. A `main-capability` do showcase concede as ações básicas de janela, `oito2-window:default`, `oito2-settings:default` e as permissões de diálogo e arquivos do `@oito2/ui-files`.

### Catálogo

A seção `catalog:` do `pnpm-workspace.yaml`, onde cada versão de dependência npm é declarada uma vez; os manifestos dos pacotes a referenciam com `"catalog:"`.

### Changeset

Um arquivo Markdown em `.changeset/`, criado com `pnpm changeset`, que registra uma mudança visível ao usuário e seu incremento (`patch`, `minor`, `major`). O `pnpm release:version` aplica os changesets pendentes. Todos os pacotes `@oito2/*` formam um grupo fixo, então sempre compartilham a versão.

### Componente composto

Um componente feito de partes, exportado como namespace: `Tabs.Root`, `Tabs.List`, `Tabs.Trigger`, `Tabs.Content`. O `Root` cria o estado e o publica com `setContext`; as partes o leem. É o oposto de um **componente atômico** (`Button`, `Switch`), um arquivo único exportado pelo nome.

### Configurações brutas

`RawSettings`, o que o `tauri-plugin-oito2-settings` informa: variáveis de sessão, valores do GSettings, valores dos arquivos de configuração do desktop, o acento do sistema e o indicador de alto contraste. O `composeSystemSettings` as transforma em `SystemSettings`.

### Cores de chrome

As cores estruturais da janela em um esquema: `background`, `sidebar`, `mainbar`, `titleBar` e `dialog` (`ChromeColors`), expostas como `--oito2-chrome-<superfície>`. Superfícies de chrome vizinhas diferem em pelo menos `chromeMinimumStep` (1.04:1).

### Cores semânticas

As cores de acento e de status seguras para texto de um esquema: `primaryText`, `errorText`, `success`, `warning`, `info` e `link`, expostas como `--oito2-color-primary-text` e assim por diante.

### CSD (decorações client-side)

O app desenha a própria barra de título e os botões da janela em vez dos do sistema. No Linux, o modo de decoração `gtk-headerless` usa as decorações client-side do GTK com uma barra de título vazia, então o GTK mantém a sombra e as bordas de redimensionamento enquanto o webview desenha a barra.

### Densidade

O conjunto de tamanhos de controle: **ponteiro** (controles de 34 px, o padrão) ou **toque** (controles de 40 px, alvos de 48 px). Os tamanhos de toque valem sob `@media (pointer: coarse)` ou dentro de `[data-oito2-density='touch']`; `[data-oito2-density='pointer']` força os tamanhos de ponteiro. Os componentes leem as variáveis de densidade do `density.css` (`--oito2-control-height`, `--oito2-icon-size`…).

### Esquema

Um conjunto completo e resolvido de cores (`ColorTheme`): brilho, nível de contraste, fundo, o `colorScheme` do Material e as cores `semantic`, `chrome` e `syntax`. É montado por `createColorTheme` (o **esquema base**) ou por `colorThemeFromRoles` (presets). O `schemes.css` pré-calcula os 36 esquemas base em seletores como `[data-oito2-scheme='light-blue']`.

### Estado controlável

Um valor de componente que pode ser controlado pelo pai (`bind:value`, `bind:open`, `bind:checked`, ou um valor mais um callback `on<Nome>Change`) ou ficar não controlado (o componente o guarda, começando de `default<Nome>`). Implementado pela classe interna `Controllable`.

### Estilo dos controles de janela

A aparência dos botões da janela: `gnome`, `breeze` (KDE), `xfwm` (Xfce), `cosmic`, `windows`, `macos` (semáforos) ou `none` (web e plataformas de toque). O `resolveWindowControlStyle` o escolhe pela plataforma e pelo ambiente de desktop; desktops Linux sem estilo próprio usam `gnome`.

### Fixture de paridade

Um arquivo JSON exportado do oito2_ui pelos testes Flutter de `tools/parity` e versionado em `packages/*/src/fixtures/parity/` (em `ui`, `ui-syntax` e `ui-extras`). As suítes do Vitest verificam que o oito2_uikit produz os mesmos valores.

### Layout dos botões

A ordem e o lado dos botões da janela (minimizar, maximizar, fechar) numa barra de título: `WindowButtonLayout`, com as listas `leading` e `trailing`. É lido da configuração de cada desktop (a string `button-layout` do GNOME, as letras `ButtonsOnLeft`/`ButtonsOnRight` do KWin, o `button_layout` do Xfwm, as flags do COSMIC) ou vem de `WindowButtonLayout.defaultFor(style)`.

### Modo de decoração

Como o `tauri-plugin-oito2-window` emoldura uma janela: `native` (moldura do sistema; padrão no macOS), `undecorated` (sem moldura do sistema; padrão no Windows) ou `gtk-headerless` (CSD do GTK com barra de título vazia; padrão no Linux, `undecorated` nos outros sistemas).

### Pacote guest

O pacote npm que é o lado do webview de um plugin Rust: `@oito2/ui-window` para o `tauri-plugin-oito2-window`, `@oito2/ui-settings` para o `tauri-plugin-oito2-settings`. Cada um embrulha os comandos do plugin em funções tipadas.

### Papéis de sintaxe

As cores de token de um bloco de código: `foreground`, `comment`, `keyword`, `string`, `number`, `function`, `type`, `tag`, `attribute`, `constant` e `invalid`, expostas como `--oito2-syntax-<papel>`.

### Papel de cor

Uma cor nomeada de um esquema. Os papéis do Material 3 (`primary`, `onSurface`, `surfaceContainerHigh`…) são expostos como `--oito2-color-<papel>` em kebab-case, ao lado de `background`, das cores semânticas e das cores de componente. Texto usa os papéis seguros para texto (`on-surface`, `on-surface-variant`, `primary-text`, `error-text`, as cores de status); `primary` e `error` são preenchimentos.

Também: as **cores de papel** (`ColorRoles`) que uma família de temas publica — `background`, `card`, `foreground`, `primary`, `secondary`, `mutedForeground`, `destructive`, `border`, `success`, `warning`, `info` e `syntax` — a partir das quais o `colorThemeFromRoles` deriva um esquema completo.

### Permissão

Um identificador do Tauri v2 que permite ou nega um comando (`oito2-settings:allow-read-settings`) ou agrupa vários (`oito2-window:default`). As permissões são concedidas às janelas por capabilities.

### Portal

O componente interno que renderiza overlays (diálogos, menus, popovers, tooltips, toasts) em outro ponto do documento: no elemento hospedeiro do `ThemeProvider` mais próximo, ou no `document.body` sem ele. O conteúdo mantém os contextos do lugar onde é usado.

### Preset

Um dos 13 temas de cor nomeados do `@oito2/ui-themes`: Everforest Light/Dark, Rosé Pine, Rosé Pine Moon, Rosé Pine Dawn, Nord Dark/Light, Dracula, Alucard e Catppuccin Latte/Frappé/Macchiato/Mocha. Cada um tem brilho fixo e uma variante de alto contraste.

### Região de arraste

As partes vazias de uma barra de título que movem a janela: a própria barra e os descendentes marcados com `data-oito2-drag-region`. O `titleBarGestures` faz com que pressioná-las arraste a janela, clicar duas vezes maximize ou restaure, e o botão secundário abra o menu da janela.

### SystemScope

O componente que fornece `SystemSettings` (plataforma, ambiente de desktop, estilo dos controles de janela, layout dos botões, acento, alto contraste) aos componentes abaixo dele; lido com `useSystemSettings()`. Sem ele, os componentes usam `fallbackSystemSettings(Platform.current())`. O `SystemSettingsScope` do `@oito2/ui-settings` é um `SystemScope` alimentado pelo plugin Rust.

### ThemeProvider

O componente que aplica um esquema: renderiza uma `div` com as custom properties do esquema, fornece o tema a `useTheme()` e hospeda o portal dos overlays no seu fim.

### Token

Um valor de design do oito2: um raio, passo de espaçamento, tamanho, acento, cor neutra ou de status, ou estilo de texto. Os valores dos tokens ficam só em `packages/ui/src/lib/tokens/values.ts`; o `tokens.css` é gerado a partir dele como custom properties `--oito2-*`.

### WebView baseline

O webview mais antigo que cada sistema suportado precisa atender: WebKitGTK 2.50 no Linux, WebView2 Evergreen no Windows, Safari/WebKit 26 no macOS. Todo recurso de CSS, DOM e JavaScript que uma biblioteca usa precisa funcionar em toda a baseline.

### WindowScope

O componente que fornece um `WindowController` às barras de título abaixo dele. No Tauri, o controlador é o `NativeWindowController` devolvido por `initWindow()`; no navegador ele é `null` e as barras de título não mostram controles de janela funcionais.
