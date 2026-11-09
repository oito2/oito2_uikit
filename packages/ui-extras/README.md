# @oito2/ui-extras

Optional `@oito2/ui` components with heavier or niche needs: QR codes, a signature pad, an image cropper and a website-style navigation menu.

[![npm](https://img.shields.io/npm/v/@oito2/ui-extras?label=npm)](https://www.npmjs.com/package/@oito2/ui-extras)
[![License](https://img.shields.io/badge/license-GPL--3.0-blue)](https://github.com/oito2/oito2_uikit/blob/main/LICENSE)

## Installation

```bash
pnpm add @oito2/ui-extras @oito2/ui svelte
```

`svelte` (`^5.57.0`) and `@oito2/ui` are peer dependencies. Set up `@oito2/ui` first (its `styles.css` and a `ThemeProvider`); the components use its tokens and localized strings.

## Usage

```svelte
<script lang="ts">
	import { Button } from '@oito2/ui';
	import { QrCode, SignatureController, SignaturePad } from '@oito2/ui-extras';

	let link = $state('https://github.com/oito2/oito2_uikit');
	const signature = new SignatureController();
	let png = $state('');
</script>

<QrCode data={link} size={200} rounded label="QR code of the link" />

<SignaturePad controller={signature} />
<Button
	variant="tonal"
	disabled={signature.isEmpty}
	onclick={() => (png = signature.toCanvas({ color: '#000000' }).toDataURL('image/png'))}
>
	Export PNG
</Button>
```

Image cropping is driven by a `CropController`, shared by the cropper and its live preview:

```svelte
<script lang="ts">
	import { Button } from '@oito2/ui';
	import { CropController, CropPreview, ImageCropper } from '@oito2/ui-extras';

	let { src }: { src: string } = $props();
	const crop = new CropController();
	let cropped = $state('');
</script>

<ImageCropper {src} controller={crop} aspectRatio={16 / 9} />
<CropPreview controller={crop} width={160} />
<Button onclick={() => (cropped = crop.crop({ width: 320 })?.toDataURL() ?? '')}>Crop</Button>
```

## What's inside

| Area            | Exports                                                                                                     | Notes                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| QR code         | `QrCode`, `qrModules`, `qrPath`, `qrQuietZone`, `qrErrorLevels`                                             | SVG output; error level, rounded modules and a center image (logo)                           |
| Signature       | `SignaturePad`, `SignatureController`, `paintStrokes`                                                       | Pressure- and speed-aware strokes; undo, clear, export with `toSvg`, `toCanvas`, `toPngBlob` |
| Image cropper   | `ImageCropper`, `CropPreview`, `CropController`, `loadCropImage`                                            | Zoom, pan, rotate, flip; aspect ratio or circle; `crop()` returns a canvas                   |
| Navigation menu | `NavigationMenu` (`Root`, `List`, `Item`, `Trigger`, `Content`, `Link`, `Indicator`), `NavigationMenuState` | Website-style menu with hover-opened panels                                                  |

```svelte
<NavigationMenu.Root aria-label="Product">
	<NavigationMenu.List>
		<NavigationMenu.Item value="home">
			<NavigationMenu.Link href="/">Home</NavigationMenu.Link>
		</NavigationMenu.Item>
		<NavigationMenu.Item value="docs">
			<NavigationMenu.Trigger>Docs</NavigationMenu.Trigger>
			<NavigationMenu.Content>…</NavigationMenu.Content>
		</NavigationMenu.Item>
	</NavigationMenu.List>
	<NavigationMenu.Indicator />
</NavigationMenu.Root>
```

## Links

- Live showcase: <https://oito2.github.io/oito2_uikit/>
- Repository: <https://github.com/oito2/oito2_uikit>

## License

GPL-3.0 — see [LICENSE](https://github.com/oito2/oito2_uikit/blob/main/LICENSE).
