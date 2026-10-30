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

import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import LayerHarness from '../../tests/LayerHarness.svelte';
import PortalHarness from '../../tests/PortalHarness.svelte';
import PresenceHarness from '../../tests/PresenceHarness.svelte';
import { createColorTheme } from '../theme/color-theme.js';
import { lockScroll } from './scroll-lock.js';
import { announce } from './live-region.js';

/** Waits for the layers to start listening, one task after they attach. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

describe('dismissableLayer', () => {
	it('closes on Escape and on a press outside', async () => {
		const calls: string[] = [];
		render(LayerHarness, { onDismiss: (layer, reason) => calls.push(`${layer}:${reason}`) });
		await settle();
		await page.getByTestId('outer-button').click();
		expect(calls).toEqual([]);
		await userEvent.keyboard('{Escape}');
		await page.getByTestId('outside').click();
		expect(calls).toEqual(['outer:escape', 'outer:pointer-outside']);
	});

	it('lets only the topmost of nested layers react', async () => {
		const calls: string[] = [];
		render(LayerHarness, {
			nested: true,
			onDismiss: (layer, reason) => calls.push(`${layer}:${reason}`)
		});
		await settle();
		// The inner layer is rendered elsewhere but still counts as inside the outer one.
		const inner = page.getByTestId('inner').element();
		expect(page.getByTestId('outer').element().contains(inner)).toBe(false);
		await page.getByTestId('inner-button').click();
		expect(calls).toEqual([]);
		await userEvent.keyboard('{Escape}');
		await page.getByTestId('outer-button').click();
		expect(calls).toEqual(['inner:escape', 'inner:pointer-outside']);
	});
});

describe('Portal', () => {
	it('renders into the ThemeProvider, keeping the theme and the contexts', async () => {
		const props = $state({ text: 'first' });
		render(PortalHarness, props);
		const ported = page.getByTestId('ported');
		await expect.element(ported).toHaveTextContent('first');
		const element = ported.element();
		expect(page.getByTestId('origin').element().contains(element)).toBe(false);
		expect(element.closest('.oito2-portal-host')).not.toBeNull();
		const primary = createColorTheme({ brightness: 'dark', accent: 'red' }).colorScheme.primary;
		const [r, g, b] = [1, 3, 5].map((i) => Number.parseInt(primary.slice(i, i + 2), 16));
		expect(getComputedStyle(element).color).toBe(`rgb(${r}, ${g}, ${b})`);
		await expect.element(page.getByTestId('context')).toHaveTextContent('from-provider');
		props.text = 'second';
		await expect.element(ported).toHaveTextContent('second');
	});
});

describe('Presence', () => {
	it('keeps an element until its exit animation ends', async () => {
		const props = $state({ open: true, animated: true });
		render(PresenceHarness, props);
		await expect.element(page.getByTestId('panel')).toBeInTheDocument();
		props.open = false;
		await expect.element(page.getByTestId('panel')).toHaveAttribute('data-state', 'closed');
		await expect.element(page.getByTestId('panel')).not.toBeInTheDocument();
		props.open = true;
		await expect.element(page.getByTestId('panel')).toHaveAttribute('data-state', 'open');
	});

	it('removes an element after its exit animation while the main thread is busy', async () => {
		const props = $state({ open: true, animated: true });
		render(PresenceHarness, props);
		await expect.element(page.getByTestId('panel')).toBeInTheDocument();
		props.open = false;
		flushSync();
		// The main thread stays busy for longer than the 150 ms exit animation.
		const until = performance.now() + 400;
		while (performance.now() < until) {
			// Blocks the main thread.
		}
		await expect.element(page.getByTestId('panel')).not.toBeInTheDocument();
	});

	it('removes an element without animation at once', async () => {
		const props = $state({ open: true, animated: false });
		render(PresenceHarness, props);
		props.open = false;
		await expect.element(page.getByTestId('panel')).not.toBeInTheDocument();
	});
});

describe('scroll lock and live region', () => {
	it('locks scrolling until every lock is released', () => {
		const releaseA = lockScroll();
		const releaseB = lockScroll();
		expect(document.body.style.overflow).toBe('hidden');
		releaseA();
		releaseA();
		expect(document.body.style.overflow).toBe('hidden');
		releaseB();
		expect(document.body.style.overflow).toBe('');
	});

	it('announces messages in a live region', async () => {
		announce('Copied');
		const region = document.querySelector('[data-oito2-live-region="polite"]');
		expect(region?.getAttribute('aria-live')).toBe('polite');
		await expect.poll(() => region?.textContent).toBe('Copied');
	});
});
