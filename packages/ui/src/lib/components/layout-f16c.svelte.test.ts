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

import { el, frames } from '@oito2/ui-test-utils';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import LayoutF16cHarness from '../../tests/LayoutF16cHarness.svelte';

/** Focuses the button before the component and presses Tab. */
async function tabIn() {
	el(page.getByRole('button', { name: 'Before' })).focus();
	await userEvent.tab();
}

describe('TreeView', () => {
	it('shows the active row when it gets the focus by Tab', async () => {
		render(LayoutF16cHarness, { show: 'tree' });
		await tabIn();
		const tree = page.getByRole('tree', { name: 'Files' });
		await expect.element(tree).toHaveFocus();
		await expect.element(tree).toHaveAttribute('data-keyboard', '');
		const row = page.getByRole('treeitem', { name: 'Alpha' });
		await expect.element(row).toHaveAttribute('data-active', '');
		expect(getComputedStyle(el(row)).outlineStyle).toBe('solid');
	});

	it('opens every branch at the level of the active row with *', async () => {
		render(LayoutF16cHarness, { show: 'tree' });
		await tabIn();
		await userEvent.keyboard('*');
		await expect
			.element(page.getByRole('treeitem', { name: 'Alpha', exact: true }))
			.toHaveAttribute('aria-expanded', 'true');
		await expect
			.element(page.getByRole('treeitem', { name: 'Beta', exact: true }))
			.toHaveAttribute('aria-expanded', 'true');
		await expect.element(page.getByRole('treeitem', { name: 'Beta one' })).toBeInTheDocument();
	});
});

describe('JsonTreeView', () => {
	it('shows an object inside itself as a circular leaf', async () => {
		const data: Record<string, unknown> = { name: 'a' };
		data.self = data;
		render(LayoutF16cHarness, { show: 'json', data });
		await expect
			.element(page.getByRole('treeitem', { name: /self/ }))
			.toHaveTextContent('self: [Circular]');
	});
});

describe('ListBox', () => {
	it('shows the active row when it gets the focus by Tab', async () => {
		render(LayoutF16cHarness, { show: 'list-box' });
		await tabIn();
		const list = page.getByRole('listbox', { name: 'Fruits' });
		await expect.element(list).toHaveFocus();
		await expect.element(list).toHaveAttribute('data-keyboard', '');
	});

	it('names a group only by a label it has', async () => {
		render(LayoutF16cHarness, { show: 'list-box' });
		await expect.element(page.getByTestId('unnamed')).not.toHaveAttribute('aria-labelledby');
		await expect
			.element(page.getByTestId('named'))
			.toHaveAttribute('aria-labelledby', el(page.getByTestId('label')).id);
		await expect.element(page.getByRole('group', { name: 'Soft' })).toBeInTheDocument();
	});
});

describe('Carousel', () => {
	it('pauses and restarts the rotation with Carousel.PlayPause', async () => {
		const props = $state({ show: 'carousel' as const, log: [] as string[] });
		render(LayoutF16cHarness, props);
		const viewport = el(page.getByTestId('frame')).firstElementChild as HTMLElement;
		await expect.element(viewport).toHaveAttribute('aria-live', 'off');
		await page.getByRole('button', { name: 'Pause automatic rotation' }).click();
		await expect
			.element(page.getByRole('button', { name: 'Start automatic rotation' }))
			.toBeInTheDocument();
		expect(props.log).toEqual(['click', 'playing:false']);
		// Moves the pointer and the focus out of the carousel, which hold the rotation too.
		await page.getByRole('button', { name: 'Before' }).click();
		// Headless WebKit neither focuses a clicked button nor reports the pointer leaving,
		// so both are done by hand.
		el(page.getByRole('button', { name: 'Before' })).focus();
		viewport.closest('.oito2-carousel')?.dispatchEvent(new PointerEvent('pointerleave'));
		await expect.element(viewport).toHaveAttribute('aria-live', 'polite');
		await page.getByRole('button', { name: 'Start automatic rotation' }).click();
		expect(props.log).toEqual(['click', 'playing:false', 'click', 'playing:true']);
		await page.getByRole('button', { name: 'Before' }).click();
		// Headless WebKit neither focuses a clicked button nor reports the pointer leaving,
		// so both are done by hand.
		el(page.getByRole('button', { name: 'Before' })).focus();
		viewport.closest('.oito2-carousel')?.dispatchEvent(new PointerEvent('pointerleave'));
		await expect.element(viewport).toHaveAttribute('aria-live', 'off');
	});

	it('follows a controlled playing state', async () => {
		const props = $state({ show: 'carousel' as const, playing: false });
		render(LayoutF16cHarness, props);
		await expect
			.element(page.getByRole('button', { name: 'Start automatic rotation' }))
			.toBeInTheDocument();
		props.playing = true;
		await expect
			.element(page.getByRole('button', { name: 'Pause automatic rotation' }))
			.toBeInTheDocument();
	});

	it('stops rotating while the document is hidden', async () => {
		render(LayoutF16cHarness, { show: 'carousel' });
		const viewport = el(page.getByTestId('frame')).firstElementChild as HTMLElement;
		await expect.element(viewport).toHaveAttribute('aria-live', 'off');
		Object.defineProperty(document, 'hidden', { value: true, configurable: true });
		try {
			document.dispatchEvent(new Event('visibilitychange'));
			await expect.element(viewport).toHaveAttribute('aria-live', 'polite');
		} finally {
			delete (document as { hidden?: boolean }).hidden;
			document.dispatchEvent(new Event('visibilitychange'));
		}
		await expect.element(viewport).toHaveAttribute('aria-live', 'off');
	});
});

describe('Marquee', () => {
	it('stops while paused', async () => {
		const props = $state({ show: 'marquee' as const, paused: true });
		render(LayoutF16cHarness, props);
		const marquee = el(page.getByTestId('marquee'));
		await expect.element(marquee).toHaveAttribute('data-overflows', '');
		const animation = () => marquee.firstElementChild?.getAnimations()[0];
		await expect.poll(() => animation()?.playState).toBe('paused');
		props.paused = false;
		await expect.poll(() => animation()?.playState).toBe('running');
	});
});

describe('Splitter', () => {
	it('reports the sizes when it resizes and when a limit changes', async () => {
		const props = $state({
			show: 'splitter' as const,
			log: [] as string[],
			width: 401,
			minSize: 48
		});
		render(LayoutF16cHarness, props);
		await frames();
		expect(props.log).toEqual([]);
		props.width = 801;
		await expect.poll(() => props.log).toEqual(['400,400']);
		props.minSize = 600;
		await expect.poll(() => props.log).toEqual(['400,400', '600,200']);
	});
});

describe('ScrollArea', () => {
	it('names its focusable viewport as a region', async () => {
		render(LayoutF16cHarness, { show: 'scroll' });
		const region = page.getByRole('region', { name: 'Log' });
		await expect.element(region).toHaveAttribute('tabindex', '0');
		await expect.element(page.getByTestId('scroll')).not.toHaveAttribute('aria-label');
	});
});

describe('PanedView', () => {
	it('starts at its pane size before it is measured', () => {
		render(LayoutF16cHarness, { show: 'paned' });
		const pane = page.getByText('Pane').element().closest('.pane') as HTMLElement;
		expect(pane.style.flex).toBe('0 0 300px');
	});
});

describe('TableOfContents', () => {
	it('focuses the picked heading and sets the URL fragment', async () => {
		const before = location.href;
		render(LayoutF16cHarness, { show: 'toc' });
		try {
			await page.getByRole('link', { name: 'Second' }).click();
			await expect.element(page.getByRole('heading', { name: 'Second' })).toHaveFocus();
			expect(location.hash).toBe('#f16c-second');
		} finally {
			history.replaceState(history.state, '', before);
		}
	});
});

describe('NavigationPage', () => {
	it('follows a density changed on an ancestor', async () => {
		const props = $state({
			show: 'navigation' as const,
			density: 'pointer' as 'pointer' | 'touch'
		});
		render(LayoutF16cHarness, props);
		const nav = page.getByRole('navigation', { name: 'Main' });
		await expect.element(nav).toHaveClass('oito2-navigation-rail');
		props.density = 'touch';
		await expect.element(nav).toHaveClass('oito2-navigation-bar');
	});
});
