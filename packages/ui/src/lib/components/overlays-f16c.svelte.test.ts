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

import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import OverlaysF16cHarness from '../../tests/OverlaysF16cHarness.svelte';
import { ToasterStore } from './toast/toaster.svelte.js';
import { TourController } from './tour/tour-controller.svelte.js';

/** Returns the element of a locator. */
const el = (locator: { element(): Element }) => locator.element() as HTMLElement;

/** Waits `ms` milliseconds. */
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Whether `element` is inside an inert subtree. */
const inert = (element: Element) => element.closest('[inert]') !== null;

/** Dispatches a touch pointer event of `type` at `x`, `y` on `target`. */
const touch = (target: EventTarget, type: string, x: number, y: number) =>
	target.dispatchEvent(
		new PointerEvent(type, {
			bubbles: true,
			pointerType: 'touch',
			pointerId: 7,
			clientX: x,
			clientY: y
		})
	);

describe('Select', () => {
	it('shows the label of its value without keeping a copy of the options', async () => {
		const props = $state({ show: 'select' as const, fruit: 'c' as string | null });
		render(OverlaysF16cHarness, props);
		const trigger = page.getByRole('combobox', { name: 'Fruit' });
		await expect.element(trigger).toHaveTextContent('Cherry');
		await expect.poll(() => document.querySelectorAll('[role="option"]').length).toBe(0);

		await trigger.click();
		await page.getByRole('option', { name: 'Apple' }).click();
		expect(props.fruit).toBe('a');
		await expect.element(trigger).toHaveTextContent('Apple');
		await expect.poll(() => document.querySelectorAll('[role="option"]').length).toBe(0);

		props.fruit = 'b';
		await expect.element(trigger).toHaveTextContent('Banana');
		await expect.poll(() => document.querySelectorAll('[role="option"]').length).toBe(0);
	});
});

describe('Modal dialog', () => {
	it('makes the page inert, but not the overlays opened from inside it', async () => {
		const props = $state({ show: 'dialog' as const, fruit: null as string | null });
		render(OverlaysF16cHarness, props);
		const outside = el(page.getByTestId('outside'));
		await page.getByRole('button', { name: 'Open dialog' }).click();
		const dialog = page.getByRole('dialog', { name: 'Settings' });
		await expect.element(dialog).toBeInTheDocument();
		expect(inert(outside)).toBe(true);
		expect(inert(el(dialog))).toBe(false);

		el(page.getByRole('combobox', { name: 'Fruit' })).focus();
		await userEvent.keyboard('{Enter}');
		const listbox = page.getByRole('listbox');
		await expect.element(listbox).toBeInTheDocument();
		expect(inert(el(listbox))).toBe(false);
		await userEvent.keyboard('{ArrowDown}{Enter}');
		expect(props.fruit).toBe('Banana');

		await page.getByRole('button', { name: 'Open inner' }).click();
		const inner = page.getByRole('dialog', { name: 'Inner' });
		await expect.element(inner).toBeInTheDocument();
		expect(inert(el(inner))).toBe(false);
		expect(inert(el(dialog))).toBe(true);
		await page.getByRole('button', { name: 'Done' }).click();
		await expect.element(inner).not.toBeInTheDocument();
		expect(inert(el(dialog))).toBe(false);
		expect(inert(outside)).toBe(true);

		await page.getByRole('button', { name: 'Finish' }).click();
		await expect.element(dialog).not.toBeInTheDocument();
		expect(inert(outside)).toBe(false);
		await expect.element(page.getByRole('button', { name: 'Open dialog' })).toHaveFocus();
	});
});

describe('Toaster', () => {
	it('alerts a danger toast and shows its own number of toasts', async () => {
		const store = new ToasterStore();
		render(OverlaysF16cHarness, { show: 'toast', store });
		store.show({ title: 'Failed', type: 'danger', duration: null });
		store.show({ title: 'Saved', duration: null });
		await expect.element(page.getByRole('alert')).toHaveTextContent('Failed');
		await expect.element(page.getByText('Saved')).not.toBeInTheDocument();
		expect(store.maxVisible).toBe(3);
	});

	it('pauses the timers while the page is hidden', async () => {
		const store = new ToasterStore();
		render(OverlaysF16cHarness, { show: 'toast', store });
		const hide = (hidden: boolean) => {
			Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
			document.dispatchEvent(new Event('visibilitychange'));
		};
		try {
			hide(true);
			store.show({ title: 'Saved', duration: 100 });
			await wait(300);
			await expect.element(page.getByText('Saved')).toBeInTheDocument();
			hide(false);
			await expect.element(page.getByText('Saved')).not.toBeInTheDocument();
		} finally {
			Reflect.deleteProperty(document, 'hidden');
		}
	});
});

describe('Hover card and popover', () => {
	it('adds the card to the description of the link and removes only it', async () => {
		render(OverlaysF16cHarness, { show: 'hover-card' });
		const link = el(page.getByRole('link', { name: '@ana' }));
		link.focus();
		await expect.element(page.getByText('Ana Souza, designer')).toBeVisible();
		const ids = (link.getAttribute('aria-describedby') ?? '').split(' ');
		expect(ids[0]).toBe('hint');
		expect(ids).toHaveLength(2);
		link.blur();
		await expect.element(page.getByText('Ana Souza, designer')).not.toBeInTheDocument();
		expect(link.getAttribute('aria-describedby')).toBe('hint');
	});

	it('gives the popover panel the role it is given', async () => {
		render(OverlaysF16cHarness, { show: 'hover-card' });
		await page.getByRole('button', { name: 'Links' }).click();
		await expect.element(page.getByRole('group', { name: 'Links' })).toBeVisible();
	});
});

describe('Context menu', () => {
	it('opens on a long press that moves a little, not on one that moves away', async () => {
		render(OverlaysF16cHarness, { show: 'context-menu' });
		const area = el(page.getByRole('button', { name: 'Canvas' }));
		const box = area.getBoundingClientRect();
		const x = box.left + 40;
		const y = box.top + 40;

		touch(area, 'pointerdown', x, y);
		touch(area, 'pointermove', x + 30, y);
		await wait(650);
		expect(document.querySelector('[role="menu"]')).toBeNull();
		touch(area, 'pointerup', x + 30, y);

		touch(area, 'pointerdown', x, y);
		touch(area, 'pointermove', x + 4, y + 3);
		await wait(650);
		await expect.element(page.getByRole('menuitem', { name: 'Copy' })).toBeInTheDocument();
	});
});

describe('Tour', () => {
	it('focuses the skip button on a step that waits for a tap', async () => {
		const tour = new TourController([
			{ title: 'Tap it', target: '#tour-target', waitForTap: true },
			{ title: 'Next one' }
		]);
		render(OverlaysF16cHarness, { show: 'tour', tour });
		tour.start();
		await expect.element(page.getByRole('dialog', { name: 'Tap it' })).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Skip tour' })).toHaveFocus();
		expect(document.querySelector('.oito2-tour-card .foot button')).toBeNull();
		el(page.getByRole('button', { name: 'Target' })).click();
		await expect.element(page.getByRole('dialog', { name: 'Next one' })).toBeVisible();
	});
});

describe('FloatingPanel', () => {
	it('stops a drag when the panel goes away', async () => {
		const props = $state({ show: 'panel' as const, panel: true, log: [] as string[] });
		render(OverlaysF16cHarness, props);
		const grip = document.querySelector('.oito2-floating-panel .grip') as HTMLElement;
		grip.dispatchEvent(
			new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerId: 9, clientX: 0 })
		);
		props.panel = false;
		await tick();
		window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 9, clientX: 80 }));
		expect(props.log).toEqual([]);
	});
});
