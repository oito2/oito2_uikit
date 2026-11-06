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

<!--
  @component
  Crops the image at `src`: the user zooms and pans it under a crop box of `aspectRatio`,
  rotates it by quarter turns and flips it, and the app reads the result from `controller`.

  The image moves by dragging and zooms by pinching, the mouse wheel or the toolbar. With
  the focus on the crop area the arrow keys pan (more with Shift), plus and minus zoom, R
  rotates (Shift+R the other way) and H flips. With `circle` the box is a circle.
  `CropPreview` shows the result live.
-->
<script lang="ts">
	import {
		IconButton,
		Slider,
		focusBorder,
		useLocale,
		useTheme,
		type IconComponent
	} from '@oito2/ui';
	import ArrowLeftRight from '@lucide/svelte/icons/arrow-left-right';
	import RefreshCcw from '@lucide/svelte/icons/refresh-ccw';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import RotateCw from '@lucide/svelte/icons/rotate-cw';
	import ZoomIn from '@lucide/svelte/icons/zoom-in';
	import ZoomOut from '@lucide/svelte/icons/zoom-out';
	import type { HTMLAttributes } from 'svelte/elements';
	import { CropController, loadCropImage, type CropImage } from './crop-controller.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The URL of the image to crop, such as an object URL of a picked file. */
		src: string;
		/** The controller that holds the zoom, pan, rotation and flip. */
		controller: CropController;
		/** The crop box width divided by its height; ignored with `circle`, which uses 1. Defaults to 1. */
		aspectRatio?: number;
		/** Whether the crop box is a circle. */
		circle?: boolean;
		/** The height of the crop area in pixels. Defaults to 320. */
		height?: number;
		/** Whether the zoom, rotate, flip and reset controls show. Defaults to true. */
		showToolbar?: boolean;
		/** The accessible name of the crop area; defaults to the localized "Image cropper". */
		label?: string;
		/**
		 * The longest side, in pixels, the image is kept at; larger images are scaled down,
		 * keeping their aspect ratio, to bound the memory they take. `null` keeps the full
		 * size. Defaults to 4096.
		 */
		maxDecodedDimension?: number | null;
		/**
		 * The CORS mode the image loads with, for an image of another origin, such as an asset
		 * URL of a Tauri app on Windows or Linux. The crop can only be exported from such an
		 * image when it loads with CORS and its server allows it. Defaults to none.
		 */
		crossOrigin?: 'anonymous' | 'use-credentials' | null;
		/** Called when the image fails to load; the error is logged when it isn't set. */
		onError?: (error: unknown) => void;
		/** The element. */
		ref?: HTMLDivElement | null;
	}

	let {
		src,
		controller,
		aspectRatio = 1,
		circle = false,
		height = 320,
		showToolbar = true,
		label,
		maxDecodedDimension = 4096,
		crossOrigin = null,
		onError,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	const locale = useLocale();
	const theme = useTheme();
	/** The space between the crop box and the edges of the area. */
	const margin = 24;

	let canvas: HTMLCanvasElement | null = $state(null);
	let viewportWidth = $state(0);
	let aspect = $derived(circle ? 1 : aspectRatio > 0 ? aspectRatio : 1);
	let box = $derived.by(() => {
		const room = {
			width: Math.max(1, viewportWidth - margin * 2),
			height: Math.max(1, height - margin * 2)
		};
		return room.width / room.height > aspect
			? { width: room.height * aspect, height: room.height }
			: { width: room.width, height: room.width / aspect };
	});
	let percent = $derived(`${Math.round(controller.zoom * 100)}%`);

	/** The loaded image and its URL. */
	let loaded = $state.raw<{ src: string; image: CropImage } | null>(null);
	/** The controller the image was last given to, and its URL. */
	let given: { controller: CropController; src: string } | null = null;

	// Loads the image.
	$effect(() => {
		const url = src;
		const max = maxDecodedDimension;
		const mode = crossOrigin;
		let cancelled = false;
		loadCropImage(url, max, { crossOrigin: mode }).then(
			(image) => {
				if (!cancelled) loaded = { src: url, image };
			},
			(error: unknown) => {
				if (cancelled) return;
				if (onError) onError(error);
				else console.error('oito2: failed to load the image to crop', error);
			}
		);
		return () => {
			cancelled = true;
		};
	});

	// Gives the loaded image to the current controller; a new picture in the same controller
	// starts with the zoom, pan, rotation and flip reset.
	$effect(() => {
		const target = controller;
		const current = loaded;
		if (!current) return;
		const reset = given !== null && given.controller === target && given.src !== current.src;
		target.setImage(current.image, { reset });
		given = { controller: target, src: current.src };
	});

	// Hands the crop box size to the controller.
	$effect(() => {
		const target = controller;
		if (viewportWidth > 0) target.setBoxSize(box);
	});

	// Measures the width of the crop area.
	$effect(() => {
		const element = canvas;
		if (!element) return;
		const observer = new ResizeObserver(() => (viewportWidth = element.clientWidth));
		observer.observe(element);
		return () => observer.disconnect();
	});

	/** The colors of the area background and of the scrim outside the box. */
	let colors = $state({ surface: '#e8e8e8', scrim: '#000000' });

	// Reads the colors from the theme's custom properties when the canvas or the theme change.
	$effect(() => {
		const element = canvas;
		void theme.current;
		if (!element) return;
		const style = getComputedStyle(element);
		const variable = (name: string, fallback: string) =>
			style.getPropertyValue(name).trim() || fallback;
		colors = {
			surface: variable('--oito2-color-surface-container-highest', '#e8e8e8'),
			scrim: variable('--oito2-color-scrim', '#000000')
		};
	});

	// Paints the image, the scrim outside the box, the box outline and the thirds guides;
	// the canvas is resized only when the area or the pixel ratio changed.
	$effect(() => {
		const element = canvas;
		const target = controller;
		void target.image;
		void target.zoom;
		void target.offset;
		void target.quarterTurns;
		void target.flipped;
		if (!element || viewportWidth <= 0) return;
		const ratio = window.devicePixelRatio || 1;
		const width = Math.round(viewportWidth * ratio);
		const pixelHeight = Math.round(height * ratio);
		if (element.width !== width) element.width = width;
		if (element.height !== pixelHeight) element.height = pixelHeight;
		const context = element.getContext('2d');
		if (!context) return;
		context.setTransform(ratio, 0, 0, ratio, 0, 0);
		context.clearRect(0, 0, viewportWidth, height);
		context.fillStyle = colors.surface;
		context.fillRect(0, 0, viewportWidth, height);
		const left = (viewportWidth - box.width) / 2;
		const top = (height - box.height) / 2;
		context.save();
		context.translate(left, top);
		target.paintCrop(context);
		context.restore();
		const hole = new Path2D();
		if (circle)
			hole.ellipse(
				left + box.width / 2,
				top + box.height / 2,
				box.width / 2,
				box.height / 2,
				0,
				0,
				Math.PI * 2
			);
		else hole.rect(left, top, box.width, box.height);
		const scrim = new Path2D();
		scrim.rect(0, 0, viewportWidth, height);
		scrim.addPath(hole);
		context.globalAlpha = 0.55;
		context.fillStyle = colors.scrim;
		context.fill(scrim, 'evenodd');
		context.globalAlpha = 1;
		if (!circle) {
			context.strokeStyle = 'rgb(255 255 255 / 0.5)';
			context.lineWidth = 1;
			context.beginPath();
			for (let i = 1; i < 3; i++) {
				const x = left + (box.width * i) / 3;
				const y = top + (box.height * i) / 3;
				context.moveTo(x, top);
				context.lineTo(x, top + box.height);
				context.moveTo(left, y);
				context.lineTo(left + box.width, y);
			}
			context.stroke();
		}
		context.strokeStyle = '#ffffff';
		context.lineWidth = 2;
		context.stroke(hole);
	});

	// Pointers on the area: one pans, two pinch to zoom; more are ignored.
	const pointers: Record<number, { x: number; y: number }> = {};
	let pinch: { distance: number; zoom: number } | null = null;

	function pinchDistance(): number {
		const [a, b] = Object.values(pointers);
		return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
	}

	/** Returns the middle of the two pinching pointers. */
	function pinchMiddle(): { x: number; y: number } {
		const [a, b] = Object.values(pointers);
		return a && b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } : { x: 0, y: 0 };
	}

	function onpointerdown(event: PointerEvent): void {
		if (event.pointerType === 'mouse' && event.button !== 0) return;
		ref?.querySelector<HTMLElement>('.oito2-image-cropper-area')?.focus({
			preventScroll: true
		});
		if (Object.keys(pointers).length >= 2) return;
		pointers[event.pointerId] = { x: event.clientX, y: event.clientY };
		try {
			(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		} catch {
			// A pointer that is no longer active can't be captured.
		}
		pinch =
			Object.keys(pointers).length === 2
				? { distance: pinchDistance(), zoom: controller.zoom }
				: null;
	}

	function onpointermove(event: PointerEvent): void {
		const previous = pointers[event.pointerId];
		if (!previous) return;
		const next = { x: event.clientX, y: event.clientY };
		if (pinch && Object.keys(pointers).length === 2 && canvas) {
			// Zooms around the middle of the fingers and moves the image with that middle,
			// so the point of the image under the fingers stays under them.
			const from = pinchMiddle();
			pointers[event.pointerId] = next;
			const to = pinchMiddle();
			const area = canvas.getBoundingClientRect();
			const center = { x: area.left + area.width / 2, y: area.top + area.height / 2 };
			const before = controller.zoom;
			const offset = controller.offset;
			const distance = pinchDistance();
			if (pinch.distance > 0) controller.zoom = (pinch.zoom * distance) / pinch.distance;
			const factor = controller.zoom / before;
			const x = to.x - center.x - (from.x - center.x - offset.x) * factor;
			const y = to.y - center.y - (from.y - center.y - offset.y) * factor;
			controller.panBy(x - controller.offset.x, y - controller.offset.y);
		} else {
			pointers[event.pointerId] = next;
			controller.panBy(next.x - previous.x, next.y - previous.y);
		}
	}

	function onpointerup(event: PointerEvent): void {
		if (!(event.pointerId in pointers)) return;
		delete pointers[event.pointerId];
		pinch = null;
	}

	function onwheel(event: WheelEvent): void {
		event.preventDefault();
		const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? height : 1;
		controller.zoomBy(Math.pow(1.0015, -event.deltaY * scale));
	}

	function onkeydown(event: KeyboardEvent): void {
		if (event.ctrlKey || event.metaKey || event.altKey) return;
		const step = event.shiftKey ? 32 : 8;
		switch (event.key) {
			case 'ArrowLeft':
				controller.panBy(step, 0);
				break;
			case 'ArrowRight':
				controller.panBy(-step, 0);
				break;
			case 'ArrowUp':
				controller.panBy(0, step);
				break;
			case 'ArrowDown':
				controller.panBy(0, -step);
				break;
			case '+':
			case '=':
				controller.zoomBy(1.1);
				break;
			case '-':
				controller.zoomBy(1 / 1.1);
				break;
			case 'r':
				controller.rotateRight();
				break;
			case 'R':
				controller.rotateLeft();
				break;
			case 'h':
			case 'H':
				controller.flipHorizontally();
				break;
			default:
				return;
		}
		event.preventDefault();
	}
</script>

<div bind:this={ref} class={['oito2-image-cropper', className]} {...rest}>
	<!-- The crop area takes the keyboard focus and handles the pan, zoom, rotate and flip keys. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
	<div
		class="oito2-image-cropper-area"
		role="application"
		tabindex="0"
		aria-label="{label ?? locale.strings.imageCropper}, {percent}"
		{@attach focusBorder({ radius: 'medium' })}
		{onkeydown}
		{onpointerdown}
		{onpointermove}
		{onpointerup}
		onpointercancel={onpointerup}
		{@attach (node) => {
			node.addEventListener('wheel', onwheel, { passive: false });
			return () => node.removeEventListener('wheel', onwheel);
		}}
	>
		<canvas bind:this={canvas} style:height="{height}px" aria-hidden="true"></canvas>
	</div>
	{#if showToolbar}
		<div class="oito2-image-cropper-toolbar">
			<IconButton
				icon={ZoomOut as IconComponent}
				label={locale.strings.zoomOut}
				onclick={() => controller.zoomBy(1 / 1.2)}
			/>
			<div class="oito2-image-cropper-zoom">
				<Slider
					value={controller.zoom}
					min={1}
					max={controller.maxZoom}
					thumbLabels={[locale.strings.zoom, locale.strings.zoom]}
					valueText={(zoom) => `${Math.round(zoom * 100)}%`}
					onValueChange={(value) => {
						if (typeof value === 'number') controller.zoom = value;
					}}
				/>
			</div>
			<IconButton
				icon={ZoomIn as IconComponent}
				label={locale.strings.zoomIn}
				onclick={() => controller.zoomBy(1.2)}
			/>
			<IconButton
				icon={RotateCcw as IconComponent}
				label={locale.strings.rotateLeft}
				onclick={() => controller.rotateLeft()}
			/>
			<IconButton
				icon={RotateCw as IconComponent}
				label={locale.strings.rotateRight}
				onclick={() => controller.rotateRight()}
			/>
			<IconButton
				icon={ArrowLeftRight as IconComponent}
				label={locale.strings.flipHorizontally}
				selected={controller.flipped}
				onclick={() => controller.flipHorizontally()}
			/>
			<IconButton
				icon={RefreshCcw as IconComponent}
				label={locale.strings.reset}
				onclick={() => controller.reset()}
			/>
		</div>
	{/if}
</div>

<style>
	@layer oito2 {
		.oito2-image-cropper {
			display: flex;
			flex-direction: column;
			gap: var(--oito2-space-sm);
		}

		.oito2-image-cropper-area {
			overflow: hidden;
			border-radius: var(--oito2-radius-medium);
			cursor: move;
			touch-action: none;
		}

		canvas {
			display: block;
			width: 100%;
		}

		.oito2-image-cropper-zoom {
			width: 140px;
		}

		.oito2-image-cropper-toolbar {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			justify-content: center;
			gap: var(--oito2-space-xs);
		}
	}
</style>
