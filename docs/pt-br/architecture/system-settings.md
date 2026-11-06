🌐 [English](../../en/architecture/system-settings.md) | **Português** | 🏠 [Índice](../index.md)

---

# Configurações do sistema

Como um app oito2 descobre o ambiente de desktop, o layout dos botões da janela, a cor de acento e a preferência de alto contraste do sistema em que roda. O trabalho é dividido de propósito: o plugin Rust só **lê** valores brutos, e o pacote TypeScript os **compõe**, então cada regra é uma função pura testada sem a plataforma.

```text
tauri-plugin-oito2-settings        @oito2/ui-settings                       @oito2/ui
  read_raw_settings()  ─ RawSettings ─►  composeSystemSettings(raw, platform)  ─►  SystemScope
  read_settings command                  SystemSettingsScope                        useSystemSettings()
  oito2-settings://changed (Linux)       loadSystemSettings()
```

Para configurar isso em um app, veja o [guia de integração com o desktop](../guides/desktop-integration.md) e o [README do `@oito2/ui-settings`](../../../packages/ui-settings/README.md).

## O que os componentes consomem: `SystemSettings`

Definido em `packages/ui/src/lib/foundation/system-settings.ts`:

| Campo                | Tipo                         | Significado                                  |
| -------------------- | ---------------------------- | -------------------------------------------- |
| `platform`           | `Platform`                   | Sistema operacional e se roda na web         |
| `desktopEnvironment` | `DesktopEnvironment \| null` | O desktop Linux; `null` fora do Linux nativo |
| `windowControlStyle` | `WindowControlStyle`         | A aparência dos botões da janela             |
| `windowButtonLayout` | `WindowButtonLayout`         | Os botões de cada lado, em ordem             |
| `accentColor`        | `string \| null`             | O acento do sistema em hex                   |
| `highContrast`       | `boolean`                    | Se o sistema pede alto contraste             |

O `SystemScope` o fornece; `useSystemSettings()` o lê, recorrendo a `fallbackSystemSettings(Platform.current())` sem escopo. O fallback deriva tudo da plataforma: no Linux nativo o desktop é `unknown` (estilo `gnome`), no Windows o estilo é `windows`, no macOS `macos`, na web e em plataformas de toque `none`; o layout é `WindowButtonLayout.defaultFor(style)` (fechar, minimizar, maximizar no lado inicial no macOS; minimizar, maximizar, fechar no lado final nos demais); sem acento; sem alto contraste.

## `tauri-plugin-oito2-settings` (Rust)

### Comando e evento

| Nome                       | Tipo    | Comportamento                                                                                                                                   |
| -------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `read_settings`            | Comando | Executa `read_raw_settings()` em uma thread bloqueante (`spawn_blocking`) e devolve `RawSettings`                                               |
| `oito2-settings://changed` | Evento  | Só no Linux: emitido com o novo `RawSettings` depois que uma configuração observada muda, e só quando os valores diferem dos últimos informados |

Os erros são serializados como `{ kind, message }`, com `kind` `tauri` ou `unsupported`. O conjunto de permissões padrão `oito2-settings:default` permite `read_settings`; escutar o evento é coberto por `core:default`.

### `RawSettings`

Serializado em camelCase: `xdgCurrentDesktop`, `desktopSession`, `gsettings` (valores por `schema/chave`, uma string ou um booleano), `config` (`kwinButtonsOnLeft`, `kwinButtonsOnRight`, `kdeAccentColor`, `kdeColorScheme`, `xfwmButtonLayout`, `cosmicShowMinimize`, `cosmicShowMaximize`), `systemAccent` (`#RRGGBB` ou `null`) e `systemHighContrast`.

### Fontes no Linux (`platform_linux.rs`, `config.rs`)

| Fonte                                             | O que é lido                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ambiente                                          | `XDG_CURRENT_DESKTOP`, `DESKTOP_SESSION`                                                                                                                                                                                                                                                                                                                         |
| GSettings (pelo GIO)                              | `org.gnome.desktop.wm.preferences/button-layout`, `org.cinnamon.desktop.wm.preferences/button-layout`, `org.mate.Marco.general/button-layout`, `org.gnome.desktop.interface/accent-color`, `org.gnome.desktop.interface/gtk-theme`, `org.gnome.desktop.a11y.interface/high-contrast`. Só schemas e chaves instalados são lidos (o GIO aborta com desconhecidos). |
| Portal XDG do desktop (D-Bus)                     | `org.freedesktop.appearance` `accent-color` (RGB, convertido em `systemAccent`) e `contrast` (`1` define `systemHighContrast`), por `ReadOne` com fallback para `Read`, com timeout de 500 ms                                                                                                                                                                    |
| Arquivos em `XDG_CONFIG_HOME` (senão `~/.config`) | `kwinrc` `[org.kde.kdecoration2]` `ButtonsOnLeft`/`ButtonsOnRight`; `kdeglobals` `[General]` `AccentColor` e `ColorScheme`; `xfce4/xfconf/xfce-perchannel-xml/xfwm4.xml` `button_layout`; `cosmic/com.system76.CosmicTk/v1/show_minimize` e `show_maximize`. Arquivos ausentes deixam seus valores vazios; arquivos acima de 1 MiB são ignorados.                |

**Observadores.** O `init()` os inicia na thread principal, cujo loop do GLib entrega os sinais: um handler `changed` em cada schema do GSettings instalado, monitores de diretório do GIO nas pastas dos arquivos de configuração (pegando escritas no lugar e substituições atômicas) e uma inscrição no sinal `SettingChanged` do portal para `org.freedesktop.appearance`. Rajadas de mudanças passam por debounce e viram uma leitura 150 ms depois da última mudança; a leitura roda em uma thread de trabalho e o evento só é emitido quando o resultado difere do último.

### Fontes no Windows (`platform_windows.rs`)

Pelo Windows Runtime (crate `windows`, `UI::ViewManagement`): o acento por `UISettings::GetColorValue(UIColorType::Accent)` e o alto contraste por `AccessibilitySettings::HighContrast`. Sem evento de mudança.

### Fontes no macOS (`platform_macos.rs`)

Pelo AppKit (`objc2-app-kit`): `NSColor.controlAccentColor` convertido para sRGB, e `NSWorkspace.accessibilityDisplayShouldIncreaseContrast` ("Aumentar contraste"). Sem evento de mudança.

## `@oito2/ui-settings` (TypeScript)

### `composeSystemSettings(raw, platform)`

No **Linux nativo**, o ambiente de desktop vem de `detectDesktopEnvironment` (a primeira entrada reconhecida de `XDG_CURRENT_DESKTOP`, depois `DESKTOP_SESSION`). O resto segue esta matriz, exatamente como implementado em `compose.ts`:

| Ambiente de desktop                                       | Estilo dos controles | Fonte do layout dos botões                                                 | Padrão quando a fonte falta     | Acento                                               | Alto contraste                                                                           |
| --------------------------------------------------------- | -------------------- | -------------------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `kde`                                                     | `breeze`             | `kwinrc` `ButtonsOnLeft` / `ButtonsOnRight`                                | `MS` / `HIAX` (padrões do KWin) | `kdeglobals` `AccentColor`, senão o acento do portal | Contraste do portal, ou `ColorScheme` contendo `contrast`                                |
| `xfce`                                                    | `xfwm`               | `xfwm4.xml` `button_layout`                                                | `O\|SHMC` (padrão do xfwm4)     | Acento nomeado do GNOME, senão o acento do portal    | Contraste do portal, `high-contrast` do GNOME, ou um `gtk-theme` contendo `highcontrast` |
| `cosmic`                                                  | `cosmic`             | Flags `show_minimize` / `show_maximize`; fechar sempre; tudo no lado final | Uma flag ausente mostra o botão | Acento nomeado do GNOME, senão o acento do portal    | Igual ao `xfce`                                                                          |
| `cinnamon`                                                | `gnome`              | GSettings `org.cinnamon.desktop.wm.preferences/button-layout`              | `defaultFor('gnome')`           | Acento nomeado do GNOME, senão o acento do portal    | Igual ao `xfce`                                                                          |
| `mate`                                                    | `gnome`              | GSettings `org.mate.Marco.general/button-layout`                           | `defaultFor('gnome')`           | Acento nomeado do GNOME, senão o acento do portal    | Igual ao `xfce`                                                                          |
| `gnome`, `budgie`, `lxqt`, `pantheon`, `unity`, `unknown` | `gnome`              | GSettings `org.gnome.desktop.wm.preferences/button-layout`                 | `defaultFor('gnome')`           | Acento nomeado do GNOME, senão o acento do portal    | Igual ao `xfce`                                                                          |

"Acento nomeado do GNOME" é `org.gnome.desktop.interface/accent-color` quando ele nomeia um dos nove `accentColors` (`blue`, `teal`…, `slate`); ele é convertido para o hex desse acento.

No **Windows e no macOS** (e em qualquer plataforma que não seja Linux), não há ambiente de desktop, o estilo e o layout são os padrões da plataforma, `accentColor` é `systemAccent` e `highContrast` é `systemHighContrast`.

Os parsers de layout de botões ficam no `@oito2/ui` (`WindowButtonLayout.parseGnome`, `parseKde`, `parseXfwm`); eles pulam tokens desconhecidos e botões repetidos.

### `SystemSettingsScope`

Um `SystemScope` alimentado por um `SettingsSource` (padrão: `tauriSettingsSource` dentro do Tauri, nenhum no navegador):

1. Começa por `initialSettings` ou `fallbackSystemSettings(platform)`.
2. Depois de montado, lê as configurações (`invoke('plugin:oito2-settings|read_settings')`).
3. Escuta `oito2-settings://changed`.
4. Lê de novo sempre que a janela recupera o foco — a única forma de captar mudanças no Windows e no macOS, onde nenhum evento é emitido.

Cada leitura leva um número de geração, então uma leitura lenta nunca sobrescreve uma mais nova. Valores novos que não podem ser compostos, ou que são iguais aos atuais (`sameSystemSettings`), são ignorados; mudanças reais chamam `onSettingsChange`. Uma leitura com falha mantém as configurações atuais.

`loadSystemSettings(options)` faz uma única leitura e resolve para os padrões da plataforma no navegador ou em caso de falha.

## Testes

| O quê                       | Onde                                                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Regras de composição        | `packages/ui-settings/src/lib/compose.test.ts` (Node), com `RawSettings` escritos à mão                                 |
| Detecção, layouts, fallback | `packages/ui/src/lib/foundation/*.test.ts`, comparados com `fixtures/parity/foundation.json` do oito2_ui                |
| O escopo                    | `SystemSettingsScope.svelte.test.ts`, com um `source` falso                                                             |
| Parsers e arquivos em Rust  | `cargo test -p tauri-plugin-oito2-settings` (INI, XML do xfconf, cores do KDE, flags do COSMIC, observação de arquivos) |
| Um desktop real             | `cargo test -p tauri-plugin-oito2-settings -- --ignored --nocapture` imprime o que o plugin lê na máquina               |
