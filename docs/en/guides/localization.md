🌐 [Português](../../pt-br/guides/localization.md) | **English** | 🏠 [Index](../index.md)

---

# Localization

How to choose the language of the built-in strings, replace them, format sizes, numbers and relative times for the user's locale, and lay the app out right to left. Every API here comes from `@oito2/ui`.

## Table of Contents

- [Choosing the locale](#choosing-the-locale)
- [Built-in strings](#built-in-strings)
- [Overriding strings](#overriding-strings)
- [Formatting](#formatting)
- [Right-to-left layouts](#right-to-left-layouts)

## Choosing the locale

The components take their strings (button labels, screen reader names, empty states, file errors, ...) from the closest `LocaleProvider`. It renders no element of its own:

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

| Prop      | Type            | Default | Effect                                                    |
| --------- | --------------- | ------- | --------------------------------------------------------- |
| `locale`  | BCP 47 string   | `'en'`  | The locale of the strings and of number formatting        |
| `strings` | `Localizations` | —       | A complete set of strings that replaces the built-in ones |

Without a `LocaleProvider`, components use English. The showcase lets the user choose `System`, `English` or `Português (Brasil)`; `System` passes the browser's language (`navigator.language`):

```ts
let language: 'system' | 'en' | 'pt-BR' = $state('system');
let locale = $derived(language === 'system' ? (globalThis.navigator?.language ?? 'en') : language);
```

## Built-in strings

Two languages ship with the package: English (`en`) and Brazilian Portuguese (`ptBR`), both exported, and listed in `supportedLocales` (`['en', 'pt-BR']`). `localizationsFor(locale)` maps a locale to its strings: any `pt` locale (`pt`, `pt-BR`, `pt_PT`, ...) gets the Portuguese strings, every other locale gets English.

A component reads the strings with `useLocale()`, which returns a live reference with `locale` and `strings`:

```svelte
<script lang="ts">
	import { useLocale } from '@oito2/ui';

	const locale = useLocale();
</script>

<p>{locale.locale}: {locale.strings.resultCount(3)}</p>
```

`strings` holds plain strings (`close`, `loading`, `download`, ...) and functions for messages with values (`resultCount(count)`, `timeAgo(count, unit)`, `fileTooLarge(name, limit)`, ...). The full list is the `Localizations` type in [`packages/ui/src/lib/l10n/localizations.ts`](../../../packages/ui/src/lib/l10n/localizations.ts). `@oito2/ui-extras` and `@oito2/ui-files` use the same strings (QR code, signature pad, cropper, file upload and download labels).

## Overriding strings

**One component.** Components whose visible or accessible text comes from the strings take a prop that replaces it. Some examples:

| Component                                        | Prop                             | Replaces                       |
| ------------------------------------------------ | -------------------------------- | ------------------------------ |
| `Chip`                                           | `removeLabel`                    | `dismiss`                      |
| `SplitButton`                                    | `menuLabel`                      | `moreOptions`                  |
| `MasterDetail.Root`, `PanedView`                 | `resizeLabel`                    | `resizePane`                   |
| `ChoiceChipBar.Root`                             | `previousLabel`, `nextLabel`     | `scrollBack`, `scrollForward`  |
| `TitleBar`, `WindowControls`                     | `labels` (`WindowControlLabels`) | The window control names       |
| `QrCode`, `ImageCropper` (`@oito2/ui-extras`)    | `label`                          | `qrCode`, `imageCropper`       |
| `SignaturePad` (`@oito2/ui-extras`)              | `label`, `placeholder`           | `signature`, `signHere`        |
| `DownloadTrigger` (`@oito2/ui-files`)            | children                         | `download`                     |
| `FileUpload`, `FileDropZone` (`@oito2/ui-files`) | `hint`                           | The accepted types / size hint |

```svelte
<Chip variant="input" onRemove={() => (filter = null)} removeLabel="Remove the filter">Images</Chip>
```

The props of every component are in the showcase API reference.

**The whole app.** `strings` takes a complete `Localizations` object. Spread a built-in set and change what you need:

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

The same mechanism adds a language the package does not ship: build a full `Localizations` object (starting from `en` keeps the type complete) and pass it with that locale.

## Formatting

`useFormat()` returns a live `Format` for the closest `LocaleProvider`:

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

| Method                     | Result (en)                  | Notes                                                                                                |
| -------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| `bytes(1536)`              | `1.5 kB`                     | `units`: `'si'` (powers of 1000, default) or `'iec'` (KiB, MiB, ...); `fractionDigits` defaults to 1 |
| `compactNumber(1234)`      | `1.23K`                      | `Intl.NumberFormat` compact notation, three significant digits                                       |
| `relativeTime(time, now?)` | `3 minutes ago`, `in 2 days` | Within 45 seconds, `justNow`; then minutes, hours, days, weeks, months and years                     |

Numbers follow `Intl.NumberFormat` for the locale, so `pt-BR` writes `1,5 kB`. Any locale the runtime supports formats its numbers; relative-time words come from the strings, so they are English unless the locale is Portuguese or you pass your own `strings`. `new Format({ locale, strings })` works outside components. For plain numbers, dates and times, use `Intl` directly.

## Right-to-left layouts

Components follow the CSS `direction` of where they render: horizontal arrow keys, carousels, splitters, popover placement and the undershoot shadows swap sides in a right-to-left context. Set `dir` on an ancestor; the showcase puts it on its `ThemeProvider`, which passes it to its `div`, so the overlays rendered inside the provider are mirrored too:

```svelte
<LocaleProvider {locale}>
	<ThemeProvider dir={rtl ? 'rtl' : 'ltr'}>
		{@render children()}
	</ThemeProvider>
</LocaleProvider>
```

`LocaleProvider` does not set the direction: choose it from the language yourself. The showcase's end-to-end tests run every page in a light, left-to-right, English configuration and in a dark, right-to-left, Portuguese one.

## See also

- Showcase page [Foundation](https://oito2.github.io/oito2_uikit/foundation), which shows the strings and the formatter of the active locale.
- [Theming](./theming.md) — `ThemeProvider` and the attributes it passes on.
