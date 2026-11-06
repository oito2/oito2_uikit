<!--
  Copyright (C) 2026  OITO2

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->

<!-- Test helper: the components of @oito2/ui-extras, one at a time or all at rest for axe and goldens. -->
<script lang="ts">
	import '@oito2/ui/styles.css';
	import { ThemeProvider } from '@oito2/ui';
	import QrCode from '../lib/qr/QrCode.svelte';
	import SignaturePad from '../lib/signature/SignaturePad.svelte';
	import { SignatureController } from '../lib/signature/signature-controller.svelte.js';
	import ImageCropper from '../lib/crop/ImageCropper.svelte';
	import CropPreview from '../lib/crop/CropPreview.svelte';
	import { CropController } from '../lib/crop/crop-controller.svelte.js';
	import * as NavigationMenu from '../lib/navigation-menu/navigation-menu/index.js';

	interface Props {
		show: string;
		mode?: 'light' | 'dark';
		highContrast?: boolean;
		data?: string;
		signature?: SignatureController;
		crop?: CropController;
		src?: string;
		circle?: boolean;
		current?: string | null;
		open?: string | null;
		log?: string[];
		/** Whether the handlers given to the navigation menu call `preventDefault()`. */
		cancel?: boolean;
	}

	let {
		show,
		mode = 'light',
		highContrast = false,
		data = 'https://github.com/oito2/oito2_uikit',
		signature = new SignatureController(),
		crop = new CropController(),
		src = '',
		circle = false,
		current = 'docs',
		open = $bindable(null),
		log = [],
		cancel = false
	}: Props = $props();

	/** Returns a handler that logs `name` and, with `cancel`, prevents the default. */
	const handler = (name: string) => (event: Event) => {
		log.push(name);
		if (cancel) event.preventDefault();
	};
</script>

<ThemeProvider {mode} {highContrast} accent="blue" data-testid="gallery">
	<main class="stage" class:still={show === 'gallery'}>
		{#if show === 'qr' || show === 'gallery'}
			<div class="row">
				<QrCode {data} data-testid="qr" />
				{#if show === 'gallery'}
					<QrCode {data} rounded color="#1a3e72" size={120} />
					<QrCode data={'x'.repeat(3000)} size={120} />
				{/if}
			</div>
		{/if}
		{#if show === 'signature' || show === 'gallery'}
			<div style="width: 320px">
				<SignaturePad controller={signature} data-testid="signature" />
			</div>
		{/if}
		{#if show === 'crop' || (show === 'gallery' && src)}
			<div class="row">
				<div style="width: 400px">
					<ImageCropper {src} controller={crop} {circle} height={240} />
				</div>
				<CropPreview controller={crop} {circle} />
			</div>
		{/if}
		{#if show === 'menu' || show === 'gallery'}
			<NavigationMenu.Root bind:value={open} {current} aria-label="Main" hoverDelay={100}>
				<NavigationMenu.List>
					<NavigationMenu.Item value="home">
						<NavigationMenu.Link
							href="#home"
							onclick={() => log.push('home')}
							onpointerenter={handler('home-enter')}>Home</NavigationMenu.Link
						>
					</NavigationMenu.Item>
					<NavigationMenu.Item value="products">
						<NavigationMenu.Trigger onclick={handler('products-click')}
							>Products</NavigationMenu.Trigger
						>
						<NavigationMenu.Content>
							<a href="#editor">Editor</a>
							<a href="#viewer">Viewer</a>
						</NavigationMenu.Content>
					</NavigationMenu.Item>
					<NavigationMenu.Item value="docs">
						<NavigationMenu.Trigger onkeydown={handler('docs-key')}
							>Docs</NavigationMenu.Trigger
						>
						<NavigationMenu.Content>
							<a href="#guide">Guide</a>
						</NavigationMenu.Content>
					</NavigationMenu.Item>
				</NavigationMenu.List>
				<NavigationMenu.Indicator data-testid="indicator" />
			</NavigationMenu.Root>
		{/if}
	</main>
</ThemeProvider>

<style>
	.stage {
		display: grid;
		gap: 16px;
		width: 720px;
		padding: 16px;
		background: var(--oito2-color-background);
		color: var(--oito2-color-on-surface);
	}

	/* Keeps a pointer left over from earlier tests from hovering the gallery in the golden. */
	.still {
		pointer-events: none;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 16px;
	}
</style>
