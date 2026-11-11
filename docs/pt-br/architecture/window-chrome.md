🌐 [English](../../en/architecture/window-chrome.md) | **Português** | 🏠 [Índice](../index.md)

---

# Moldura da janela

Como os apps oito2 desenham a própria barra de título e os botões da janela, e como eles chegam à janela real. Três camadas participam:

| Camada                       | Pacote                             | Papel                                                                                       |
| ---------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------- |
| Barras de título e controles | `@oito2/ui` (`window/`)            | Desenham a barra e os botões; traduzem cliques e arrastes em chamadas ao `WindowController` |
| Controlador da janela        | `@oito2/ui-window`                 | Implementa o `WindowController` para uma janela Tauri; acompanha o estado da janela         |
| Moldura e menu da janela     | `tauri-plugin-oito2-window` (Rust) | Aplica o modo de decoração; mostra o menu nativo da janela                                  |

Para configurar isso em um app, veja o [guia de integração com o desktop](../guides/desktop-integration.md) e o [README do `@oito2/ui-window`](../../../packages/ui-window/README.md).

## Barras de título no `@oito2/ui`

| Componente       | O que é                                                                                                                                                                                                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TitleBar`       | A barra base: 46 px de altura em `--oito2-chrome-title-bar`, conteúdo `leading`, um `title` (centralizado por padrão), conteúdo `trailing` e os controles de janela de `buttonLayout` no `controlStyle`. `barStyle` é `normal`, `undecorated` (sem controles) ou `hidden`. |
| `WindowTitleBar` | Uma `TitleBar` configurada a partir do `SystemScope` mais próximo (veja abaixo). A maioria dos apps usa esta ou a `HeaderBar`.                                                                                                                                             |
| `HeaderBar`      | Uma header bar no estilo GNOME sobre a `WindowTitleBar`: controles `start` e `end`, um `title`, uma busca opcional (`searchable`) e um seletor de visualização opcional (`tabs`).                                                                                          |
| `DialogTitleBar` | A barra de uma janela de diálogo ou painel: um título e só o botão de fechar, no lado em que o desktop o coloca; transparente e não arrastável. Dentro de um `Dialog`, o botão o fecha.                                                                                    |
| `WindowControls` | Uma fileira de botões `WindowControl` na ordem dada, ligada a um controlador; sem espaço entre os botões do Windows e os semáforos, 8 px nos demais estilos.                                                                                                               |
| `WindowControl`  | Um botão de minimizar, maximizar/restaurar ou fechar em um estilo: `gnome`, `breeze`, `xfwm`, `cosmic`, `windows`, `macos` ou `none` (não renderiza nada). Fora da ordem de Tab, como os nativos.                                                                          |

### Como a `WindowTitleBar` se adapta à plataforma

| Plataforma (pelo `SystemScope`)          | Resultado                                                                                                                                          |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plataforma de toque                      | Uma app bar de 56 px, sem controles de janela, não arrastável                                                                                      |
| Web (não é um webview de desktop nativo) | Sem controles de janela, não arrastável                                                                                                            |
| macOS (nativo)                           | Nenhum controle desenhado; um recuo inicial de 72 px para os semáforos nativos (nenhum em tela cheia)                                              |
| Linux e Windows (nativos)                | O `windowControlStyle` e o `windowButtonLayout` das configurações do sistema; o título começa à esquerda no Windows e fica centralizado nos demais |

`buttonSides` (`both`, `leading`, `trailing`) mantém só os botões de um lado, para layouts divididos em que cada painel tem sua própria barra.

### Gestos

`titleBarGestures(controller)` é o attachment por trás das áreas vazias da barra — a própria barra e os descendentes marcados com `data-oito2-drag-region` (`dragRegionAttribute`):

| Gesto em uma área vazia             | Ação                                                                    |
| ----------------------------------- | ----------------------------------------------------------------------- |
| Pressionar o botão primário e mover | `controller.startDrag()` (não em tela cheia)                            |
| Clique duplo                        | `controller.toggleMaximize()`                                           |
| Clique secundário                   | `controller.showMenu({ x, y })` quando `state.canShowMenu` é verdadeiro |

Os controles colocados na barra mantêm os próprios cliques.

## O contrato do controlador de janela

O `window/window-controller.ts` define o que uma barra de título precisa de uma janela:

```ts
interface WindowController {
	readonly state: WindowState; // isMaximized, isFullScreen, isActive, canShowMenu
	minimize(): Promise<void>;
	toggleMaximize(): Promise<void>;
	close(): Promise<void>;
	startDrag(): Promise<void>;
	showMenu(position?: { x: number; y: number }): Promise<void>;
}
```

O `state` precisa ser reativo para que a barra se redesenhe (maximizar vira restaurar, e uma janela inativa marca a barra com `data-inactive`). O `WindowScope` fornece um controlador por contexto (`setWindowController` / `useWindowController`); quando ele é `null` — na web ou antes de a janela estar pronta — as barras não mostram controles funcionais. Testes e prévias podem fornecer o próprio controlador; o showcase usa um simulado para imitar cada desktop no navegador.

## `@oito2/ui-window`

| Export                                                  | Papel                                                                                                                                                                                                                                                       |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initWindow(options)`                                   | Devolve `null` fora do Tauri. Dentro do Tauri carrega `@tauri-apps/api/window`, aplica opcionalmente `decorations`, `title`, `size`, `minimumSize` e `center`, mostra e foca a janela (`show`, verdadeiro por padrão) e devolve um `NativeWindowController` |
| `NativeWindowController`                                | O `WindowController` de uma janela Tauri: `minimize`, `toggleMaximize`, `close`, `startDrag`, `startResize(direction)`, `showMenu`, `dispose`. Seu `state` acompanha as mudanças de tamanho, foco e tela cheia da janela.                                   |
| `WindowResizeHandles`                                   | Alças invisíveis nas bordas e cantos que chamam `startResize`; aparecem só em uma janela Linux `undecorated` que não esteja maximizada nem em tela cheia                                                                                                    |
| `setDecorationMode`, `decorationMode`, `showWindowMenu` | Wrappers tipados dos comandos do plugin (`plugin:oito2-window\|…`)                                                                                                                                                                                          |

`canShowMenu` é verdadeiro no Linux e no Windows. Por padrão, o controlador espelha o estado no elemento raiz em atributos como `data-oito2-window-maximized` e em `data-oito2-decorations`, para que o CSS do app possa reagir a ele.

As ações de janela usam permissões do núcleo do Tauri (`core:window:allow-minimize`, `allow-toggle-maximize`, `allow-close`, `allow-start-dragging`, `allow-start-resize-dragging`); as opções do `initWindow` precisam das suas (`allow-set-title`, `allow-set-size`, `allow-set-min-size`, `allow-center`, `allow-show`, `allow-set-focus`).

## `tauri-plugin-oito2-window`

### Modos de decoração

O `DecorationMode` (serializado em kebab-case, reexportado do crate [`oito2_foundation`](https://docs.rs/oito2_foundation) do oito2_rs) é aplicado com `apply_decoration_mode(&window, mode)` pelo Rust ou pelo comando `set_decoration_mode`, de preferência enquanto a janela ainda está oculta (`"visible": false`):

| Modo             | Implementação                                                                                                                                                                                                              | Padrão em |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| `native`         | `set_decorations(true)`                                                                                                                                                                                                    | macOS     |
| `undecorated`    | `set_decorations(false)`; o app desenha a barra, e o `WindowResizeHandles` redimensiona a janela no Linux                                                                                                                  | Windows   |
| `gtk-headerless` | No Linux, um `gtk::Box` vazio e oculto definido como barra de título do GTK: o GTK passa a usar decorações client-side e mantém a sombra e as bordas de redimensionamento. Nos outros sistemas, o mesmo que `undecorated`. | Linux     |

`DecorationMode::platform_default()` devolve o padrão do sistema em execução. O plugin registra o modo aplicado a cada rótulo de janela (`DecorationState`), e `decoration_mode` o devolve, ou `native`/`undecorated` conforme a janela tenha moldura do sistema.

O showcase aplica o modo no seu `setup` em Rust e lê uma substituição da variável de ambiente `OITO2_DECORATIONS` (um recurso de depuração do showcase, não do plugin).

### O menu nativo da janela (`src/menu.rs`)

`show_window_menu(x, y)` (pixels CSS a partir do canto superior esquerdo do webview, cada um validado como número finito de 0 a 100 000 pelo `oito2_foundation::window_menu::validate_position`) abre o menu de janela do sistema — Restaurar, Mover, Redimensionar, Minimizar, Maximizar, Fechar e o que o desktop acrescentar — na thread principal:

| Plataforma | Implementação                                                                                                                                                                                       |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Linux      | Cria um evento sintético de botão pressionado do GDK na posição (traduzida do webview para a janela inteira, que inclui a sombra client-side) e chama `gdk_window_show_window_menu`                 |
| Windows    | `GetSystemMenu` + `TrackPopupMenu`, habilitando os itens conforme o estado (Restaurar só quando maximizada, Mover/Redimensionar/Maximizar só quando não), e então posta o `WM_SYSCOMMAND` escolhido |
| macOS      | Não suportado: devolve um erro `Unsupported`                                                                                                                                                        |

As duas implementações precisam de APIs brutas da plataforma. Este módulo é o **único** lugar do repositório autorizado a usar `unsafe`: o workspace define `unsafe_code = "forbid"`, este crate o rebaixa para `deny`, e o `lib.rs` marca `mod menu` com `#[allow(unsafe_code)]`. Cada bloco `unsafe` se limita às chamadas externas e traz um comentário `SAFETY`.

### Permissões

| Identificador                                     | Permite                                                                        |
| ------------------------------------------------- | ------------------------------------------------------------------------------ |
| `oito2-window:default`                            | `allow-set-decoration-mode`, `allow-decoration-mode`, `allow-show-window-menu` |
| `oito2-window:allow-<comando>` / `deny-<comando>` | Um comando cada (gerados em `permissions/autogenerated/`)                      |

## macOS: barra de título sobreposta com semáforos

O macOS mantém o modo `native`, então o sistema continua desenhando os semáforos. Para colocar o cabeçalho do próprio app sob eles, a janela é configurada com barra de título sobreposta no `tauri.macos.conf.json`, como faz o showcase:

```json
{
	"label": "main",
	"visible": false,
	"titleBarStyle": "Overlay",
	"hiddenTitle": true,
	"trafficLightPosition": { "x": 16, "y": 17 }
}
```

A `WindowTitleBar` então deixa um recuo de 72 px no início da barra para os semáforos e não desenha botões próprios. O estilo de controle `macos` desenha semáforos onde não há nativos, quando uma `TitleBar` ou `WindowControls` recebe `controlStyle="macos"` diretamente (como fazem as páginas de barra de título e de painel flutuante do showcase).

## Resumo por sistema

| Sistema | Moldura padrão     | Quem desenha os botões          | Redimensionamento                                        | Menu da janela                        |
| ------- | ------------------ | ------------------------------- | -------------------------------------------------------- | ------------------------------------- |
| Linux   | `gtk-headerless`   | `@oito2/ui` (estilo do desktop) | Bordas CSD do GTK (`undecorated`: `WindowResizeHandles`) | GDK, no clique secundário             |
| Windows | `undecorated`      | `@oito2/ui` (`windows`)         | O sistema                                                | Menu do sistema, no clique secundário |
| macOS   | `native` + Overlay | O sistema (semáforos)           | O sistema                                                | Nenhum                                |

![Barras de título de todos os estilos de controle](../../img/title-bars.png)

<!-- TODO: capture the title bars of the six window control styles side by side -->
