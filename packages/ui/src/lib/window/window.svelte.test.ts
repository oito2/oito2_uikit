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

import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { FakeWindowController } from '../../tests/fake-window-controller.svelte.js';
import WindowHarness from '../../tests/WindowHarness.svelte';
import { Platform, type OperatingSystem } from '../foundation/platform.js';
import { fallbackSystemSettings } from '../foundation/system-settings.js';
import { WindowButtonLayout, type WindowControlStyle } from '../foundation/window-button-layout.js';

/** Returns system settings for a native desktop with the given controls. */
function desktop(
	os: OperatingSystem,
	style?: WindowControlStyle,
	layout?: WindowButtonLayout,
	isWeb = false
) {
	const settings = fallbackSystemSettings(new Platform({ os, isWeb }));
	return {
		...settings,
		windowControlStyle: style ?? settings.windowControlStyle,
		windowButtonLayout: layout ?? settings.windowButtonLayout
	};
}

/** Returns the accessible names of the window control buttons, in order. */
function controls(): string[] {
	return [...document.querySelectorAll('.oito2-window-control')].map(
		(button) => button.getAttribute('aria-label') ?? ''
	);
}

describe('window title bars', () => {
	it('follows the desktop layout and acts on the window', async () => {
		const controller = new FakeWindowController();
		const layout = new WindowButtonLayout({
			leading: ['close'],
			trailing: ['minimize', 'maximize']
		});
		render(WindowHarness, {
			kind: 'window',
			settings: desktop('linux', 'breeze', layout),
			controller
		});
		await expect.element(page.getByRole('heading', { name: 'Files' })).toBeInTheDocument();
		expect(controls()).toEqual(['Close', 'Minimize', 'Maximize']);
		const bar = document.querySelector('.oito2-title-bar') as HTMLElement;
		expect(bar.dataset.controlStyle).toBe('breeze');
		await page.getByRole('button', { name: 'Maximize' }).click();
		await expect.element(page.getByRole('button', { name: 'Restore' })).toBeInTheDocument();
		await page.getByRole('button', { name: 'Minimize' }).click();
		await page.getByRole('button', { name: 'Close' }).click();
		expect(controller.calls).toEqual(['toggleMaximize', 'minimize', 'close']);
		// Native buttons are not Tab stops.
		expect(
			(page.getByRole('button', { name: 'Close' }).element() as HTMLElement).tabIndex
		).toBe(-1);
	});

	it('moves, maximizes and opens the menu from the empty background only', async () => {
		const controller = new FakeWindowController();
		render(WindowHarness, { kind: 'title', settings: desktop('linux'), controller });
		const title = page.getByRole('heading', { name: 'Files' });
		await title.click();
		expect(controller.calls).toEqual(['startDrag']);
		await title.dblClick();
		expect(controller.calls).toContain('toggleMaximize');
		controller.calls.length = 0;
		await page.getByRole('button', { name: 'Action' }).click();
		expect(controller.calls).toEqual([]);
		const bar = document.querySelector('.oito2-title-bar') as HTMLElement;
		const box = bar.getBoundingClientRect();
		await userEvent.click(bar, { button: 'right', position: { x: 60, y: box.height / 2 } });
		expect(controller.calls).toEqual([`showMenu 60,${Math.round(box.height / 2)}`]);
	});

	it('shows no controls and does not drag in a browser', async () => {
		const controller = new FakeWindowController();
		render(WindowHarness, {
			kind: 'window',
			settings: desktop('linux', 'gnome', undefined, true),
			controller
		});
		await expect.element(page.getByRole('heading', { name: 'Files' })).toBeInTheDocument();
		expect(controls()).toEqual([]);
		await page.getByRole('heading', { name: 'Files' }).click();
		expect(controller.calls).toEqual([]);
	});

	it('leaves the macOS traffic lights to the system', async () => {
		const controller = new FakeWindowController();
		render(WindowHarness, { kind: 'window', settings: desktop('macos'), controller });
		await expect.element(page.getByRole('heading', { name: 'Files' })).toBeInTheDocument();
		expect(controls()).toEqual([]);
		const start = document.querySelector('.oito2-title-bar .start') as HTMLElement;
		expect(start.style.paddingInlineStart).toBe('72px');
		controller.state = { ...controller.state, isFullScreen: true };
		await expect.poll(() => start.style.paddingInlineStart).toBe('0px');
	});

	it('fades its content while the window is inactive', async () => {
		const controller = new FakeWindowController();
		render(WindowHarness, { kind: 'window', settings: desktop('windows'), controller });
		const bar = document.querySelector('.oito2-title-bar') as HTMLElement;
		expect(bar.hasAttribute('data-inactive')).toBe(false);
		expect(controls()).toEqual(['Minimize', 'Maximize', 'Close']);
		controller.state = { ...controller.state, isActive: false };
		await expect.poll(() => bar.hasAttribute('data-inactive')).toBe(true);
	});

	it('gives dialogs only a close button on the desktop side', async () => {
		const closed: string[] = [];
		const layout = new WindowButtonLayout({ leading: ['close', 'minimize'] });
		render(WindowHarness, {
			kind: 'dialog',
			settings: desktop('linux', 'gnome', layout),
			controller: new FakeWindowController(),
			onClose: () => closed.push('close')
		});
		expect(controls()).toEqual(['Close']);
		const start = document.querySelector('.oito2-title-bar .start') as HTMLElement;
		expect(start.querySelector('.oito2-window-control')).not.toBeNull();
		await page.getByRole('button', { name: 'Close' }).click();
		expect(closed).toEqual(['close']);
	});

	it('swaps the title for a search field and back', async () => {
		const props = $state({
			kind: 'header' as const,
			settings: desktop('linux'),
			controller: new FakeWindowController() as FakeWindowController | null,
			searchActive: false
		});
		render(WindowHarness, props);
		const toggle = page.getByRole('button', { name: 'Search' });
		await toggle.click();
		expect(props.searchActive).toBe(true);
		const field = page.getByRole('searchbox', { name: 'Search' });
		await expect.element(field).toHaveFocus();
		await userEvent.keyboard('{Escape}');
		expect(props.searchActive).toBe(false);
		await expect.element(page.getByRole('heading', { name: 'Files' })).toBeInTheDocument();
		await expect.element(toggle).toHaveFocus();
	});
});
