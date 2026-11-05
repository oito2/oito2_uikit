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
	import FlipHorizontal from '@lucide/svelte/icons/arrow-left-right';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import RotateCw from '@lucide/svelte/icons/rotate-cw';
	import Undo from '@lucide/svelte/icons/refresh-ccw';
	import ZoomIn from '@lucide/svelte/icons/zoom-in';
	import ZoomOut from '@lucide/svelte/icons/zoom-out';
	import { Button, IconButton, SegmentGroup, Switch, type IconComponent } from '@oito2/ui';
	import { CropController, CropPreview, ImageCropper } from '@oito2/ui-extras';
	import { onDestroy, onMount } from 'svelte';

	const icon = (component: unknown) => component as IconComponent;

	const crop = new CropController();
	const ratios = [
		{ value: '1', label: 'Square', ratio: 1 },
		{ value: '4/3', label: '4:3', ratio: 4 / 3 },
		{ value: '16/9', label: '16:9', ratio: 16 / 9 }
	];
	let ratioValue = $state('16/9');
	let aspectRatio = $derived(ratios.find((entry) => entry.value === ratioValue)?.ratio ?? 1);
	let circle = $state(false);
	let src = $state('');
	let objectUrl: string | null = null;
	let cropped = $state('');

	const manual = new CropController({ maxZoom: 6 });

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
		cropped = '';
	}
</script>

<main class="showcase-page">
	<p>
		<code>ImageCropper</code> crops a picture: the user zooms and pans it under a crop box,
		rotates it by quarter turns and flips it. A <code>CropController</code> holds that state and
		makes the crop; <code>CropPreview</code> shows it live. With the focus on the crop area, the arrow
		keys pan, plus and minus zoom, R rotates and H flips.
	</p>

	<section aria-labelledby="image-cropper-crop">
		<h2 id="image-cropper-crop">Cropping</h2>
		<div class="row">
			<SegmentGroup.Root bind:value={ratioValue} aria-label="Aspect ratio" disabled={circle}>
				{#each ratios as entry (entry.value)}
					<SegmentGroup.Item value={entry.value}>{entry.label}</SegmentGroup.Item>
				{/each}
			</SegmentGroup.Root>
			<label class="row">Circle <Switch bind:checked={circle} /></label>
			<label class="row">
				Picture
				<input type="file" accept="image/*" onchange={pick} />
			</label>
		</div>
		<div class="row top">
			<div class="image-cropper-area">
				{#if src}<ImageCropper {src} controller={crop} {circle} {aspectRatio} />{/if}
			</div>
			<div class="column">
				<span class="note">Preview</span>
				<CropPreview controller={crop} {circle} width={160} />
				<Button
					variant="tonal"
					onclick={() => (cropped = crop.crop({ width: 320, circle })?.toDataURL() ?? '')}
					>Crop</Button
				>
				{#if cropped}<img
						class="image-cropper-result"
						src={cropped}
						alt="The cropped result"
					/>{/if}
			</div>
		</div>
	</section>

	<section aria-labelledby="image-cropper-code">
		<h2 id="image-cropper-code">Driven from code</h2>
		<p>
			With <code>showToolbar</code> off the app shows its own controls, which call the controller.
			This one zooms up to six times.
		</p>
		<div class="row">
			<IconButton
				icon={icon(ZoomOut)}
				label="Zoom out"
				onclick={() => manual.zoomBy(1 / 1.25)}
			/>
			<IconButton icon={icon(ZoomIn)} label="Zoom in" onclick={() => manual.zoomBy(1.25)} />
			<IconButton
				icon={icon(RotateCcw)}
				label="Rotate left"
				onclick={() => manual.rotateLeft()}
			/>
			<IconButton
				icon={icon(RotateCw)}
				label="Rotate right"
				onclick={() => manual.rotateRight()}
			/>
			<IconButton
				icon={icon(FlipHorizontal)}
				label="Flip"
				selected={manual.flipped}
				onclick={() => manual.flipHorizontally()}
			/>
			<IconButton icon={icon(Undo)} label="Reset" onclick={() => manual.reset()} />
		</div>
		<div class="row top">
			<div class="image-cropper-area">
				{#if src}
					<ImageCropper
						{src}
						controller={manual}
						showToolbar={false}
						height={240}
						label="Picture driven from code"
					/>
				{/if}
			</div>
			<dl class="image-cropper-state">
				<dt>Zoom</dt>
				<dd>{manual.zoom.toFixed(2)}×</dd>
				<dt>Pan</dt>
				<dd>{Math.round(manual.offset.x)}, {Math.round(manual.offset.y)}</dd>
				<dt>Quarter turns</dt>
				<dd>{manual.quarterTurns}</dd>
				<dt>Flipped</dt>
				<dd>{manual.flipped ? 'yes' : 'no'}</dd>
			</dl>
		</div>
	</section>
</main>

<style>
	.image-cropper-area {
		width: min(560px, 100%);
	}

	.image-cropper-result {
		max-width: 240px;
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-medium);
	}

	.image-cropper-state {
		display: grid;
		grid-template-columns: auto auto;
		gap: var(--oito2-space-xs) var(--oito2-space-md);
		margin: 0;
	}

	.image-cropper-state dd {
		margin: 0;
		font-variant-numeric: tabular-nums;
	}
</style>
