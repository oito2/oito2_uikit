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

<script lang="ts">
	import { Button, Switch, TextField } from '@oito2/ui';
	import {
		CropController,
		CropPreview,
		ImageCropper,
		NavigationMenu,
		QrCode,
		SignatureController,
		SignaturePad
	} from '@oito2/ui-extras';
	import { onDestroy, onMount } from 'svelte';

	let qrData = $state('https://github.com/oito2/oito2_uikit');
	let rounded = $state(false);
	let withLogo = $state(false);
	const logo =
		'data:image/svg+xml;utf8,' +
		encodeURIComponent(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#3584e4"/><text x="12" y="16.5" font-size="12" font-family="sans-serif" font-weight="700" text-anchor="middle" fill="#fff">o2</text></svg>'
		);

	const signature = new SignatureController();
	let exported = $state('');

	const crop = new CropController();
	let circle = $state(false);
	let src = $state('');
	let objectUrl: string | null = null;
	let cropped = $state('');

	/** Paints a colorful sample picture to crop until the user picks one. */
	onMount(() => {
		const canvas = document.createElement('canvas');
		canvas.width = 800;
		canvas.height = 500;
		const context = canvas.getContext('2d');
		if (!context) return;
		const sky = context.createLinearGradient(0, 0, 0, 500);
		sky.addColorStop(0, '#3584e4');
		sky.addColorStop(1, '#f6d32d');
		context.fillStyle = sky;
		context.fillRect(0, 0, 800, 500);
		context.fillStyle = '#e66100';
		context.beginPath();
		context.arc(560, 170, 70, 0, Math.PI * 2);
		context.fill();
		context.fillStyle = '#26a269';
		context.beginPath();
		context.moveTo(0, 500);
		context.lineTo(250, 260);
		context.lineTo(430, 420);
		context.lineTo(620, 300);
		context.lineTo(800, 500);
		context.fill();
		src = canvas.toDataURL('image/png');
	});

	onDestroy(() => {
		if (objectUrl) URL.revokeObjectURL(objectUrl);
	});

	/** Crops the picture the user chose. */
	function pick(event: Event & { currentTarget: HTMLInputElement }) {
		const file = event.currentTarget.files?.[0];
		if (!file) return;
		if (objectUrl) URL.revokeObjectURL(objectUrl);
		objectUrl = URL.createObjectURL(file);
		src = objectUrl;
	}

	let page = $state<string | null>('docs');
</script>

<main>
	<h1>Extras</h1>
	<p>The components of <code>@oito2/ui-extras</code>, phase F12.</p>

	<section aria-labelledby="navigation-menu">
		<h2 id="navigation-menu">Navigation menu</h2>
		<p>Hover a trigger, click it or press Down on it; Escape closes the panel.</p>
		<NavigationMenu.Root current={page} aria-label="Product">
			<NavigationMenu.List>
				<NavigationMenu.Item value="home">
					<NavigationMenu.Link href="#navigation-menu" onclick={() => (page = 'home')}
						>Home</NavigationMenu.Link
					>
				</NavigationMenu.Item>
				<NavigationMenu.Item value="components">
					<NavigationMenu.Trigger>Components</NavigationMenu.Trigger>
					<NavigationMenu.Content>
						<ul class="links">
							<li><a href="#qr" onclick={() => (page = 'components')}>QR code</a></li>
							<li>
								<a href="#signature" onclick={() => (page = 'components')}
									>Signature pad</a
								>
							</li>
							<li>
								<a href="#cropper" onclick={() => (page = 'components')}
									>Image cropper</a
								>
							</li>
						</ul>
					</NavigationMenu.Content>
				</NavigationMenu.Item>
				<NavigationMenu.Item value="docs">
					<NavigationMenu.Trigger>Docs</NavigationMenu.Trigger>
					<NavigationMenu.Content>
						<p class="panel-text">Guides, the API reference and the design tokens.</p>
					</NavigationMenu.Content>
				</NavigationMenu.Item>
			</NavigationMenu.List>
			<NavigationMenu.Indicator />
		</NavigationMenu.Root>
	</section>

	<section aria-labelledby="qr">
		<h2 id="qr">QR code</h2>
		<div class="row top">
			<QrCode data={qrData} {rounded} centerImage={withLogo ? logo : null} />
			<div class="column">
				<TextField bind:value={qrData} aria-label="QR code text" />
				<label class="row">Rounded modules <Switch bind:checked={rounded} /></label>
				<label class="row">Logo in the middle <Switch bind:checked={withLogo} /></label>
			</div>
		</div>
	</section>

	<section aria-labelledby="signature">
		<h2 id="signature">Signature pad</h2>
		<div class="signature">
			<SignaturePad controller={signature} />
		</div>
		<div class="row">
			<Button
				variant="tonal"
				disabled={signature.isEmpty}
				onclick={() => (exported = signature.toCanvas().toDataURL('image/png'))}
				>Export PNG</Button
			>
			{#if exported}<img class="exported" src={exported} alt="Exported signature" />{/if}
		</div>
	</section>

	<section aria-labelledby="cropper">
		<h2 id="cropper">Image cropper</h2>
		<div class="row">
			<label class="row">Circle <Switch bind:checked={circle} /></label>
			<label class="row">
				Picture
				<input type="file" accept="image/*" onchange={pick} />
			</label>
		</div>
		<div class="row top">
			<div class="cropper">
				{#if src}<ImageCropper {src} controller={crop} {circle} aspectRatio={16 / 9} />{/if}
			</div>
			<div class="column">
				<CropPreview controller={crop} {circle} width={160} />
				<Button
					variant="tonal"
					onclick={() => (cropped = crop.crop({ width: 320, circle })?.toDataURL() ?? '')}
					>Crop</Button
				>
				{#if cropped}<img class="exported" src={cropped} alt="Cropped" />{/if}
			</div>
		</div>
	</section>
</main>

<style>
	main {
		display: grid;
		gap: var(--oito2-space-xl);
		padding: var(--oito2-space-xl);
	}

	h1,
	h2,
	p {
		margin: 0 0 var(--oito2-space-sm);
	}

	section {
		display: grid;
		gap: var(--oito2-space-md);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--oito2-space-md);
	}

	.top {
		align-items: flex-start;
	}

	.column {
		display: grid;
		gap: var(--oito2-space-sm);
		min-width: 240px;
	}

	.links {
		display: grid;
		gap: var(--oito2-space-xs);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.panel-text {
		margin: 0;
		max-width: 280px;
	}

	.signature {
		max-width: 480px;
	}

	.cropper {
		width: min(560px, 100%);
	}

	.exported {
		max-width: 240px;
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-medium);
	}
</style>
