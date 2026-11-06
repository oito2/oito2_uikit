🌐 [English](../../en/getting-started/installation.md) | **Português** | 🏠 [Índice](../index.md)

---

# Instalação

Esta página cobre três coisas: adicionar as bibliotecas do oito2_uikit ao seu app, instalar o showcase a partir de uma release e compilar o showcase a partir do código-fonte. Instale os [pré-requisitos](./prerequisites.md) antes.

## Índice

- [Sistemas suportados](#sistemas-suportados)
- [Adicionando as bibliotecas a um app](#adicionando-as-bibliotecas-a-um-app)
- [Linux](#linux)
- [Windows](#windows)
- [macOS](#macos)
- [Onde cada pacote é gerado](#onde-cada-pacote-é-gerado)
- [Verificando um download](#verificando-um-download)

## Sistemas suportados

| SO      | Status    | Versão mínima / distribuições                                         | WebView                |
| ------- | --------- | --------------------------------------------------------------------- | ---------------------- |
| Linux   | Suportado | Ubuntu 22.04+, Debian 12+, Linux Mint 21+, Zorin OS 17+, Fedora atual | WebKitGTK 2.50+        |
| Windows | Suportado | Windows 10 22H2 e Windows 11                                          | WebView2 (Evergreen)   |
| macOS   | Suportado | macOS 14 Sonoma e posteriores                                         | WKWebView (Safari 26+) |

Android e iOS não são suportados. Os pacotes Svelte também rodam em um navegador, que é como o [showcase web](https://oito2.github.io/oito2_uikit/) é gerado.

## Adicionando as bibliotecas a um app

Estes passos são os mesmos no Linux, no Windows e no macOS. Todos os pacotes npm e os dois crates Rust compartilham uma única versão; mantenha-os na mesma release.

### 1. Pacotes npm

`@oito2/ui` é o único pacote obrigatório; ele precisa do `svelte` 5 (`^5.57.0`) como dependência peer.

```bash
pnpm add @oito2/ui
```

Adicione os pacotes opcionais que você usar:

| Pacote               | Adiciona                                                                            | Lado Rust                                |
| -------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------- |
| `@oito2/ui-themes`   | Os 13 presets de cor nomeados                                                       | —                                        |
| `@oito2/ui-syntax`   | Realce de sintaxe e um bloco de código                                              | —                                        |
| `@oito2/ui-extras`   | Código QR, campo de assinatura, recorte de imagem, menu de navegação                | —                                        |
| `@oito2/ui-files`    | Upload de arquivos, área de soltar e download                                       | `tauri-plugin-dialog`, `tauri-plugin-fs` |
| `@oito2/ui-window`   | O controlador de janela das barras de título                                        | `tauri-plugin-oito2-window`              |
| `@oito2/ui-settings` | As configurações reais do sistema (desktop, layout dos botões, destaque, contraste) | `tauri-plugin-oito2-settings`            |

### 2. Estilos e fontes

Importe a folha de estilos uma vez, no layout raiz. Ela traz a fonte Inter (empacotada com o pacote), os tokens, os tamanhos de densidade e os estilos base:

```ts
import '@oito2/ui/styles.css';
```

O `@oito2/ui-syntax` distribui sua fonte monoespaçada (JetBrains Mono) à parte: `import '@oito2/ui-syntax/fonts.css';`. Depois, envolva o app em um `ThemeProvider` — veja o [Início rápido](./quickstart.md).

### 3. Plugins Rust

Os dois plugins não estão no crates.io. Adicione-os a partir do repositório, fixados na tag da release, em `src-tauri/Cargo.toml`:

```toml
[dependencies]
tauri-plugin-oito2-window = { git = "https://github.com/oito2/oito2_uikit", tag = "v0.1.0" }
tauri-plugin-oito2-settings = { git = "https://github.com/oito2/oito2_uikit", tag = "v0.1.0" }
```

Eles são compilados contra o `tauri` 2.12 e precisam do Rust 1.90 ou posterior. Registre-os em `src-tauri/src/lib.rs`:

```rust
tauri::Builder::default()
    .plugin(tauri_plugin_oito2_window::init())
    .plugin(tauri_plugin_oito2_settings::init())
```

Para o `@oito2/ui-files`, adicione e registre também os plugins oficiais `tauri-plugin-dialog` e `tauri-plugin-fs` (com seus pacotes `@tauri-apps/plugin-*` no mesmo major.minor).

### 4. Capabilities

Conceda as permissões à janela em um arquivo de capability (`src-tauri/capabilities/default.json`). Esta é a capability do showcase, que usa tudo:

```json
{
	"$schema": "../gen/schemas/desktop-schema.json",
	"identifier": "main-capability",
	"windows": ["main"],
	"permissions": [
		"core:default",
		"core:window:allow-minimize",
		"core:window:allow-toggle-maximize",
		"core:window:allow-close",
		"core:window:allow-start-dragging",
		"core:window:allow-start-resize-dragging",
		"oito2-window:default",
		"oito2-settings:default",
		"dialog:allow-open",
		"dialog:allow-save",
		"fs:allow-stat",
		"fs:allow-read-file",
		"fs:allow-write-file"
	]
}
```

| Permissões                                                                                              | Necessárias para                                                             |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `core:window:allow-minimize`, `-toggle-maximize`, `-close`, `-start-dragging`, `-start-resize-dragging` | Os controles de janela, o arrasto e o redimensionamento das barras de título |
| `oito2-window:default` (`allow-set-decoration-mode`, `allow-decoration-mode`, `allow-show-window-menu`) | `@oito2/ui-window`                                                           |
| `oito2-settings:default` (`allow-read-settings`)                                                        | `@oito2/ui-settings`                                                         |
| `dialog:allow-open`, `dialog:allow-save`, `fs:allow-stat`, `fs:allow-read-file`, `fs:allow-write-file`  | `@oito2/ui-files`                                                            |

Conceda apenas o que o seu app usa. As opções de `initWindow()` que alteram a janela precisam de mais permissões (listadas no [README do `@oito2/ui-window`](../../../packages/ui-window/README.md)). Os detalhes de cada pacote estão no seu README: [`@oito2/ui`](../../../packages/ui/README.md), [`@oito2/ui-window`](../../../packages/ui-window/README.md), [`@oito2/ui-settings`](../../../packages/ui-settings/README.md), [`@oito2/ui-files`](../../../packages/ui-files/README.md), [`tauri-plugin-oito2-window`](../../../plugins/tauri-plugin-oito2-window/README.md), [`tauri-plugin-oito2-settings`](../../../plugins/tauri-plugin-oito2-settings/README.md).

## Linux

### Dependência de execução

Apps Tauri precisam do runtime do WebKitGTK 4.1: `libwebkit2gtk-4.1-0` (Debian/Ubuntu) ou `webkit2gtk4.1` (Fedora). Os pacotes `.deb` e `.rpm` do showcase o declaram, então o gerenciador de pacotes o instala junto.

### Instalando o showcase

Baixe o arquivo do seu sistema na [última release](https://github.com/oito2/oito2_uikit/releases/latest), junto com o `SHA256SUMS`, e [verifique-o](#verificando-um-download). As versões para Linux são para x86-64 e são compiladas no Ubuntu 22.04, o sistema mais antigo da base suportada.

| Arquivo                                           | Para                                            |
| ------------------------------------------------- | ----------------------------------------------- |
| `oito2-uikit-showcase-X.Y.Z-linux-amd64.deb`      | Debian, Ubuntu, Linux Mint, Zorin OS            |
| `oito2-uikit-showcase-X.Y.Z-linux-x86_64.rpm`     | Fedora                                          |
| `oito2-uikit-showcase-X.Y.Z-linux-amd64.AppImage` | Qualquer distribuição suportada, sem instalação |

```bash
# Debian, Ubuntu, Linux Mint, Zorin OS
sudo apt install ./oito2-uikit-showcase-X.Y.Z-linux-amd64.deb

# Fedora
sudo dnf install ./oito2-uikit-showcase-X.Y.Z-linux-x86_64.rpm

# AppImage
chmod +x oito2-uikit-showcase-X.Y.Z-linux-amd64.AppImage
./oito2-uikit-showcase-X.Y.Z-linux-amd64.AppImage
```

Os pacotes `.deb` e `.rpm` instalam o binário `oito2-uikit-showcase` em `/usr/bin` e adicionam o app ao menu de aplicativos como **oito2_uikit Showcase**. O AppImage precisa do FUSE 2; veja [Solução de problemas](../troubleshooting/common-issues.md#appimage-não-inicia-fuse).

### Compilando o showcase a partir do código-fonte

```bash
git clone https://github.com/oito2/oito2_uikit.git
cd oito2_uikit
corepack enable
pnpm install
pnpm build
pnpm tauri build --bundles deb,rpm,appimage
```

O `pnpm build` compila as bibliotecas que o showcase consome; o `pnpm tauri build` então compila o app web do showcase (seu `beforeBuildCommand`), o binário Rust e os pacotes. O diretório de saída do workspace Cargo fica na raiz do repositório:

| Pacote   | Saída                             |
| -------- | --------------------------------- |
| deb      | `target/release/bundle/deb/`      |
| rpm      | `target/release/bundle/rpm/`      |
| AppImage | `target/release/bundle/appimage/` |

Sem `--bundles`, o `pnpm tauri build` gera todos os tipos de pacote do SO atual (`"targets": "all"` em `tauri.conf.json`). Adicione `--debug` para uma compilação de depuração mais rápida (`pnpm tauri build --debug --bundles deb` grava em `target/debug/bundle/`). Execute `pnpm tauri dev` para iniciar o showcase sem empacotar.

## Windows

### Dependência de execução

WebView2 (Evergreen), presente no Windows 10 22H2 e no Windows 11.

### Instalando o showcase

Baixe um instalador na [última release](https://github.com/oito2/oito2_uikit/releases/latest), junto com o `SHA256SUMS`, e [verifique-o](#verificando-um-download):

| Arquivo                                            | Instalador                  |
| -------------------------------------------------- | --------------------------- |
| `oito2-uikit-showcase-X.Y.Z-windows-x64-setup.exe` | Programa de instalação NSIS |
| `oito2-uikit-showcase-X.Y.Z-windows-x64.msi`       | Pacote do Windows Installer |

Execute o instalador e siga os passos. Os instaladores **não são assinados digitalmente**, então o Microsoft Defender SmartScreen pode mostrar **"O Windows protegeu o computador"**. Depois de conferir o checksum, escolha **Mais informações** → **Executar assim mesmo**.

### Compilando o showcase a partir do código-fonte

No PowerShell, com os [pré-requisitos](./prerequisites.md#windows) instalados:

```powershell
git clone https://github.com/oito2/oito2_uikit.git
cd oito2_uikit
corepack enable
pnpm install
pnpm build
pnpm tauri build --bundles msi,nsis
```

| Pacote | Saída                         | Compila em                |
| ------ | ----------------------------- | ------------------------- |
| msi    | `target\release\bundle\msi\`  | Somente Windows (WiX)     |
| nsis   | `target\release\bundle\nsis\` | Windows (a CI de release) |

## macOS

### Dependência de execução

Nenhuma: o WKWebView faz parte do macOS.

### Instalando o showcase

Baixe `oito2-uikit-showcase-X.Y.Z-macos-universal.dmg` na [última release](https://github.com/oito2/oito2_uikit/releases/latest), junto com o `SHA256SUMS`, e [verifique-o](#verificando-um-download). A imagem de disco contém um app universal (Apple silicon e Intel). Abra-a e arraste **oito2_uikit Showcase** para **Aplicativos**.

O app **não é assinado nem notarizado**, então o Gatekeeper o bloqueia na primeira abertura. Depois de conferir o checksum:

- Abra **Ajustes do Sistema** → **Privacidade e Segurança**, encontre a mensagem sobre o app bloqueado, escolha **Abrir Mesmo Assim** e confirme.
- No macOS 14, clicar no app com Control pressionado no Finder e escolher **Abrir** também funciona.

Se o macOS disser que o app "está danificado e não pode ser aberto", trata-se do atributo de quarentena do download em um app não assinado; remova-o com:

```bash
xattr -dr com.apple.quarantine "/Applications/oito2_uikit Showcase.app"
```

### Compilando o showcase a partir do código-fonte

```bash
git clone https://github.com/oito2/oito2_uikit.git
cd oito2_uikit
corepack enable
pnpm install
pnpm build
rustup target add aarch64-apple-darwin x86_64-apple-darwin
pnpm tauri build --target universal-apple-darwin --bundles app,dmg
```

| Pacote | Saída                                                 |
| ------ | ----------------------------------------------------- |
| app    | `target/universal-apple-darwin/release/bundle/macos/` |
| dmg    | `target/universal-apple-darwin/release/bundle/dmg/`   |

Sem `--target`, a compilação é só para a arquitetura do Mac atual e vai para `target/release/bundle/`. Os pacotes `.app` e `.dmg` só podem ser gerados no macOS.

## Onde cada pacote é gerado

| Pacote   | Gerado em | Artefato da release                                |
| -------- | --------- | -------------------------------------------------- |
| deb      | Linux     | `oito2-uikit-showcase-X.Y.Z-linux-amd64.deb`       |
| rpm      | Linux     | `oito2-uikit-showcase-X.Y.Z-linux-x86_64.rpm`      |
| appimage | Linux     | `oito2-uikit-showcase-X.Y.Z-linux-amd64.AppImage`  |
| msi      | Windows   | `oito2-uikit-showcase-X.Y.Z-windows-x64.msi`       |
| nsis     | Windows   | `oito2-uikit-showcase-X.Y.Z-windows-x64-setup.exe` |
| app      | macOS     | — (dentro do `.dmg`)                               |
| dmg      | macOS     | `oito2-uikit-showcase-X.Y.Z-macos-universal.dmg`   |

O [workflow de release](../../../.github/workflows/release.yml) gera cada grupo no seu próprio SO e renomeia os arquivos como acima.

## Verificando um download

Cada release tem um arquivo `SHA256SUMS` que cobre todos os instaladores. Coloque-o na mesma pasta do download e confira:

```bash
# Linux
sha256sum -c SHA256SUMS --ignore-missing

# macOS: compare the printed hash with the line of SHA256SUMS
shasum -a 256 oito2-uikit-showcase-X.Y.Z-macos-universal.dmg
```

```powershell
# Windows: compare the hash with the line of SHA256SUMS
Get-FileHash -Algorithm SHA256 .\oito2-uikit-showcase-X.Y.Z-windows-x64-setup.exe
```

Para remover as bibliotecas ou o showcase, veja [Desinstalação](./uninstallation.md).
