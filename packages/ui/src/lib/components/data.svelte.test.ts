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

import { el, wait } from '@oito2/ui-test-utils';
import axe from 'axe-core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import DataGallery from '../../tests/DataGallery.svelte';
import DataHarness from '../../tests/DataHarness.svelte';
import { TreeCollection, type TreeNode } from '../collections/tree-collection.js';
import { TimerController } from './timer/timer-controller.svelte.js';
import { TreeController } from './tree/tree-controller.svelte.js';

const files = () =>
	TreeCollection.fromPaths([
		'src/lib/index.ts',
		'src/lib/button.svelte',
		'src/routes/+page.svelte',
		'package.json',
		'README.md'
	]);
const row = (name: string) => page.getByRole('treeitem', { name, exact: true });
const option = (name: string) => page.getByRole('option', { name, exact: true });

/** Makes `prefers-reduced-motion: reduce` match until `restoreMotion` runs. */
const originalMatchMedia = window.matchMedia;
function reduceMotion(): void {
	window.matchMedia = (query: string) => {
		if (!query.includes('prefers-reduced-motion'))
			return originalMatchMedia.call(window, query);
		return {
			matches: true,
			media: query,
			onchange: null,
			addEventListener: () => {},
			removeEventListener: () => {},
			addListener: () => {},
			removeListener: () => {},
			dispatchEvent: () => false
		} as MediaQueryList;
	};
}
afterEach(() => {
	window.matchMedia = originalMatchMedia;
});

describe('ListBox', () => {
	it('moves, selects, jumps by typing and activates in a single-selection list', async () => {
		const log: string[] = [];
		const props = $state({ show: 'list-box', values: [] as readonly string[], log });
		render(DataHarness, props);
		const list = page.getByRole('listbox', { name: 'Fruits' });
		el(list).focus();
		await expect.element(list).toHaveAttribute('aria-activedescendant', el(option('Apple')).id);
		await userEvent.keyboard('{ArrowDown}');
		// The disabled pear is skipped.
		await expect.element(option('Quince')).toHaveAttribute('aria-selected', 'true');
		expect(props.values).toEqual(['quince']);
		await userEvent.keyboard('{End}');
		await expect.element(option('Plum')).toHaveAttribute('aria-selected', 'true');
		await userEvent.keyboard('c');
		await expect.element(option('Cherry')).toHaveAttribute('aria-selected', 'true');
		await userEvent.keyboard('{Enter}');
		expect(props.log).toEqual(['activate:cherry']);
		await expect.element(page.getByRole('group', { name: 'Drupe' })).toBeVisible();
		await option('Pear').click({ force: true });
		await expect.element(option('Pear')).toHaveAttribute('aria-selected', 'false');
	});

	it('extends, toggles and selects all in a multiple-selection list', async () => {
		const log: string[] = [];
		const props = $state({
			show: 'list-box',
			mode: 'multiple' as const,
			values: [] as readonly string[],
			log
		});
		render(DataHarness, props);
		await expect
			.element(page.getByRole('listbox', { name: 'Fruits' }))
			.toHaveAttribute('aria-multiselectable', 'true');
		await option('Apple').click();
		await userEvent.keyboard('{Shift>}');
		await option('Peach').click();
		await userEvent.keyboard('{/Shift}');
		expect(props.values).toEqual(['apple', 'quince', 'cherry', 'peach']);
		await userEvent.keyboard('{Control>}');
		await option('Cherry').click();
		await userEvent.keyboard('{/Control}');
		expect(props.values).toEqual(['apple', 'quince', 'peach']);
		// The anchor is Cherry, the last value toggled.
		await userEvent.keyboard('{ArrowDown}{Shift>}{ArrowDown}{/Shift}');
		expect(props.values).toEqual(['cherry', 'peach', 'plum']);
		await userEvent.keyboard(' ');
		expect(props.values).toEqual(['cherry', 'peach']);
		await userEvent.keyboard('{Control>}a{/Control}');
		expect(props.values).toEqual(['apple', 'quince', 'cherry', 'peach', 'plum']);
		await option('Plum').dblClick();
		expect(props.log).toContain('activate:plum');
	});

	it('renders custom parts and the empty state', async () => {
		render(DataHarness, { show: 'list-box-parts' });
		await expect.element(page.getByRole('group', { name: 'Favorites' })).toBeVisible();
		await option('Cherry 🍒').click();
		await expect.element(page.getByText('cherry', { exact: true })).toBeVisible();
		await expect.element(option('Plum')).toHaveAttribute('aria-selected', 'false');
		// A multiple-selection list keeps room for the check mark of every row.
		expect(el(option('Plum')).querySelector('svg')).not.toBeNull();
	});

	it('shows the empty content when there are no items', async () => {
		render(DataHarness, { show: 'list-box-empty' });
		await expect.element(page.getByText('No fruits')).toBeVisible();
	});
});

describe('TreeView', () => {
	it('follows the APG tree keyboard pattern', async () => {
		const log: string[] = [];
		render(DataHarness, { show: 'tree', tree: files(), log });
		const tree = page.getByRole('tree', { name: 'Files' });
		el(tree).focus();
		await expect.element(tree).toHaveAttribute('aria-activedescendant', el(row('src')).id);
		await expect.element(row('src')).toHaveAttribute('aria-expanded', 'false');
		await expect.element(row('src')).toHaveAttribute('aria-level', '1');
		await expect.element(row('README.md')).toHaveAttribute('aria-posinset', '3');
		await expect.element(row('README.md')).toHaveAttribute('aria-setsize', '3');
		await userEvent.keyboard('{ArrowRight}');
		await expect.element(row('src')).toHaveAttribute('aria-expanded', 'true');
		await userEvent.keyboard('{ArrowRight}');
		await expect.element(row('lib')).toHaveAttribute('aria-selected', 'true');
		await expect.element(row('lib')).toHaveAttribute('aria-level', '2');
		await userEvent.keyboard('{ArrowLeft}');
		await expect.element(row('src')).toHaveAttribute('aria-selected', 'true');
		await userEvent.keyboard('{ArrowLeft}');
		await expect.element(row('lib')).not.toBeInTheDocument();
		await userEvent.keyboard('{Enter}');
		await expect.element(row('src')).toHaveAttribute('aria-expanded', 'true');
		await userEvent.keyboard('{End}');
		await expect.element(row('README.md')).toHaveAttribute('aria-selected', 'true');
		await userEvent.keyboard('{Home}p');
		await expect.element(row('package.json')).toHaveAttribute('aria-selected', 'true');
		await row('routes').dblClick();
		await expect.element(row('+page.svelte')).toBeVisible();
	});

	it('opens with the reading arrows in right-to-left layouts', async () => {
		render(DataHarness, { show: 'tree', tree: files(), dir: 'rtl' });
		el(page.getByRole('tree')).focus();
		await userEvent.keyboard('{ArrowLeft}');
		await expect.element(row('src')).toHaveAttribute('aria-expanded', 'true');
		await userEvent.keyboard('{ArrowRight}');
		await expect.element(row('src')).toHaveAttribute('aria-expanded', 'false');
	});

	it('cascades check boxes and shows the mixed state', async () => {
		const controller = new TreeController({ expanded: ['src', 'src/lib'] });
		render(DataHarness, { show: 'tree', tree: files(), controller, checkable: true });
		const lib = el(row('lib'));
		(lib.querySelector('.oito2-tree-view-check') as HTMLElement).click();
		await expect.element(row('lib')).toHaveAttribute('aria-checked', 'true');
		await expect.element(row('src')).toHaveAttribute('aria-checked', 'mixed');
		expect([...controller.checked].sort()).toEqual([
			'src/lib/button.svelte',
			'src/lib/index.ts'
		]);
		await row('src').click();
		await userEvent.keyboard(' ');
		await expect.element(row('src')).toHaveAttribute('aria-checked', 'true');
		await expect.element(row('+page.svelte')).not.toBeInTheDocument();
		await userEvent.keyboard(' ');
		await expect.element(row('src')).toHaveAttribute('aria-checked', 'false');
	});

	it('extends and selects all in a multiple-selection tree', async () => {
		const controller = new TreeController({ selectionMode: 'multiple', expanded: ['src'] });
		render(DataHarness, { show: 'tree', tree: files(), controller });
		await row('src').click();
		await userEvent.keyboard('{Shift>}{ArrowDown}{ArrowDown}{/Shift}');
		expect([...controller.selected]).toEqual(['src', 'src/lib', 'src/routes']);
		await userEvent.keyboard('{Control>}');
		await row('lib').click();
		await userEvent.keyboard('{/Control}');
		expect([...controller.selected]).toEqual(['src', 'src/routes']);
		await userEvent.keyboard('{Control>}a{/Control}');
		expect(controller.selected.size).toBe(5);
	});

	it('filters to the matches and their ancestors', async () => {
		const props = $state({ show: 'tree', tree: files(), query: 'button' });
		render(DataHarness, props);
		await expect.element(row('button.svelte')).toBeVisible();
		await expect.element(row('src')).toHaveAttribute('aria-expanded', 'true');
		await expect.element(row('README.md')).not.toBeInTheDocument();
		expect(el(row('button.svelte')).querySelector('mark')?.textContent).toBe('button');
		props.query = '';
		await expect.element(row('README.md')).toBeVisible();
		await expect.element(row('button.svelte')).not.toBeInTheDocument();
	});

	it('renames with F2 and cancels with Escape', async () => {
		const log: string[] = [];
		const props = $state({ show: 'tree', tree: files(), log });
		render(DataHarness, props);
		await row('README.md').click();
		await userEvent.keyboard('{F2}');
		const field = page.getByRole('textbox');
		await expect.element(field).toHaveFocus();
		await userEvent.keyboard('{Control>}a{/Control}NOTES.md{Enter}');
		expect(props.log).toEqual(['rename:README.md:NOTES.md']);
		await expect.element(row('NOTES.md')).toBeVisible();
		await expect.element(page.getByRole('tree')).toHaveFocus();
		await userEvent.keyboard('{F2}x{Escape}');
		expect(props.log).toHaveLength(1);
		await expect.element(row('NOTES.md')).toBeVisible();
	});

	it('loads the children of an empty branch once, and retries after a failure', async () => {
		const log: string[] = [];
		let fail = true;
		let release = () => {};
		const loadChildren = (node: TreeNode<unknown>) =>
			new Promise<TreeNode<unknown>[]>((resolve, reject) => {
				release = () => {
					if (fail) reject(new Error('offline'));
					else resolve([{ value: `${node.value}/child`, label: 'child' }]);
				};
			});
		const tree = new TreeCollection([{ value: 'remote', children: [] }]);
		render(DataHarness, { show: 'tree', tree, loadChildren, log });
		await row('remote').click();
		await userEvent.keyboard('{ArrowRight}');
		await expect.element(page.getByRole('progressbar', { name: 'Loading' })).toBeVisible();
		await expect.element(row('remote')).toHaveAttribute('aria-busy', 'true');
		release();
		await expect.element(row('remote')).toHaveAttribute('aria-expanded', 'false');
		expect(log).toEqual(['error:remote:Error: offline']);
		fail = false;
		await userEvent.keyboard('{ArrowRight}');
		release();
		await expect.element(row('child')).toBeVisible();
		await userEvent.keyboard('{ArrowLeft}{ArrowRight}');
		await expect.element(page.getByRole('progressbar')).not.toBeInTheDocument();
	});

	it('renders only the rows in view of a tree with 10 000 nodes', async () => {
		const roots = Array.from({ length: 100 }, (_, b) => ({
			value: `b${b}`,
			label: `Branch ${b}`,
			children: Array.from({ length: 99 }, (_, l) => ({
				value: `b${b}/l${l}`,
				label: `Leaf ${b}.${l}`
			}))
		}));
		const tree = new TreeCollection(roots);
		const controller = new TreeController({ expanded: roots.map((root) => root.value) });
		render(DataHarness, { show: 'tree', tree, controller });
		const view = el(page.getByRole('tree'));
		await expect.element(row('Branch 0')).toBeVisible();
		expect(view.querySelectorAll('[role="treeitem"]').length).toBeLessThan(40);
		view.focus();
		await userEvent.keyboard('{End}');
		await expect.element(row('Leaf 99.98')).toHaveAttribute('aria-selected', 'true');
		expect(view.scrollTop).toBeGreaterThan(300_000);
		expect(view.querySelectorAll('[role="treeitem"]').length).toBeLessThan(40);
		await expect.element(row('Branch 0')).not.toBeInTheDocument();
		await userEvent.keyboard('{Home}');
		await expect.element(row('Branch 0')).toHaveAttribute('aria-selected', 'true');
	});
});

describe('JsonTreeView', () => {
	it('shows keys, values and sizes, and opens new data to the depth again', async () => {
		const props = $state({
			show: 'json',
			data: { name: 'oito2', stars: 42, tags: ['ui'] } as unknown
		});
		render(DataHarness, props);
		await expect.element(row('name: "oito2"')).toBeVisible();
		await expect.element(row('stars: 42')).toBeVisible();
		await expect.element(row('tags [1]')).toBeVisible();
		await expect.element(row('0: "ui"')).toBeVisible();
		props.data = { z: { w: 1 } };
		await expect.element(row('w: 1')).toBeVisible();
	});
});

describe('Avatar', () => {
	it('shows initials, reads the name and status, and counts the hidden members', async () => {
		render(DataHarness, { show: 'avatar', src: 'data:image/png;base64,broken' });
		await expect.element(page.getByRole('img', { name: 'Ana Souza, Busy' })).toBeVisible();
		await expect.element(page.getByText('AS').first()).toBeVisible();
		await expect.element(page.getByRole('group', { name: 'Members' })).toBeVisible();
		await expect.element(page.getByRole('img', { name: '1 more' })).toHaveTextContent('+1');
	});
});

describe('Marquee', () => {
	it('keeps content that fits still and scrolls content that overflows', async () => {
		const props = $state({ show: 'marquee', text: 'Short', width: 200 });
		render(DataHarness, props);
		const marquee = page.getByTestId('marquee');
		await expect.element(marquee).not.toHaveAttribute('data-overflows');
		props.text = 'A long headline that does not fit in the space it has';
		await expect.element(marquee).toHaveAttribute('data-overflows', '');
		const copies = el(marquee).querySelectorAll('.oito2-marquee-content');
		expect(copies.length).toBe(2);
		expect(copies[1]?.getAttribute('aria-hidden')).toBe('true');
		const track = el(marquee).querySelector('.oito2-marquee-track') as HTMLElement;
		await expect.poll(() => track.getAnimations()[0]?.playState).toBe('running');
		await userEvent.hover(marquee);
		await expect.poll(() => track.getAnimations()[0]?.playState).toBe('paused');
	});

	it('stays still when the user prefers reduced motion', async () => {
		reduceMotion();
		render(DataHarness, {
			show: 'marquee',
			text: 'A long headline that does not fit in the space it has'
		});
		const marquee = page.getByTestId('marquee');
		await expect.element(marquee).toHaveAttribute('data-overflows', '');
		await wait(100);
		const track = el(marquee).querySelector('.oito2-marquee-track') as HTMLElement;
		expect(track.getAnimations()).toHaveLength(0);
	});
});

describe('AnimatedIcon', () => {
	it('draws itself in over time', async () => {
		render(DataHarness, { show: 'animated-icon' });
		const icon = page.getByRole('img', { name: 'Done' });
		await expect
			.poll(() => el(icon).querySelectorAll('path[stroke-dasharray]').length)
			.toBeGreaterThan(0);
		await expect
			.poll(
				() =>
					el(icon).querySelectorAll('path').length -
					el(icon).querySelectorAll('path[stroke-dasharray]').length,
				{ timeout: 2000 }
			)
			.toBe(2);
	});

	it('starts at the final frame under reduced motion', async () => {
		reduceMotion();
		render(DataHarness, { show: 'animated-icon' });
		const icon = el(page.getByRole('img', { name: 'Done' }));
		expect(icon.querySelectorAll('path').length).toBe(2);
		expect(icon.querySelectorAll('path[stroke-dasharray]').length).toBe(0);
	});
});

describe('TimerText', () => {
	it('shows the remaining time of a countdown, rounded up', async () => {
		let now = 0;
		const timer = new TimerController({ countdown: 5000, interval: 10, now: () => now });
		render(DataHarness, { show: 'timer', timer });
		const text = page.getByTestId('timer');
		await expect.element(text).toHaveTextContent('0:05');
		timer.start();
		now = 1500;
		await expect.element(text).toHaveTextContent('0:04');
		now = 5000;
		await expect.element(text).toHaveTextContent('0:00');
		await expect.poll(() => timer.isCompleted).toBe(true);
		timer.dispose();
	});
});

describe('draggable and undershoot', () => {
	it('moves with the arrow keys and the pointer', async () => {
		const props = $state({
			show: 'draggable',
			position: null as { x: number; y: number } | null
		});
		render(DataHarness, props);
		const note = el(page.getByTestId('note'));
		expect(note.style.left).toBe('10px');
		note.focus();
		await userEvent.keyboard('{ArrowRight}{ArrowDown}');
		expect(props.position).toEqual({ x: 18, y: 28 });
		const box = note.getBoundingClientRect();
		const pointer = (type: string, x: number, y: number) =>
			note.dispatchEvent(
				new PointerEvent(type, {
					bubbles: true,
					pointerId: 7,
					button: 0,
					clientX: x,
					clientY: y
				})
			);
		pointer('pointerdown', box.left + 5, box.top + 5);
		pointer('pointermove', box.left + 35, box.top + 15);
		pointer('pointerup', box.left + 35, box.top + 15);
		expect(props.position).toEqual({ x: 48, y: 38 });
		expect(note.style.top).toBe('38px');
	});

	it('shows the edge shadows while content lies beyond them', async () => {
		render(DataHarness, { show: 'undershoot' });
		const scroller = el(page.getByTestId('scroller'));
		await expect.element(scroller).toHaveAttribute('data-oito2-undershoot-end', '');
		expect(scroller.hasAttribute('data-oito2-undershoot-start')).toBe(false);
		scroller.scrollTop = 100;
		await expect.element(scroller).toHaveAttribute('data-oito2-undershoot-start', '');
		scroller.scrollTop = scroller.scrollHeight;
		await expect.poll(() => scroller.hasAttribute('data-oito2-undershoot-end')).toBe(false);
	});
});

const schemes = [
	{ name: 'light', mode: 'light', highContrast: false },
	{ name: 'dark', mode: 'dark', highContrast: false },
	{ name: 'light-hc', mode: 'light', highContrast: true }
] as const;

describe('data gallery', () => {
	beforeEach(async () => {
		await page.viewport(880, 600);
	});

	for (const scheme of schemes) {
		it(`has no axe violations in ${scheme.name}`, async () => {
			render(DataGallery, { mode: scheme.mode, highContrast: scheme.highContrast });
			await document.fonts.ready;
			await wait(400);
			const result = await axe.run(page.getByTestId('gallery').element());
			const violations = result.violations.map(
				(v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`
			);
			expect(violations).toEqual([]);
		});

		it(`matches the golden in ${scheme.name}`, async () => {
			render(DataGallery, { mode: scheme.mode, highContrast: scheme.highContrast });
			await document.fonts.ready;
			await wait(400);
			await expect(page.getByTestId('gallery')).toMatchScreenshot(`data-${scheme.name}`);
		});
	}
});
