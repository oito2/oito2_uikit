🌐 [English](../../en/guides/localization.md) | **Português** | 🏠 [Índice](../index.md)

---

# Localização

Como escolher o idioma dos textos embutidos, substituí-los, formatar tamanhos, números e tempos relativos para o idioma do usuário, e dispor o app da direita para a esquerda. Todas as APIs daqui vêm de `@oito2/ui`.

## Índice

- [Escolhendo o idioma](#escolhendo-o-idioma)
- [Textos embutidos](#textos-embutidos)
- [Substituindo textos](#substituindo-textos)
- [Formatação](#formatação)
- [Layouts da direita para a esquerda](#layouts-da-direita-para-a-esquerda)

## Escolhendo o idioma

Os componentes pegam os seus textos (rótulos de botões, nomes para leitores de tela, estados vazios, erros de arquivos, ...) do `LocaleProvider` mais próximo. Ele não renderiza nenhum elemento próprio:

```svelte
<script lang="ts">
	import '@oito2/ui/styles.css';
	import { LocaleProvider, ThemeProvider } from '@oito2/ui';

	let { children } = $props();
</script>

<LocaleProvider locale="pt-BR">
	<ThemeProvider>
		{@render children()}
	</ThemeProvider>
</LocaleProvider>
```

| Prop      | Tipo            | Padrão | Efeito                                                    |
| --------- | --------------- | ------ | --------------------------------------------------------- |
| `locale`  | string BCP 47   | `'en'` | O idioma dos textos e da formatação de números            |
| `strings` | `Localizations` | —      | Um conjunto completo de textos que substitui os embutidos |

Sem um `LocaleProvider`, os componentes usam inglês. O showcase deixa o usuário escolher `System`, `English` ou `Português (Brasil)`; `System` passa o idioma do navegador (`navigator.language`):

```ts
let language: 'system' | 'en' | 'pt-BR' = $state('system');
let locale = $derived(language === 'system' ? (globalThis.navigator?.language ?? 'en') : language);
```

## Textos embutidos

Dois idiomas vêm com o pacote: inglês (`en`) e português do Brasil (`ptBR`), ambos exportados e listados em `supportedLocales` (`['en', 'pt-BR']`). `localizationsFor(locale)` associa um idioma aos seus textos: qualquer idioma `pt` (`pt`, `pt-BR`, `pt_PT`, ...) recebe os textos em português, todos os outros recebem inglês.

Um componente lê os textos com `useLocale()`, que devolve uma referência viva com `locale` e `strings`:

```svelte
<script lang="ts">
	import { useLocale } from '@oito2/ui';

	const locale = useLocale();
</script>

<p>{locale.locale}: {locale.strings.resultCount(3)}</p>
```

`strings` traz textos simples (`close`, `loading`, `download`, ...) e funções para mensagens com valores (`resultCount(count)`, `timeAgo(count, unit)`, `fileTooLarge(name, limit)`, ...). A lista completa é o tipo `Localizations` em [`packages/ui/src/lib/l10n/localizations.ts`](../../../packages/ui/src/lib/l10n/localizations.ts). `@oito2/ui-extras` e `@oito2/ui-files` usam os mesmos textos (rótulos de QR code, assinatura, recorte, envio e download de arquivos). Os rótulos dos botões padrão, da paginação e das entradas de data e hora (`back`, `ok`, `cancel`, `previousPage`, `dateHelp`, `today`, ...) também fazem parte dele, com o texto das localizações Material do Flutter, então um conjunto `strings` passado ao `LocaleProvider` substitui todos os rótulos embutidos.

## Substituindo textos

**Num componente.** Os componentes cujo texto visível ou acessível vem dos textos embutidos aceitam uma prop que o substitui. Alguns exemplos:

| Componente                                       | Prop                             | Substitui                         |
| ------------------------------------------------ | -------------------------------- | --------------------------------- |
| `Chip`                                           | `removeLabel`                    | `dismiss`                         |
| `SplitButton`                                    | `menuLabel`                      | `moreOptions`                     |
| `MasterDetail.Root`, `PanedView`                 | `resizeLabel`                    | `resizePane`                      |
| `ChoiceChipBar.Root`                             | `previousLabel`, `nextLabel`     | `scrollBack`, `scrollForward`     |
| `TitleBar`, `WindowControls`                     | `labels` (`WindowControlLabels`) | Os nomes dos controles da janela  |
| `QrCode`, `ImageCropper` (`@oito2/ui-extras`)    | `label`                          | `qrCode`, `imageCropper`          |
| `SignaturePad` (`@oito2/ui-extras`)              | `label`, `placeholder`           | `signature`, `signHere`           |
| `DownloadTrigger` (`@oito2/ui-files`)            | conteúdo filho                   | `download`                        |
| `FileUpload`, `FileDropZone` (`@oito2/ui-files`) | `hint`                           | A dica de tipos aceitos / tamanho |

```svelte
<Chip variant="input" onRemove={() => (filter = null)} removeLabel="Remove the filter">Images</Chip>
```

As props de cada componente estão na referência de API do showcase.

**No app inteiro.** `strings` recebe um objeto `Localizations` completo. Espalhe um conjunto embutido e altere o que precisar:

```svelte
<script lang="ts">
	import { LocaleProvider, ptBR, type Localizations } from '@oito2/ui';

	let { children } = $props();

	const strings: Localizations = {
		...ptBR,
		download: 'Baixar',
		noResults: 'Nada encontrado'
	};
</script>

<LocaleProvider locale="pt-BR" {strings}>
	{@render children()}
</LocaleProvider>
```

O mesmo mecanismo acrescenta um idioma que o pacote não traz: monte um objeto `Localizations` completo (partir de `en` mantém o tipo completo) e passe-o com esse idioma.

## Formatação

`useFormat()` devolve um `Format` vivo para o `LocaleProvider` mais próximo:

```svelte
<script lang="ts">
	import { useFormat } from '@oito2/ui';

	const format = useFormat();
	const now = new Date();
</script>

<ul>
	<li>{format.current.bytes(1536)}</li>
	<li>{format.current.bytes(1_048_576, { units: 'iec' })}</li>
	<li>{format.current.compactNumber(1_500_000)}</li>
	<li>{format.current.relativeTime(new Date(now.getTime() - 3 * 60_000), now)}</li>
</ul>
```

| Método                     | Resultado (en)               | Observações                                                                                                |
| -------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `bytes(1536)`              | `1.5 kB`                     | `units`: `'si'` (potências de 1000, padrão) ou `'iec'` (KiB, MiB, ...); `fractionDigits` vale 1 por padrão |
| `compactNumber(1234)`      | `1.23K`                      | Notação compacta do `Intl.NumberFormat`, três algarismos significativos                                    |
| `relativeTime(time, now?)` | `3 minutes ago`, `in 2 days` | Até 45 segundos, `justNow`; depois minutos, horas, dias, semanas, meses e anos                             |

Os números seguem o `Intl.NumberFormat` do idioma, então `pt-BR` escreve `1,5 kB`. Qualquer idioma suportado pelo runtime formata os seus números; as palavras do tempo relativo vêm dos textos, então ficam em inglês, a menos que o idioma seja português ou que você passe os seus próprios `strings`. `new Format({ locale, strings })` funciona fora de componentes. Para números, datas e horas simples, use o `Intl` diretamente.

## Layouts da direita para a esquerda

Os componentes seguem a `direction` do CSS de onde são renderizados: as setas horizontais do teclado, carrosséis, divisores, o posicionamento dos popovers e as sombras de rolagem trocam de lado num contexto da direita para a esquerda. Defina `dir` num ancestral; o showcase o coloca no seu `ThemeProvider`, que o repassa à sua `div`, de modo que as sobreposições renderizadas dentro do provider também são espelhadas:

```svelte
<LocaleProvider {locale}>
	<ThemeProvider dir={rtl ? 'rtl' : 'ltr'}>
		{@render children()}
	</ThemeProvider>
</LocaleProvider>
```

`LocaleProvider` não define a direção: escolha-a você mesmo a partir do idioma. Os testes de ponta a ponta do showcase rodam cada página numa configuração clara, da esquerda para a direita, em inglês, e numa escura, da direita para a esquerda, em português.

## Veja também

- A página [Foundation](https://oito2.github.io/oito2_uikit/foundation) do showcase, que mostra os textos e o formatador do idioma ativo.
- [Temas](./theming.md) — o `ThemeProvider` e os atributos que ele repassa.
