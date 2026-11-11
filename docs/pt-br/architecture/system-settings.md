🌐 [English](../../en/architecture/system-settings.md) | **Português** | 🏠 [Índice](../index.md)

---

# Configurações do sistema

Como um app oito2 descobre o ambiente de desktop, o layout dos botões da janela, a cor de acento, a preferência por claro ou escuro e a preferência de alto contraste do sistema em que roda. O trabalho é dividido de propósito: o plugin Rust só **lê** valores brutos, e o pacote TypeScript os **compõe**, então cada regra é uma função pura testada sem a plataforma.

```text
tauri-plugin-oito2-settings        @oito2/ui-settings                       @oito2/ui
(sobre o oito2_settings)
  read_raw_settings()  ─ RawSettings ─►  composeSystemSettings(raw, platform)  ─►  SystemScope
  read_settings command                  SystemSettingsScope                        useSystemSettings()
  oito2-settings://changed              loadSystemSettings()
```

Para configurar isso em um app, veja o [guia de integração com o desktop](../guides/desktop-integration.md) e o [README do `@oito2/ui-settings`](../../../packages/ui-settings/README.md).

## O que os componentes consomem: `SystemSettings`

Definido em `packages/ui/src/lib/foundation/system-settings.ts`:

| Campo                | Tipo                         | Significado                                                          |
| -------------------- | ---------------------------- | -------------------------------------------------------------------- |
| `platform`           | `Platform`                   | Sistema operacional e se roda na web                                 |
| `desktopEnvironment` | `DesktopEnvironment \| null` | O desktop Linux; `null` fora do Linux nativo                         |
| `windowControlStyle` | `WindowControlStyle`         | A aparência dos botões da janela                                     |
| `windowButtonLayout` | `WindowButtonLayout`         | Os botões de cada lado, em ordem                                     |
| `accentColor`        | `string \| null`             | O acento do sistema em hex                                           |
| `colorScheme`        | `Brightness \| null`         | O esquema claro ou escuro que o sistema pede; `null` sem preferência |
| `highContrast`       | `boolean`                    | Se o sistema pede alto contraste                                     |

O `SystemScope` o fornece; `useSystemSettings()` o lê, recorrendo a `fallbackSystemSettings(Platform.current())` sem escopo. O fallback deriva tudo da plataforma: no Linux nativo o desktop é `unknown` (estilo `gnome`), no Windows o estilo é `windows`, no macOS `macos`, na web e em plataformas de toque `none`; o layout é `WindowButtonLayout.defaultFor(style)` (fechar, minimizar, maximizar no lado inicial no macOS; minimizar, maximizar, fechar no lado final nos demais); sem acento; sem preferência de esquema de cores; sem alto contraste.

## `tauri-plugin-oito2-settings` (Rust)

O plugin é uma camada fina do Tauri sobre o crate [`oito2_settings`](https://docs.rs/oito2_settings) do [oito2_rs](https://github.com/oito2/oito2_rs), que as outras interfaces Rust do OITO2 compartilham. O crate guarda todos os leitores e observadores de cada plataforma; o plugin só os expõe ao webview e reexporta `read_raw_settings`, `RawSettings`, `ConfigValues`, `SettingValue`, `ColorScheme`, `Error` e `Result`.

### Comando e evento

| Nome                       | Tipo    | Comportamento                                                                                                                 |
| -------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `read_settings`            | Comando | Executa `read_raw_settings()` em uma thread bloqueante (`spawn_blocking`) e devolve `RawSettings`                             |
| `oito2-settings://changed` | Evento  | Emitido com o novo `RawSettings` depois que uma configuração observada muda, e só quando os valores diferem dos últimos lidos |

O `init()` inicia o `oito2_settings::watch` em uma thread própria quando o app começa (o observador lê as configurações uma vez antes de retornar) e guarda o observador no estado do app enquanto ele roda. A observação funciona no Linux, no Windows e no macOS; no macOS as notificações chegam pelo run loop principal do app, que todo app Tauri roda. Quando o observador não consegue iniciar, o plugin escreve o motivo no stderr e o app continua funcionando sem eventos de mudança.

Os erros são serializados como `{ kind, message }`, com `kind` `unsupported` ou `internal`. O conjunto de permissões padrão `oito2-settings:default` permite `read_settings`; escutar o evento é coberto por `core:default`.

### `RawSettings`

Serializado em camelCase: `xdgCurrentDesktop`, `desktopSession`, `gsettings` (valores por `schema/chave`, uma string ou um booleano), `config` (`kwinButtonsOnLeft`, `kwinButtonsOnRight`, `kdeAccentColor`, `kdeColorScheme`, `kdeLookAndFeelPackage`, `xfwmButtonLayout`, `cosmicShowMinimize`, `cosmicShowMaximize`, `cosmicIsDark`), `systemAccent` (`#RRGGBB` ou `null`), `systemHighContrast` e `colorScheme` (`light`, `dark` ou `null`). Um plugin anterior a esses campos omite `colorScheme`, `kdeLookAndFeelPackage` e `cosmicIsDark`; o `@oito2/ui-settings` os lê como `null`.

### Fontes

O que cada plataforma lê (ambiente, GSettings, o portal XDG e os arquivos de configuração no Linux; o Windows Runtime no Windows; o AppKit no macOS) e como cada fonte é observada está documentado junto do crate: [fontes das configurações](https://github.com/oito2/oito2_rs/blob/main/docs/pt-br/reference/settings-sources.md), [leitores](https://github.com/oito2/oito2_rs/blob/main/docs/pt-br/architecture/readers.md), [observadores](https://github.com/oito2/oito2_rs/blob/main/docs/pt-br/architecture/watchers.md) e o [contrato JSON](https://github.com/oito2/oito2_rs/blob/main/docs/pt-br/reference/json-contract.md).

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

O **esquema de cores** é o `colorScheme` do `RawSettings` (o portal de configurações no Linux) quando ele é `light` ou `dark`. Quando o portal não declara preferência, decide o armazenamento próprio de cada desktop Linux, como no `oito2_foundation`:

| Ambiente de desktop                                                   | Esquema de cores sem preferência do portal                                                                           |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `kde`                                                                 | `dark` quando `kdeColorScheme` (senão `kdeLookAndFeelPackage`) contém `dark`, senão `null`                           |
| `cosmic`                                                              | `cosmicIsDark`: `dark` quando `true`, `light` quando `false`, `null` quando ausente                                  |
| `xfce`, `lxqt`                                                        | `null`: não há armazenamento além do portal                                                                          |
| `gnome`, `budgie`, `cinnamon`, `mate`, `pantheon`, `unity`, `unknown` | GSettings `org.gnome.desktop.interface/color-scheme`: `prefer-dark` → `dark`, `prefer-light` → `light`, senão `null` |

No **Windows e no macOS** (e em qualquer plataforma que não seja Linux), não há ambiente de desktop, o estilo e o layout são os padrões da plataforma, `accentColor` é `systemAccent`, `colorScheme` é o `colorScheme` do `RawSettings` e `highContrast` é `systemHighContrast`.

Os parsers de layout de botões ficam no `@oito2/ui` (`WindowButtonLayout.parseGnome`, `parseKde`, `parseXfwm`); eles pulam tokens desconhecidos e botões repetidos.

### `SystemSettingsScope`

Um `SystemScope` alimentado por um `SettingsSource` (padrão: `tauriSettingsSource` dentro do Tauri, nenhum no navegador):

1. Começa por `initialSettings` ou `fallbackSystemSettings(platform)`.
2. Depois de montado, lê as configurações (`invoke('plugin:oito2-settings|read_settings')`).
3. Escuta `oito2-settings://changed`.
4. Lê de novo sempre que a janela recupera o foco, o que também capta mudanças feitas enquanto o observador do plugin não pôde iniciar.

Cada leitura leva um número de geração, então uma leitura lenta nunca sobrescreve uma mais nova. Valores novos que não podem ser compostos, ou que são iguais aos atuais (`sameSystemSettings`), são ignorados; mudanças reais chamam `onSettingsChange`. Uma leitura com falha mantém as configurações atuais.

`loadSystemSettings(options)` faz uma única leitura e resolve para os padrões da plataforma no navegador ou em caso de falha.

## Testes

| O quê                           | Onde                                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Regras de composição            | `packages/ui-settings/src/lib/compose.test.ts` (Node), com `RawSettings` escritos à mão, esquema de cores incluído |
| Detecção, layouts, fallback     | `packages/ui/src/lib/foundation/*.test.ts`, comparados com `fixtures/parity/foundation.json` do oito2_ui           |
| O escopo                        | `SystemSettingsScope.svelte.test.ts`, com um `source` falso                                                        |
| Contrato JSON do plugin         | `cargo test -p tauri-plugin-oito2-settings` (campos camelCase do `RawSettings`, tipos de erro)                     |
| Leitores, parsers, observadores | Os testes do `oito2_settings` no oito2_rs                                                                          |
| Um desktop real                 | `cargo test -p tauri-plugin-oito2-settings -- --ignored --nocapture` imprime o que o plugin lê na máquina          |
