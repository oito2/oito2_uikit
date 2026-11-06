🌐 [English](../../en/architecture/parity-and-generators.md) | **Português** | 🏠 [Índice](../index.md)

---

# Paridade e geradores

As ferramentas em `tools/` mantêm os arquivos derivados em sincronia com suas fontes e mantêm o oito2_uikit de acordo com o oito2_ui. Os geradores de CSS e de API e a sincronização de versões têm um modo de escrita e um modo `--check` que a CI executa. Para todos os scripts do repositório, veja [Scripts do repositório](../reference/repository-scripts.md).

| Ferramenta                       | Entrada                                       | Saída                                                                      | Verificação na CI                                                   |
| -------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `tools/parity`                   | oito2_ui (Flutter)                            | `packages/*/src/fixtures/parity/*.json`                                    | Não (as fixtures são versionadas; as suítes do Vitest as verificam) |
| `tools/generate-css`             | `values.ts`, `theme/`, presets do `ui-themes` | `tokens.css`, `schemes.css`, `presets.css`                                 | `pnpm generate:check`                                               |
| `tools/generate-docs`            | Exports públicos de cada pacote               | `apps/showcase/src/lib/api/api.json`                                       | `pnpm docs:check`                                                   |
| `tools/release/sync-versions.ts` | A versão `@oito2/*` definida pelo Changesets  | `Cargo.toml`, `Cargo.lock`, `package.json` e `tauri.conf.json` do showcase | `sync-versions.ts --check <tag>` no workflow Release                |

## Paridade com o oito2_ui (`tools/parity`)

O oito2_ui é a fonte de verdade do design. O `tools/parity` é um pacote Flutter (`oito2_uikit_parity`) cujos testes, em vez de verificar algo sobre o Flutter, **exportam** os dados de design do oito2_ui como JSON.

### Exportando

Ele depende de um checkout do oito2_ui (ou de um link simbólico) em `.references/oito2_ui`, que é ignorado pelo git:

```bash
cd tools/parity
flutter test
```

| Exportador                    | Fixture                                              | Conteúdo                                                                                      |
| ----------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `export_test.dart`            | `packages/ui/src/fixtures/parity/tokens.json`        | `radius`, `spacing`, `sizes`, `accents`, `neutrals`, `status`, `typography`                   |
| `export_schemes_test.dart`    | `packages/ui/src/fixtures/parity/schemes.json`       | Esquemas `base`, `palettes` de origem dos presets e `presets` resolvidos                      |
| `export_foundation_test.dart` | `packages/ui/src/fixtures/parity/foundation.json`    | `contrast`, `desktopEnvironments`, `platforms`, `systemSettings`, `windowButtonLayouts`       |
| `export_l10n_test.dart`       | `packages/ui/src/fixtures/parity/l10n.json`          | Os textos em inglês e português do Brasil                                                     |
| `export_format_test.dart`     | `packages/ui/src/fixtures/parity/format.json`        | Amostras de formatação de números, datas e bytes por localidade (incluindo uma não suportada) |
| `export_syntax_test.dart`     | `packages/ui-syntax/src/fixtures/parity/syntax.json` | `languages`, `samples`, `scopeRoles`                                                          |
| `export_extras_test.dart`     | `packages/ui-extras/src/fixtures/parity/qr.json`     | `codes` de QR e o caso `tooLong`                                                              |

As cores são escritas como `#RRGGBB` (`#RRGGBBAA` quando não são opacas) e o JSON é indentado com tabs. A variável de ambiente `PARITY_OUT` redireciona o diretório de saída. O `pubspec.yaml` fixa, por `dependency_overrides`, as versões de dependências com que o oito2_ui é testado.

### Comparando

As fixtures são versionadas. As suítes Node do Vitest as importam e as comparam com o que o código TypeScript produz, por exemplo em `packages/ui/src/lib/tokens/values.test.ts`:

```ts
import parity from '../../fixtures/parity/tokens.json';

it('has the same radii, spacing and sizes', () => {
	expect(radius).toEqual(parity.radius);
	expect(spacing).toEqual(parity.spacing);
	expect(sizes).toEqual(parity.sizes);
});
```

Outras suítes fazem o mesmo para esquemas de cores e presets (`color-theme.test.ts`, `presets.test.ts`), contraste, plataforma, ambiente de desktop, layout dos botões e configurações do sistema (`foundation/*.test.ts`), textos (`l10n.test.ts`), formatação (`format.test.ts`), sintaxe (`syntax.test.ts`) e QR codes (`extras.test.ts`). Assim, uma mudança no oito2_ui aparece aqui como um teste falhando assim que as fixtures são regeradas.

A CI não roda o Flutter: regerar as fixtures é um passo manual depois de mudanças no oito2_ui, descrito em [Contribuindo](../contribuindo.md).

## Gerador de CSS (`tools/generate-css`)

O `tools/generate-css/generate.ts` escreve três arquivos:

| Saída                                    | A partir de                                                                                              |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `packages/ui/src/lib/styles/tokens.css`  | `values.ts`: raios, espaçamento, tamanhos, acentos, família da fonte, peso de ênfase, escala tipográfica |
| `packages/ui/src/lib/styles/schemes.css` | `createColorTheme` para 2 brilhos × 9 acentos × contraste normal/alto                                    |
| `packages/ui-themes/src/lib/presets.css` | `presetColorTheme` para os 13 presets × contraste normal/alto                                            |

Ele carrega as fontes TypeScript pelo module runner do Vite, que resolve os imports sem extensão do `@material/material-color-utilities` (e inclui o `@catppuccin/palette`). Cada saída começa com o cabeçalho de licença CSS de `tools/templates/header.css.txt`, uma nota "Generated … Do not edit", e envolve as regras em `@layer oito2`.

```bash
pnpm generate          # write the files
pnpm generate:check    # write nothing; exit 1 if a file on disk differs
```

## Gerador da referência de API (`tools/generate-docs`)

O `tools/generate-docs/generate.ts` monta a referência de API que o showcase mostra em cada página (o `ApiReference.svelte` carrega o `api.json` sob demanda). Para cada pacote — `@oito2/ui`, `-syntax`, `-extras`, `-files`, `-window`, `-settings`, `-themes` — ele lê os exports públicos de `src/lib/index.ts`:

- **Componentes Svelte** (`export { default as Name } from './Name.svelte'`) e **componentes compostos** (`export * as Name from './name/index.js'`) são convertidos com o `svelte2tsx` e lidos com a API do compilador TypeScript: o comentário `@component`, cada membro de `Props` com seu tipo, TSDoc, valor padrão e se é `$bindable`, e os atributos que `Props` estende.
- **Os demais exports** mantêm seu tipo e o resumo do TSDoc.

Por isso todo export público e toda prop precisam ter TSDoc em inglês.

```bash
pnpm docs:generate     # write apps/showcase/src/lib/api/api.json
pnpm docs:check        # exit 1 if the file is out of date
```

## Sincronização de versões (`tools/release/sync-versions.ts`)

O Changesets versiona os pacotes npm como um grupo fixo (`.changeset/config.json`: `"fixed": [["@oito2/*"]]`, ignorando o showcase e os utilitários de teste). O script então copia essa versão para todo o resto:

```bash
pnpm release:version         # changeset version + sync-versions.ts + prettier on the CHANGELOGs
pnpm release:check vX.Y.Z    # sync-versions.ts --check vX.Y.Z
```

| Modo               | Comportamento                                                                                                                                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Escrita (sem flag) | Falha se os pacotes npm públicos discordarem; senão escreve a versão em `[workspace.package]` do `Cargo.toml`, no `package.json` e no `tauri.conf.json` do showcase, e roda `cargo update --workspace` para o `Cargo.lock` |
| `--check <tag>`    | Falha a menos que a tag seja `vX.Y.Z` e toda versão (pacotes npm, workspace Cargo, showcase) seja igual a ela                                                                                                              |

## Workflows de CI (`.github/workflows/`)

| Workflow      | Gatilho                              | O que faz                                                                                                                                                                                                                                                                                                                 |
| ------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ci.yml`      | Push na `main`, pull request, manual | **Frontend** (Ubuntu): `pnpm lint`, `generate:check`, `docs:check`, `build`, `check`, navegadores do Playwright, `pnpm test`; envia os diffs de screenshot quando falha. **Rust** (Ubuntu, Windows, macOS): `pnpm build` (o crate do showcase embute o frontend), `cargo fmt --check`, `clippy -D warnings`, `cargo test` |
| `pages.yml`   | Push na `main`, manual               | Compila os pacotes e o showcase com `BASE_PATH=/oito2_uikit` e o publica no GitHub Pages                                                                                                                                                                                                                                  |
| `release.yml` | Tag `vX.Y.Z`                         | Confere as versões com a tag, publica no npm com proveniência as versões `@oito2/*` que faltam, compila os instaladores do showcase no Linux, Windows e macOS, e cria um rascunho de GitHub Release com os instaladores, o `SHA256SUMS` e o changelog                                                                     |

Os crates Rust não são publicados em um registro: os apps dependem deles pelo git e pela tag. O processo de release está descrito em [Contribuindo](../contribuindo.md).
