// Copyright (C) 2026  OITO2
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import axe from 'axe-core';
import jsQR from 'jsqr';
import { beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import ExtrasHarness from '../tests/ExtrasHarness.svelte';
import { CropController } from './crop/crop-controller.svelte.js';
import { SignatureController } from './signature/signature-controller.svelte.js';

const el = (locator: { element(): Element }) => locator.element() as HTMLElement;

// Moves the pointer off the page area the components render in, so a pointer left over
// from an earlier test doesn't hover them.
beforeEach(async () => {
	await userEvent.unhover(document.body);
});
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Waits for the finite animations on the page to end. */
async function settleAnimations(): Promise<void> {
	const finite = document
		.getAnimations()
		.filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity);
	await Promise.all(finite.map((animation) => animation.finished.catch(() => {})));
}

/** Returns a PNG data URL of a `width` × `height` image, red on the left half and blue on the right. */
function twoColorImage(width: number, height: number): string {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext('2d') as CanvasRenderingContext2D;
	context.fillStyle = '#ff0000';
	context.fillRect(0, 0, width / 2, height);
	context.fillStyle = '#0000ff';
	context.fillRect(width / 2, 0, width / 2, height);
	return canvas.toDataURL('image/png');
}

/** Returns the color at `x`, `y` of `canvas` as `r,g,b`. */
function colorAt(canvas: HTMLCanvasElement, x: number, y: number): string {
	const [r, g, b] = (canvas.getContext('2d') as CanvasRenderingContext2D).getImageData(
		x,
		y,
		1,
		1
	).data;
	return `${r},${g},${b}`;
}

/** Sends a pointer event of `type` at client position `x`, `y` to `target`. */
function pointer(
	target: Element,
	type: string,
	x: number,
	y: number,
	options: PointerEventInit = {}
) {
	target.dispatchEvent(
		new PointerEvent(type, {
			bubbles: true,
			cancelable: true,
			pointerId: 1,
			pointerType: 'mouse',
			button: 0,
			buttons: 1,
			clientX: x,
			clientY: y,
			...options
		})
	);
}

describe('QrCode', () => {
	it('renders a code that decodes back to its data', async () => {
		const data = 'Olá — https://github.com/oito2 🌍';
		render(ExtrasHarness, { show: 'qr', data });
		const svg = el(page.getByRole('img', { name: 'QR code' }));
		const image = new Image();
		image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
		await image.decode();
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = 320;
		const context = canvas.getContext('2d') as CanvasRenderingContext2D;
		context.drawImage(image, 0, 0, 320, 320);
		const pixels = context.getImageData(0, 0, 320, 320);
		expect(jsQR(pixels.data, 320, 320)?.data).toBe(data);
	});

	it('shows a message when the data does not fit', async () => {
		render(ExtrasHarness, { show: 'qr', data: 'x'.repeat(3000) });
		await expect
			.element(page.getByRole('alert'))
			.toHaveTextContent('Too much data for a QR code');
	});
});

describe('SignaturePad', () => {
	it('draws with the primary button, undoes, clears and reports its state', async () => {
		const signature = new SignatureController();
		render(ExtrasHarness, { show: 'signature', signature });
		const group = page.getByRole('group', { name: 'Signature: Empty' });
		await expect.element(group).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Undo' })).toBeDisabled();
		const canvas = el(page.getByTestId('signature')).querySelector(
			'canvas'
		) as HTMLCanvasElement;
		await expect.poll(() => signature.size.width).toBeGreaterThan(0);
		const box = canvas.getBoundingClientRect();
		pointer(canvas, 'pointerdown', box.left + 10, box.top + 10, { button: 2, buttons: 2 });
		expect(signature.isEmpty).toBe(true);
		pointer(canvas, 'pointerdown', box.left + 20, box.top + 40);
		for (let i = 1; i <= 5; i++)
			pointer(canvas, 'pointermove', box.left + 20 + i * 20, box.top + 40 + i * 5);
		pointer(canvas, 'pointerup', box.left + 120, box.top + 65);
		pointer(canvas, 'pointerdown', box.left + 200, box.top + 50);
		pointer(canvas, 'pointerup', box.left + 200, box.top + 50);
		expect(signature.strokes.map((stroke) => stroke.length)).toEqual([6, 1]);
		expect(signature.size.width).toBeCloseTo(box.width, 0);
		await expect.element(page.getByRole('group', { name: 'Signature: Signed' })).toBeVisible();
		await page.getByRole('button', { name: 'Undo' }).click();
		expect(signature.strokes).toHaveLength(1);
		await page.getByRole('button', { name: 'Clear' }).click();
		expect(signature.isEmpty).toBe(true);
	});

	it('exports PNG and SVG', async () => {
		const signature = new SignatureController();
		render(ExtrasHarness, { show: 'signature', signature });
		await expect.poll(() => signature.size.width).toBeGreaterThan(0);
		signature.addStroke([
			{ x: 20, y: 20, width: 3 },
			{ x: 120, y: 60, width: 3 }
		]);
		const blob = await signature.toPngBlob({ color: '#ff0000' });
		const bytes = new Uint8Array(await (blob as Blob).arrayBuffer());
		expect(String.fromCharCode(...bytes.slice(1, 4))).toBe('PNG');
		const canvas = signature.toCanvas({ color: '#ff0000', pixelRatio: 1 });
		expect(colorAt(canvas, 70, 40)).toBe('255,0,0');
		expect(signature.toSvg()).toContain('<path d="M20.0 20.0L120.0 60.0"');
	});
});

describe('ImageCropper', () => {
	it('loads, zooms, rotates, flips and crops at the image resolution', async () => {
		const crop = new CropController();
		render(ExtrasHarness, { show: 'crop', crop, src: twoColorImage(400, 200) });
		await expect.poll(() => crop.image).not.toBeNull();
		expect(crop.boxSize.width).toBe(crop.boxSize.height);
		const square = crop.crop() as HTMLCanvasElement;
		// The square box covers the 200-pixel image height at zoom 1.
		expect([square.width, square.height]).toEqual([200, 200]);
		expect(crop.crop({ width: 64 })?.width).toBe(64);
		await page.getByRole('button', { name: 'Zoom in' }).click();
		expect(crop.zoom).toBeCloseTo(1.2, 3);
		await page.getByRole('button', { name: 'Rotate right' }).click();
		await page.getByRole('button', { name: 'Flip horizontally' }).click();
		expect([crop.quarterTurns, crop.flipped]).toEqual([1, true]);
		await page.getByRole('button', { name: 'Reset' }).click();
		expect([crop.zoom, crop.quarterTurns, crop.flipped]).toEqual([1, 0, false]);
	});

	it('turns a flipped image the way its button says', async () => {
		const crop = new CropController();
		render(ExtrasHarness, { show: 'crop', crop, src: twoColorImage(400, 200) });
		await expect.poll(() => crop.image).not.toBeNull();
		// Flipped, blue is on the left, and a clockwise turn brings the left to the top.
		crop.flipHorizontally();
		crop.rotateRight();
		const canvas = crop.crop({ width: 40 }) as HTMLCanvasElement;
		expect(colorAt(canvas, 20, 5)).toBe('0,0,255');
		expect(colorAt(canvas, 20, 34)).toBe('255,0,0');
	});

	it('answers the keyboard, the wheel and a drag', async () => {
		const crop = new CropController();
		render(ExtrasHarness, { show: 'crop', crop, src: twoColorImage(400, 200) });
		await expect.poll(() => crop.image).not.toBeNull();
		const area = page.getByRole('application');
		await expect.element(area).toHaveAccessibleName('Image cropper, 100%');
		el(area).focus();
		await userEvent.keyboard('r');
		expect(crop.quarterTurns).toBe(1);
		await userEvent.keyboard('R');
		expect(crop.quarterTurns).toBe(0);
		await userEvent.keyboard('h');
		expect(crop.flipped).toBe(true);
		await userEvent.keyboard('+');
		expect(crop.zoom).toBeCloseTo(1.1, 3);
		await expect.element(area).toHaveAccessibleName('Image cropper, 110%');
		await userEvent.keyboard('{ArrowLeft}');
		expect(crop.offset.x).toBe(8);
		await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
		expect(crop.offset.x).toBeGreaterThan(8);
		const target = el(area);
		const box = target.getBoundingClientRect();
		target.dispatchEvent(
			new WheelEvent('wheel', {
				bubbles: true,
				cancelable: true,
				deltaY: -200,
				clientX: box.left + 50,
				clientY: box.top + 50
			})
		);
		expect(crop.zoom).toBeGreaterThan(1.1);
		const before = crop.offset.y;
		pointer(target, 'pointerdown', box.left + 100, box.top + 100);
		pointer(target, 'pointermove', box.left + 100, box.top + 90);
		pointer(target, 'pointerup', box.left + 100, box.top + 90);
		expect(crop.offset.y).toBe(before - 10);
	});
});

describe('NavigationMenu', () => {
	it('opens a panel with a click, moves the focus in and closes on Escape', async () => {
		const props = $state({ show: 'menu', open: null as string | null });
		render(ExtrasHarness, props);
		const trigger = page.getByRole('button', { name: 'Products' });
		await trigger.click();
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
		expect(props.open).toBe('products');
		await expect.element(page.getByRole('link', { name: 'Editor' })).toHaveFocus();
		await userEvent.keyboard('{Escape}');
		await expect.element(page.getByRole('link', { name: 'Editor' })).not.toBeInTheDocument();
		await expect.element(trigger).toHaveFocus();
		expect(props.open).toBeNull();
	});

	it('opens with the Down arrow and marks the current item', async () => {
		render(ExtrasHarness, { show: 'menu', current: 'home' });
		await expect
			.element(page.getByRole('link', { name: 'Home' }))
			.toHaveAttribute('aria-current', 'page');
		el(page.getByRole('button', { name: 'Docs' })).focus();
		await userEvent.keyboard('{ArrowDown}');
		await expect.element(page.getByRole('link', { name: 'Guide' })).toHaveFocus();
	});

	it('opens on hover after a delay and switches panels at once', async () => {
		render(ExtrasHarness, { show: 'menu' });
		await page.getByRole('button', { name: 'Products' }).hover();
		await expect.element(page.getByRole('link', { name: 'Editor' })).toBeVisible();
		await page.getByRole('button', { name: 'Docs' }).hover();
		await expect.element(page.getByRole('link', { name: 'Guide' })).toBeVisible();
		await expect.element(page.getByRole('link', { name: 'Editor' })).not.toBeInTheDocument();
		await page.getByRole('link', { name: 'Guide' }).hover();
		await wait(400);
		await expect.element(page.getByRole('link', { name: 'Guide' })).toBeVisible();
	});

	it('puts the line under the current item', async () => {
		render(ExtrasHarness, { show: 'menu', current: 'docs' });
		const indicator = el(page.getByTestId('indicator'));
		const docs = el(page.getByRole('button', { name: 'Docs' }));
		await expect.poll(() => indicator.dataset.state).toBe('visible');
		await settleAnimations();
		const line = indicator.getBoundingClientRect();
		const item = docs.getBoundingClientRect();
		expect(Math.abs(line.left - (item.left + 8))).toBeLessThan(2);
		expect(Math.abs(line.bottom - item.bottom)).toBeLessThan(2);
	});
});

const schemes = [
	{ name: 'light', mode: 'light', highContrast: false },
	{ name: 'dark', mode: 'dark', highContrast: false },
	{ name: 'light-hc', mode: 'light', highContrast: true }
] as const;

describe('extras gallery', () => {
	beforeEach(async () => {
		await page.viewport(760, 900);
	});

	for (const scheme of schemes) {
		const props = () => ({
			show: 'gallery',
			mode: scheme.mode,
			highContrast: scheme.highContrast,
			src: twoColorImage(400, 200)
		});

		it(`has no axe violations in ${scheme.name}`, async () => {
			render(ExtrasHarness, props());
			await document.fonts.ready;
			await wait(400);
			await settleAnimations();
			const result = await axe.run(page.getByTestId('gallery').element());
			const violations = result.violations.map(
				(v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`
			);
			expect(violations).toEqual([]);
		});

		it(`matches the golden in ${scheme.name}`, async () => {
			render(ExtrasHarness, props());
			await document.fonts.ready;
			await wait(400);
			await settleAnimations();
			await expect(page.getByTestId('gallery')).toMatchScreenshot(`extras-${scheme.name}`);
		});
	}
});
