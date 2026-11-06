🌐 [English](../../en/troubleshooting/common-issues.md) | **Português** | 🏠 [Índice](../index.md)

---

# Problemas comuns

Problemas que você pode encontrar ao criar um app com o oito2_uikit ou ao trabalhar neste repositório, indexados por sintoma.

| Sintoma                                                                                                 | Seção                                                                                             |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| A compilação Rust falha: `webkit2gtk-4.1` não encontrado, ou o app não carrega `libwebkit2gtk-4.1.so.0` | [WebKitGTK 4.1 ausente](#webkitgtk-41-ausente-linux)                                              |
| O Windows ou o macOS se recusa a abrir o instalador ou o app do showcase                                | [Instaladores não assinados bloqueados](#instaladores-não-assinados-bloqueados)                   |
| O AppImage não inicia e menciona FUSE ou `libfuse.so.2`                                                 | [AppImage não inicia (FUSE)](#appimage-não-inicia-fuse)                                           |
| Uma alteração em uma biblioteca não aparece no showcase ou no seu app                                   | [Alterações nas bibliotecas não aparecem](#alterações-nas-bibliotecas-não-aparecem)               |
| Compilações ou `pnpm tauri dev` falham depois de mover a pasta do repositório                           | [Caminhos antigos depois de mover o repositório](#caminhos-antigos-depois-de-mover-o-repositório) |
| A renderização no servidor falha ao importar `@material/material-color-utilities`                       | [Apps com SSR](#apps-com-ssr-e-materialmaterial-color-utilities)                                  |
| O WebKit do Playwright não inicia no Linux                                                              | [WebKit do Playwright precisa da libavif16](#webkit-do-playwright-precisa-da-libavif16)           |
| Os controles ficam sem tamanho ou sem cores                                                             | [Controles sem tamanho ou sem cores](#controles-sem-tamanho-ou-sem-cores)                         |
| Diálogos, menus ou popovers perdem o tema                                                               | [Sobreposições perdem o tema](#sobreposições-perdem-o-tema)                                       |
| Uma ação de janela ou chamada de plugin é rejeitada como "not allowed"                                  | [Permissão de capability ausente](#permissão-de-capability-ausente)                               |
| `pnpm docs` abre uma página web em vez de gerar a referência da API                                     | [`pnpm docs` é um comando do pnpm](#pnpm-docs-é-um-comando-do-pnpm)                               |

## WebKitGTK 4.1 ausente (Linux)

**Sintoma:** `cargo build` ou `pnpm tauri dev` para com um erro do `pkg-config` dizendo que a biblioteca de sistema `webkit2gtk-4.1` (ou `javascriptcoregtk-4.1`) não foi encontrada; ou um app compilado não inicia com `error while loading shared libraries: libwebkit2gtk-4.1.so.0`.

**Causa:** o Tauri v2 precisa do WebKitGTK **4.1**. Os pacotes `webkit2gtk-4.0` são do Tauri v1 e não o satisfazem.

**Solução:** instale os pacotes de desenvolvimento listados em [Pré-requisitos](../getting-started/prerequisites.md#linux) para compilar (`libwebkit2gtk-4.1-dev` no Debian/Ubuntu, `webkit2gtk4.1-devel` no Fedora), ou apenas o runtime para executar um app (`libwebkit2gtk-4.1-0`, `webkit2gtk4.1`). A base suportada é o WebKitGTK 2.50 ou posterior (Ubuntu 22.04+, Debian 12+, Linux Mint 21+, Zorin OS 17+, Fedora atual).

## Instaladores não assinados bloqueados

**Sintoma:** no Windows, o Microsoft Defender SmartScreen mostra "O Windows protegeu o computador" ao executar o instalador do showcase. No macOS, o Gatekeeper se recusa a abrir o app porque a Apple não consegue verificar se ele contém software malicioso, ou diz que ele "está danificado e não pode ser aberto".

**Causa:** os instaladores do showcase não são assinados digitalmente (nem notarizados, no macOS). Esse é o comportamento padrão dos dois sistemas para downloads não assinados.

**Solução:** primeiro, verifique o arquivo com o `SHA256SUMS` ([Instalação](../getting-started/installation.md#verificando-um-download)). Depois:

- **Windows:** escolha **Mais informações** → **Executar assim mesmo**.
- **macOS:** em **Ajustes do Sistema** → **Privacidade e Segurança**, escolha **Abrir Mesmo Assim** para o app. Se o macOS disser que o app está danificado, remova o atributo de quarentena: `xattr -dr com.apple.quarantine "/Applications/oito2_uikit Showcase.app"`.

## AppImage não inicia (FUSE)

**Sintoma:** executar `oito2-uikit-showcase-X.Y.Z-linux-amd64.AppImage` mostra um erro sobre FUSE ou `libfuse.so.2`.

**Causa:** os AppImages se montam com o FUSE 2, que distribuições recentes não instalam mais por padrão (o Ubuntu 22.04 e posteriores trazem o FUSE 3).

**Solução:** instale a biblioteca do FUSE 2 — `sudo apt install libfuse2` no Ubuntu 22.04, `sudo apt install libfuse2t64` no Ubuntu 24.04 e posteriores, `sudo dnf install fuse-libs` no Fedora. Ou use o pacote `.deb`/`.rpm`.

## Alterações nas bibliotecas não aparecem

**Sintoma:** você alterou um componente em `packages/*`, mas o showcase (`pnpm showcase dev`, `pnpm tauri dev`) ou um app ligado ao workspace ainda mostra o comportamento antigo.

**Causa:** o showcase consome os pacotes **compilados** (`dist/`, gerado pelo `svelte-package`), não os fontes.

**Solução:** execute `pnpm build` na raiz do repositório depois de alterar uma biblioteca e reinicie o servidor de desenvolvimento.

## Caminhos antigos depois de mover o repositório

**Sintoma:** depois de mover ou renomear a pasta do repositório, a compilação Rust, o `pnpm tauri dev` ou o servidor de desenvolvimento falham, ou se referem ao local antigo.

**Causa:** as saídas de compilação do Cargo, os caches de dependências do Vite e os arquivos gerados do SvelteKit registram caminhos absolutos do local antigo.

**Solução:** na raiz do repositório, limpe esses caches e os dados do webview do showcase e recompile:

```bash
cargo clean -p tauri-plugin-oito2-window -p tauri-plugin-oito2-settings -p oito2-uikit-showcase
rm -rf node_modules/.vite apps/showcase/node_modules/.vite apps/showcase/.svelte-kit
rm -rf ~/.local/share/io.github.oito2.uikit-showcase
pnpm build
```

Remover os dados do webview também redefine as configurações do showcase (veja em [Desinstalação](../getting-started/uninstallation.md#dados-deixados-para-trás) a pasta de cada SO).

## Apps com SSR e `@material/material-color-utilities`

**Sintoma:** um app que renderiza o `@oito2/ui` em um servidor Node (SvelteKit com SSR) falha com um erro de resolução de módulo dentro de `@material/material-color-utilities`.

**Causa:** esse pacote importa seus próprios módulos sem extensão de arquivo, o que só um bundler resolve.

**Solução:** deixe o Vite empacotá-lo para o servidor, na configuração do Vite do app:

```ts
export default defineConfig({
	// ...
	ssr: { noExternal: ['@material/material-color-utilities'] }
});
```

Apps só de cliente, incluindo todo app Tauri (`export const ssr = false`), não precisam de nada.

## WebKit do Playwright precisa da libavif16

**Sintoma:** no Linux, os testes de navegador (projeto `browser (webkit)`) ou os testes e2e do showcase no WebKit não conseguem iniciar o navegador e relatam uma biblioteca `libavif` ausente.

**Solução:** `sudo apt install libavif16`. Os navegadores vêm de `pnpm --filter @oito2/ui exec playwright install chromium webkit`.

## Controles sem tamanho ou sem cores

**Sintoma:** botões, campos e outros controles aparecem encolhidos ou sem estilo, ou sem as cores do tema.

**Causa:** os tamanhos vêm de `@oito2/ui/styles.css` (tokens e variáveis de densidade); as cores vêm do `ThemeProvider`, que define as propriedades `--oito2-color-*` no seu elemento.

**Solução:** importe `@oito2/ui/styles.css` uma vez no layout raiz e renderize os componentes dentro de um `ThemeProvider` (veja o [Início rápido](../getting-started/quickstart.md#7-aplique-o-tema-à-janela)). Harnesses de teste precisam das mesmas duas coisas.

## Sobreposições perdem o tema

**Sintoma:** diálogos, menus, popovers ou toasts aparecem com cores padrão ou erradas, enquanto o resto do app tem o tema.

**Causa:** as sobreposições são renderizadas por um portal em um host que o `ThemeProvider` mais próximo coloca no fim do seu elemento. Sem um `ThemeProvider` em volta do componente da sobreposição, o portal recorre ao `document.body`, fora de qualquer tema.

**Solução:** garanta que o componente que abre a sobreposição (e o `Toaster`) fique dentro do `ThemeProvider`, normalmente envolvendo o app inteiro no layout raiz.

## Permissão de capability ausente

**Sintoma:** um controle de janela (minimizar, maximizar, fechar, arrastar, redimensionar), a moldura da janela, as configurações do sistema ou um diálogo de arquivo não faz nada, e a promise rejeitada ou o console do webview diz que o comando não é permitido ("not allowed") e lista as permissões associadas a ele.

**Causa:** o Tauri v2 não expõe nenhum comando ao webview a menos que uma capability conceda a permissão dele àquela janela.

**Solução:** adicione a permissão que falta à capability da janela em `src-tauri/capabilities/`; a lista por pacote está em [Instalação](../getting-started/installation.md#4-capabilities). Confira se o `windows` da capability contém o **rótulo** da janela (`main`), não o título. Não conceda permissões mais amplas do que a indicada no erro.

## `pnpm docs` é um comando do pnpm

**Sintoma:** executar `pnpm docs` no repositório abre a página web de um pacote em vez de regenerar a referência da API.

**Causa:** `docs` é um comando embutido do pnpm, que tem precedência sobre um script de mesmo nome.

**Solução:** use os scripts do repositório `pnpm docs:generate` (regenerar) e `pnpm docs:check` (verificar se está atualizada).
