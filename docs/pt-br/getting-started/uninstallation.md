🌐 [English](../../en/getting-started/uninstallation.md) | **Português** | 🏠 [Índice](../index.md)

---

# Desinstalação

Como remover as bibliotecas do oito2_uikit de um app, e como remover o showcase e os dados que ele deixa no sistema.

## Removendo as bibliotecas de um app

As bibliotecas não instalam nada fora do seu projeto. Desfaça os passos da [Instalação](./installation.md#adicionando-as-bibliotecas-a-um-app):

1. **Pacotes npm** — remova os que você adicionou:

   ```bash
   pnpm remove @oito2/ui @oito2/ui-themes @oito2/ui-syntax @oito2/ui-extras @oito2/ui-files @oito2/ui-window @oito2/ui-settings
   ```

   Depois, apague dos seus fontes as importações de módulos e folhas de estilo `@oito2/*` (`@oito2/ui/styles.css`, `@oito2/ui-syntax/fonts.css`).

2. **Plugins Rust** — apague as linhas `tauri-plugin-oito2-window` e `tauri-plugin-oito2-settings` de `src-tauri/Cargo.toml`, ou execute:

   ```bash
   cargo remove --manifest-path src-tauri/Cargo.toml tauri-plugin-oito2-window tauri-plugin-oito2-settings
   ```

3. **Registro dos plugins** — em `src-tauri/src/lib.rs`, apague `.plugin(tauri_plugin_oito2_window::init())`, `.plugin(tauri_plugin_oito2_settings::init())` e qualquer chamada a `apply_decoration_mode` no `setup`. Garanta que a janela continue ficando visível: se ela foi configurada com `"visible": false`, volte para `true` ou mantenha um `window.show()`.

4. **Capabilities** — remova `oito2-window:default` e `oito2-settings:default` (ou as permissões individuais `oito2-window:*` / `oito2-settings:*`) de `src-tauri/capabilities/*.json`. Sem os crates, esses identificadores de permissão deixam de existir e a compilação falha enquanto ainda estiverem listados. Remova também as permissões `core:window:*`, `dialog:*` e `fs:*` se nada mais no app as usar.

5. **Configurações de janela por plataforma** — se você copiou o `tauri.linux.conf.json` (`"transparent": true`) ou o `tauri.macos.conf.json` (`"titleBarStyle": "Overlay"`, `"hiddenTitle": true`, `trafficLightPosition`) do showcase, reverta-os: sem a barra de título do oito2, uma barra de título sobreposta no macOS deixa o conteúdo sob os botões nativos.

## Removendo o showcase

### Linux

Os pacotes `.deb` e `.rpm` se chamam `oito2-uikit-showcase` (o nome do produto em kebab case):

```bash
# Debian, Ubuntu, Linux Mint, Zorin OS
sudo apt remove oito2-uikit-showcase

# Fedora
sudo dnf remove oito2-uikit-showcase
```

O AppImage não é instalado: apague o arquivo `oito2-uikit-showcase-X.Y.Z-linux-amd64.AppImage`.

### Windows

Abra **Configurações** → **Aplicativos** → **Aplicativos instalados** (no Windows 10, **Configurações** → **Aplicativos** → **Aplicativos e recursos**), encontre **oito2_uikit Showcase** e escolha **Desinstalar**. Isso vale tanto para o instalador `-setup.exe` quanto para o `.msi`.

### macOS

Feche o app e arraste **oito2_uikit Showcase** de **Aplicativos** para o Lixo; depois, esvazie o Lixo.

## Dados deixados para trás

O showcase guarda suas configurações (tema, destaque, idioma, densidade...) no `localStorage` do webview. O webview os armazena, com seus caches, em uma pasta com o nome do identificador do app, `io.github.oito2.uikit-showcase`. Desinstalar o app não a remove; apague-a manualmente:

| SO      | Pasta                                                                                                 |
| ------- | ----------------------------------------------------------------------------------------------------- |
| Linux   | `~/.local/share/io.github.oito2.uikit-showcase` (`$XDG_DATA_HOME/io.github.oito2.uikit-showcase`)     |
| Windows | `%LOCALAPPDATA%\io.github.oito2.uikit-showcase`                                                       |
| macOS   | `~/Library/WebKit/io.github.oito2.uikit-showcase` e `~/Library/Caches/io.github.oito2.uikit-showcase` |

```bash
# Linux
rm -rf ~/.local/share/io.github.oito2.uikit-showcase

# macOS
rm -rf ~/Library/WebKit/io.github.oito2.uikit-showcase ~/Library/Caches/io.github.oito2.uikit-showcase
```

```powershell
# Windows
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\io.github.oito2.uikit-showcase"
```

Executar o showcase a partir do código-fonte (`pnpm tauri dev`) usa as mesmas pastas.

### Removendo um checkout do código-fonte

Se você compilou o showcase a partir do código-fonte, apagar a pasta do repositório remove tudo o que a compilação gerou (`node_modules/`, `target/`, `build/`, `.svelte-kit/`). A toolchain do rustup, o Node.js, o pnpm e os pacotes de sistema dos [pré-requisitos](./prerequisites.md) continuam instalados; remova-os com as próprias ferramentas se nada mais os usar. O Playwright guarda seus navegadores em uma pasta de cache própria (`~/.cache/ms-playwright` no Linux); `pnpm exec playwright uninstall --all` os remove.
