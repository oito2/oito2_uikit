🌐 [English](../../en/getting-started/prerequisites.md) | **Português** | 🏠 [Índice](../index.md)

---

# Pré-requisitos

O que você precisa para criar um app Tauri v2 com o oito2_uikit ou para compilar o showcase a partir deste repositório. Para apenas **executar** o showcase a partir de um instalador de release, basta ter as [dependências de execução](#dependências-de-execução-para-usuários-finais).

## Sistemas suportados

| SO      | Status    | Versão mínima / distribuições                                         | WebView                |
| ------- | --------- | --------------------------------------------------------------------- | ---------------------- |
| Linux   | Suportado | Ubuntu 22.04+, Debian 12+, Linux Mint 21+, Zorin OS 17+, Fedora atual | WebKitGTK 2.50+        |
| Windows | Suportado | Windows 10 22H2 e Windows 11                                          | WebView2 (Evergreen)   |
| macOS   | Suportado | macOS 14 Sonoma e posteriores                                         | WKWebView (Safari 26+) |

Plataformas móveis (Android, iOS) não são suportadas.

## Ferramentas de desenvolvimento

| Ferramenta                     | Versão                                                                                                                      | Necessária para                                        |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Node.js                        | 24 ou posterior (`engines.node >= 24`)                                                                                      | Apps que usam os pacotes npm; o repositório            |
| pnpm                           | Qualquer versão recente para apps; `pnpm@12.16.1` para este repositório (fixada em `package.json`)                          | Instalar pacotes; o repositório usa workspaces do pnpm |
| Rust                           | 1.90 ou posterior para apps (o `rust-version` dos crates); `1.99.0` para este repositório (fixada em `rust-toolchain.toml`) | O lado Tauri e os dois plugins                         |
| Pacotes de sistema do Tauri v2 | Veja abaixo                                                                                                                 | Compilar qualquer app Tauri                            |

Um app também pode usar o npm para adicionar os pacotes; os exemplos desta documentação usam o pnpm.

### Node.js e pnpm

Instale o Node.js 24 LTS a partir de <https://nodejs.org> ou do gerenciador de pacotes do seu sistema e habilite o pnpm pelo Corepack:

```bash
corepack enable
```

Dentro deste repositório, o Corepack usa a versão do pnpm fixada em `package.json`.

### Rust

No Linux e no macOS:

```bash
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
```

No Windows, baixe e execute o `rustup-init.exe` de <https://rustup.rs> e mantenha a toolchain MSVC como host padrão (`rustup default stable-msvc` se o Rust já estiver instalado).

Neste repositório, o rustup instala a toolchain fixada em `rust-toolchain.toml` (com `rustfmt` e `clippy`) na primeira vez que um comando `cargo` é executado.

## Pacotes de sistema do Tauri v2

Estes são os pacotes dos [pré-requisitos oficiais do Tauri](https://v2.tauri.app/start/prerequisites/). O Tauri v2 precisa do **WebKitGTK 4.1** no Linux; o `webkit2gtk-4.0` é do Tauri v1 e não funciona.

### Linux

Debian, Ubuntu, Linux Mint, Zorin OS:

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev librsvg2-dev
```

Fedora:

```bash
sudo dnf check-update
sudo dnf install webkit2gtk4.1-devel openssl-devel curl wget file librsvg2-devel libxdo-devel
sudo dnf group install "c-development"
```

Arch Linux:

```bash
sudo pacman -Syu
sudo pacman -S --needed webkit2gtk-4.1 base-devel curl wget file openssl librsvg xdotool
```

O Arch Linux não faz parte da base testada; o comando aparece aqui por ser o oficial do Tauri.

### Windows

- **Microsoft C++ Build Tools**, com a carga de trabalho **Desktop development with C++** (Desenvolvimento para desktop com C++).
- **Runtime do WebView2** — já presente no Windows 10 22H2 e no Windows 11. Se faltar, instale o Evergreen Bootstrapper pela página de download do WebView2 da Microsoft.
- **VBSCRIPT** (recurso opcional do Windows) — só para gerar instaladores `.msi`; habilite-o se a compilação falhar com `failed to run light.exe`.

### macOS

O Xcode, ou apenas suas ferramentas de linha de comando (suficientes para apps desktop):

```bash
xcode-select --install
```

Para compilar o showcase universal para macOS, adicione também os dois alvos da Apple:

```bash
rustup target add aarch64-apple-darwin x86_64-apple-darwin
```

## Ferramentas extras para este repositório

| Ferramenta                | Necessária para                                    | Instalação                                                                                                                          |
| ------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Navegadores do Playwright | Os testes de navegador e os testes e2e do showcase | `pnpm --filter @oito2/ui exec playwright install chromium webkit`                                                                   |
| `libavif16` (Linux)       | O WebKit do Playwright                             | `sudo apt install libavif16`                                                                                                        |
| Checkout do oito2_ui      | Só para sincronizar as fixtures de paridade        | Clone `oito2/oito2_ui` (ou crie um link) em `.references/oito2_ui`; veja [Contribuindo](../contribuindo.md#paridade-com-o-oito2_ui) |

## Dependências de execução para usuários finais

Um app Tauri compilado usa o WebView do sistema; os usuários não instalam Node.js nem Rust.

| SO      | O que o usuário precisa                                                                                                                                                                                                                                                                                                    |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Linux   | O runtime do WebKitGTK 4.1: `libwebkit2gtk-4.1-0` (Debian/Ubuntu) ou `webkit2gtk4.1` (Fedora). Os pacotes `.deb` e `.rpm` o declaram como dependência, então o gerenciador de pacotes o instala. O AppImage precisa do FUSE 2 (veja [Solução de problemas](../troubleshooting/common-issues.md#appimage-não-inicia-fuse)). |
| Windows | WebView2 (Evergreen), presente em todas as versões suportadas do Windows                                                                                                                                                                                                                                                   |
| macOS   | Nada: o WKWebView faz parte do sistema                                                                                                                                                                                                                                                                                     |

## Próximos passos

- [Instalação](./installation.md) — adicione as bibliotecas a um app, instale ou compile o showcase.
- [Início rápido](./quickstart.md) — uma janela Tauri com tema e a barra de título do oito2.
