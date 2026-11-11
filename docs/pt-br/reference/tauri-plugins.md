🌐 [English](../../en/reference/tauri-plugins.md) | **Português** | 🏠 [Índice](../index.md)

---

# Plugins Tauri

Os dois plugins Rust do repositório, `tauri-plugin-oito2-window` e `tauri-plugin-oito2-settings`: as suas funções de inicialização, comandos, permissões, eventos, erros e as funções TypeScript que os chamam. Ambos são compilados com o `tauri` 2.12, exigem Rust 1.90 ou mais recente e são adicionados a partir do repositório:

```toml
[dependencies]
tauri-plugin-oito2-window = { git = "https://github.com/oito2/oito2_uikit", tag = "v0.1.0" }
tauri-plugin-oito2-settings = { git = "https://github.com/oito2/oito2_uikit", tag = "v0.1.0" }
```

## Índice

- [tauri-plugin-oito2-window](#tauri-plugin-oito2-window)
- [tauri-plugin-oito2-settings](#tauri-plugin-oito2-settings)
- [Erros](#erros)

## tauri-plugin-oito2-window

Define a moldura de cada janela e mostra o menu nativo da janela. Código-fonte: [`plugins/tauri-plugin-oito2-window`](../../../plugins/tauri-plugin-oito2-window).

### Inicialização

```rust
tauri::Builder::default().plugin(tauri_plugin_oito2_window::init())
```

`init()` registra o plugin como `oito2-window` e gerencia um `DecorationState` (o modo aplicado a cada janela, por rótulo). O plugin não emite eventos.

### Comandos

Cada comando age sobre a janela que o chamou. Nome de invocação: `plugin:oito2-window|<command>`.

| Comando               | Argumentos                                                                   | Retorno          | Comportamento                                                                                                                                                                                                                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `set_decoration_mode` | `mode`: `"native"`, `"undecorated"` ou `"gtk-headerless"`                    | `null`           | Aplica o modo na thread principal e resolve quando ele foi aplicado. Chame-o com a janela oculta: no Linux ele rejeita com `unsupported: window already visible` caso contrário, e com qualquer outro erro ao aplicar                                                                                         |
| `decoration_mode`     | —                                                                            | `DecorationMode` | O modo aplicado pelo plugin; senão, `native` ou `undecorated`, conforme a janela tenha ou não moldura do sistema                                                                                                                                                                                              |
| `show_window_menu`    | `x`, `y`: números, pixels CSS a partir do canto superior esquerdo do webview | `null`           | Mostra o menu nativo da janela na thread principal e resolve quando ele foi mostrado. Rejeita com `invalidInput` se algum não for finito ou estiver fora de 0 a 100 000; `unsupported` no macOS, quando o gerenciador de janelas não tem menu de janela (Linux) ou a janela não tem menu do sistema (Windows) |

### Permissões

| Identificador                            | Descrição                                                                                                                                                                       |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `oito2-window:default`                   | Conjunto padrão: `allow-set-decoration-mode`, `allow-decoration-mode`, `allow-show-window-menu` — "Lets the window set its own frame, read it and show its native window menu." |
| `oito2-window:allow-set-decoration-mode` | Habilita o comando `set_decoration_mode`                                                                                                                                        |
| `oito2-window:deny-set-decoration-mode`  | Nega o comando `set_decoration_mode`                                                                                                                                            |
| `oito2-window:allow-decoration-mode`     | Habilita o comando `decoration_mode`                                                                                                                                            |
| `oito2-window:deny-decoration-mode`      | Nega o comando `decoration_mode`                                                                                                                                                |
| `oito2-window:allow-show-window-menu`    | Habilita o comando `show_window_menu`                                                                                                                                           |
| `oito2-window:deny-show-window-menu`     | Nega o comando `show_window_menu`                                                                                                                                               |

Nenhuma tem escopo. A referência gerada é [`permissions/autogenerated/reference.md`](../../../plugins/tauri-plugin-oito2-window/permissions/autogenerated/reference.md). As ações de janela das barras de título passam por `@tauri-apps/api` e também precisam de permissões do core: `core:window:allow-minimize`, `core:window:allow-toggle-maximize`, `core:window:allow-close`, `core:window:allow-start-dragging` e `core:window:allow-start-resize-dragging`.

### API Rust

| Item                                         | Finalidade                                                                                                                                                                                                                                                                                                    |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `init()`                                     | Cria o plugin                                                                                                                                                                                                                                                                                                 |
| `DecorationMode`, `ParseDecorationModeError` | Reexportados do [`oito2_foundation`](https://docs.rs/oito2_foundation): `Native`, `Undecorated`, `GtkHeaderless`; serializado em kebab-case; `platform_default()`, `as_str()`, `FromStr` (sem diferenciar maiúsculas, aceita também `gtkheaderless`); um `ParseDecorationModeError` vira `Error::Unsupported` |
| `apply_decoration_mode(&window, mode)`       | Aplica um modo a uma `WebviewWindow` e o registra; precisa rodar na thread principal antes de a janela aparecer (no Linux uma janela visível é recusada com `Unsupported`). Trocar de modo desfaz o que o anterior alterou                                                                                    |
| `show_window_menu(&window, x, y)`            | Mostra o menu nativo da janela; precisa rodar na thread principal (o comando faz isso com `run_on_main_thread`). No Windows retorna quando o menu fecha                                                                                                                                                       |
| `window_menu_supported()`                    | Se a plataforma tem um menu da janela (`oito2_foundation::window_menu::supported`)                                                                                                                                                                                                                            |
| `DecorationState`                            | O mapa gerenciado de rótulo da janela para modo (`record`, `get`, `forget`); uma janela destruída é esquecida                                                                                                                                                                                                 |
| `Error`, `Result`                            | O tipo de erro serializável                                                                                                                                                                                                                                                                                   |

| Plataforma | `platform_default()` | `gtk-headerless`                                                   | Menu da janela                                                              |
| ---------- | -------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| Linux      | `gtk-headerless`     | Decorações do lado do cliente do GTK com uma barra de título vazia | O do GTK; falha quando o gerenciador de janelas não tem um                  |
| Windows    | `undecorated`        | Cai para nenhuma moldura do sistema                                | O menu do sistema (Restaurar, Mover, Tamanho, Minimizar, Maximizar, Fechar) |
| macOS      | `native`             | Cai para nenhuma moldura do sistema                                | Nenhum (`unsupported`)                                                      |

### Funções TypeScript (`@oito2/ui-window`)

| Função                              | Chama                                                                                                       | Observações                                                                                                                                                                                                                                          |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `setDecorationMode(mode)`           | `plugin:oito2-window\|set_decoration_mode`                                                                  | `{ mode }`                                                                                                                                                                                                                                           |
| `decorationMode()`                  | `plugin:oito2-window\|decoration_mode`                                                                      | Resolve para `'native' \| 'undecorated' \| 'gtk-headerless'`                                                                                                                                                                                         |
| `showWindowMenu(x, y)`              | `plugin:oito2-window\|show_window_menu`                                                                     | `{ x, y }`                                                                                                                                                                                                                                           |
| `initWindow(options)`               | `setDecorationMode` quando `decorations` é informado, senão `decorationMode`, mais `@tauri-apps/api/window` | Devolve um `NativeWindowController`, ou `null` fora do Tauri ou quando `options.signal` é abortado antes; o mesmo controlador enquanto houver um vivo para a janela; rejeita com uma mensagem clara quando o plugin ou a sua permissão está faltando |
| `NativeWindowController.showMenu()` | `showWindowMenu`                                                                                            | Só quando `state.canShowMenu` (Linux e Windows); sem posição, na última posição do ponteiro                                                                                                                                                          |
| `CommandError`, `isCommandError`    | —                                                                                                           | A rejeição `{ kind, message }` dos comandos do plugin e o seu type guard                                                                                                                                                                             |

## tauri-plugin-oito2-settings

Lê as configurações do sistema às quais um app oito2 se adapta e as informa como valores brutos; `@oito2/ui-settings` as transforma nas `SystemSettings` de `@oito2/ui`. Código-fonte: [`plugins/tauri-plugin-oito2-settings`](../../../plugins/tauri-plugin-oito2-settings).

### Inicialização

```rust
tauri::Builder::default().plugin(tauri_plugin_oito2_settings::init())
```

`init()` registra o plugin como `oito2-settings` e começa a vigiar as configurações (Linux, Windows e macOS) em uma thread própria. Os leitores e observadores vêm do crate [`oito2_settings`](https://docs.rs/oito2_settings) do oito2_rs, que o plugin reexporta (`read_raw_settings`, `RawSettings`, `ConfigValues`, `SettingValue`, `ColorScheme`, `Error`, `Result`).

### Comando

| Comando         | Argumentos | Retorno       | Comportamento                                                                                                                 |
| --------------- | ---------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `read_settings` | —          | `RawSettings` | Lê as configurações da plataforma em execução numa thread de trabalho bloqueante; rejeita com `internal` se essa thread parar |

Nome de invocação: `plugin:oito2-settings|read_settings`.

`RawSettings`, serializado em camelCase:

| Campo                | Tipo                         | Conteúdo                                                                     |
| -------------------- | ---------------------------- | ---------------------------------------------------------------------------- |
| `xdgCurrentDesktop`  | string ou `null`             | `XDG_CURRENT_DESKTOP`                                                        |
| `desktopSession`     | string ou `null`             | `DESKTOP_SESSION`                                                            |
| `gsettings`          | objeto de string ou booleano | Valores do GSettings por `schema/key`, para os esquemas instalados           |
| `config`             | `ConfigValues`               | Valores de `kwinrc`, `kdeglobals`, `xfwm4.xml` e das configurações do COSMIC |
| `systemAccent`       | string ou `null`             | O destaque do toolkit ou do sistema como `#RRGGBB`                           |
| `systemHighContrast` | booleano                     | Se o sistema pede alto contraste                                             |
| `colorScheme`        | `light`, `dark` ou `null`    | O esquema que o sistema pede; `null` quando ele não declara preferência      |

As chaves do GSettings lidas no Linux são `button-layout` de `org.gnome.desktop.wm.preferences`, `org.cinnamon.desktop.wm.preferences` e `org.mate.Marco.general`, `accent-color`, `gtk-theme` e `color-scheme` de `org.gnome.desktop.interface`, e `high-contrast` de `org.gnome.desktop.a11y.interface`.

Campos de `ConfigValues` (cada um `null` quando ausente): `kwinButtonsOnLeft`, `kwinButtonsOnRight`, `kdeAccentColor`, `kdeColorScheme`, `kdeLookAndFeelPackage`, `xfwmButtonLayout`, `cosmicShowMinimize`, `cosmicShowMaximize`, `cosmicIsDark`.

O `@oito2/ui-settings` compõe `colorScheme`, `kdeLookAndFeelPackage` e `cosmicIsDark` em `SystemSettings.colorScheme` e os lê como `null` quando um plugin mais antigo os omite.

### Evento

| Evento                     | Carga         | Quando                                                                            |
| -------------------------- | ------------- | --------------------------------------------------------------------------------- |
| `oito2-settings://changed` | `RawSettings` | Quando uma configuração vigiada muda e os novos valores diferem dos últimos lidos |

Para escutá-lo basta `core:default` (as permissões de evento do core). O `SystemSettingsScope` também lê de novo quando a janela recupera o foco, então uma configuração alterada enquanto o observador não pôde iniciar é percebida nesse momento.

### Permissões

| Identificador                        | Descrição                                                                                                                                                |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `oito2-settings:default`             | Conjunto padrão: `allow-read-settings` — "Lets the webview read the system settings (desktop session, window button layout, accent color and contrast)." |
| `oito2-settings:allow-read-settings` | Habilita o comando `read_settings`                                                                                                                       |
| `oito2-settings:deny-read-settings`  | Nega o comando `read_settings`                                                                                                                           |

A referência gerada é [`permissions/autogenerated/reference.md`](../../../plugins/tauri-plugin-oito2-settings/permissions/autogenerated/reference.md).

### API Rust

| Item                                                         | Finalidade                                              |
| ------------------------------------------------------------ | ------------------------------------------------------- |
| `init()`                                                     | Cria o plugin                                           |
| `read_raw_settings()`                                        | Lê as configurações da plataforma em execução           |
| `CHANGED_EVENT`                                              | `"oito2-settings://changed"`                            |
| `RawSettings`, `ConfigValues`, `SettingValue`, `ColorScheme` | Os valores informados, reexportados do `oito2_settings` |
| `Error`, `Result`                                            | O tipo de erro serializável do `oito2_settings`         |

### Funções TypeScript (`@oito2/ui-settings`)

| Export                                            | Chama                                                   | Observações                                                                                         |
| ------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `tauriSettingsSource.read()`                      | `plugin:oito2-settings\|read_settings`                  | Resolve para `RawSettings`; lança um `TypeError` quando o payload tem outra forma (`isRawSettings`) |
| `tauriSettingsSource.subscribe(fn)`               | `listen('oito2-settings://changed')`                    | Resolve para uma função que para de escutar                                                         |
| `settingsChangedEvent`                            | —                                                       | O nome do evento                                                                                    |
| `loadSystemSettings(options)`                     | `source.read()` e depois `composeSystemSettings`        | Cai para `fallbackSystemSettings` fora do Tauri ou quando a leitura falha                           |
| `SystemSettingsScope`                             | `read()` ao montar e ao recuperar o foco, `subscribe()` | Fornece as configurações compostas por meio de `SystemScope`                                        |
| `composeSystemSettings(raw, platform)`            | —                                                       | Pura: valores brutos para `SystemSettings`                                                          |
| `emptyRawSettings`                                | —                                                       | Um `RawSettings` sem nada lido, para testes                                                         |
| `isRawSettings`, `CommandError`, `isCommandError` | —                                                       | O guard do payload, e a rejeição `{ kind, message }` com o seu type guard                           |

## Erros

Um comando que falha rejeita com `{ kind, message }`, tipado como `CommandError` em `@oito2/ui-window` e `@oito2/ui-settings` (`isCommandError` estreita uma rejeição desconhecida). As mensagens não citam caminhos da máquina do usuário:

| Plugin           | Valores de `kind`                      |
| ---------------- | -------------------------------------- |
| `oito2-window`   | `tauri`, `unsupported`, `invalidInput` |
| `oito2-settings` | `unsupported`, `internal`              |

## Veja também

- [Integração com o desktop](../guides/desktop-integration.md) — os dois plugins num app.
- [Chrome da janela](../architecture/window-chrome.md) e [Configurações do sistema](../architecture/system-settings.md) — o funcionamento interno.
- Os READMEs dos plugins: [janela](../../../plugins/tauri-plugin-oito2-window/README.md), [configurações](../../../plugins/tauri-plugin-oito2-settings/README.md).
