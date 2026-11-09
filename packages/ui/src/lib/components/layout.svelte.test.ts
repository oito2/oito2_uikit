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
import axe from 'axe-core';
import { beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import LayoutGallery from '../../tests/LayoutGallery.svelte';
import LayoutHarness from '../../tests/LayoutHarness.svelte';
import NavigationHarness from '../../tests/NavigationHarness.svelte';

describe('Tabs', () => {
	it('has one Tab stop and selects with the arrows, skipping disabled tabs', async () => {
		const props = $state({ tab: 'two' });
		render(NavigationHarness, props);
		const tabs = ['One', 'Two', 'Three', 'Four'].map((name) =>
			el(page.getByRole('tab', { name }))
		);
		expect(tabs.map((tab) => tab.tabIndex)).toEqual([-1, 0, -1, -1]);
		tabs[1]?.focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(props.tab).toBe('four');
		await expect.element(page.getByRole('tabpanel')).toHaveTextContent('Panel four');
		await userEvent.keyboard('{Home}');
		expect(props.tab).toBe('one');
		await expect
			.element(page.getByRole('tabpanel'))
			.toHaveAttribute('aria-labelledby', tabs[0]?.id);
	});

	it('reverses the arrows in right-to-left text', async () => {
		const props = $state({ tab: 'one', dir: 'rtl' as const });
		render(NavigationHarness, props);
		el(page.getByRole('tab', { name: 'One' })).focus();
		await userEvent.keyboard('{ArrowLeft}');
		expect(props.tab).toBe('two');
	});
});

describe('Expandable and Accordion', () => {
	it('toggles the content and its expanded state', async () => {
		const props = $state({ expanded: false });
		render(NavigationHarness, props);
		const trigger = page.getByRole('button', { name: 'Details' });
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
		await expect.element(page.getByText('Hidden details')).not.toBeVisible();
		await trigger.click();
		expect(props.expanded).toBe(true);
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
		await expect.element(page.getByRole('region', { name: 'Details' })).toBeVisible();
	});

	it('keeps one section open and reports the closed one first', async () => {
		const props = $state({ open: ['a'] as readonly string[], changes: [] as string[] });
		render(NavigationHarness, props);
		await page.getByRole('button', { name: 'Section B' }).click();
		expect(props.open).toEqual(['b']);
		expect(props.changes).toEqual(['a:false', 'b:true']);
		await expect
			.element(page.getByRole('heading', { level: 3, name: 'Section B' }))
			.toBeInTheDocument();
	});

	it('opens several sections when multiple', async () => {
		const props = $state({ open: ['a'] as readonly string[], multiple: true });
		render(NavigationHarness, props);
		await page.getByRole('button', { name: 'Section B' }).click();
		expect(props.open).toEqual(['a', 'b']);
	});
});

describe('PageIndicator', () => {
	it('moves to the activated dot and with the arrows', async () => {
		const props = $state({ dot: 0 });
		render(NavigationHarness, props);
		await page.getByRole('button', { name: 'Page 3 of 4' }).click();
		expect(props.dot).toBe(2);
		const current = page.getByRole('button', { name: 'Page 3 of 4' });
		await expect.element(current).toHaveAttribute('aria-current', 'step');
		await expect.element(current).toHaveAttribute('tabindex', '0');
		el(current).focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(props.dot).toBe(3);
		await expect.element(page.getByRole('button', { name: 'Page 4 of 4' })).toHaveFocus();
		await userEvent.keyboard('{Home}');
		expect(props.dot).toBe(0);
	});
});

describe('Pagination', () => {
	it('moves between pages and marks the current one', async () => {
		const props = $state({ page: 1 });
		render(NavigationHarness, props);
		const pagination = page.getByTestId('pagination');
		await expect
			.element(pagination.getByRole('button', { name: 'Previous page' }))
			.toBeDisabled();
		await pagination.getByRole('button', { name: 'Next page' }).click();
		expect(props.page).toBe(2);
		await page.getByRole('button', { name: 'Page 10' }).click();
		expect(props.page).toBe(10);
		await expect
			.element(page.getByRole('button', { name: 'Page 10' }))
			.toHaveAttribute('aria-current', 'page');
	});

	it('shows only the summary when narrow', async () => {
		render(NavigationHarness, { page: 3, width: 300 });
		await expect.element(page.getByText('Page 3 of 10')).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Page 1' })).not.toBeInTheDocument();
	});
});

describe('Steps', () => {
	it('reaches only completed and current steps when linear', async () => {
		const props = $state({ step: 1 });
		render(NavigationHarness, props);
		await expect.element(page.getByText('Step two')).toBeVisible();
		await expect
			.element(page.getByRole('button', { name: 'Profile Step 2 of 3, Current' }))
			.toHaveAttribute('aria-current', 'step');
		await expect
			.element(page.getByRole('group', { name: 'Done, Step 3 of 3' }))
			.toBeInTheDocument();
		await page.getByRole('button', { name: 'Account Step 1 of 3, Completed' }).click();
		expect(props.step).toBe(0);
		await page.getByRole('button', { name: 'Next' }).click();
		expect(props.step).toBe(1);
	});
});

describe('Carousel', () => {
	it('changes the page with the buttons, the dots and the arrows', async () => {
		const props = $state({ slide: 0 });
		render(NavigationHarness, props);
		await page.getByTestId('carousel').getByRole('button', { name: 'Next page' }).click();
		expect(props.slide).toBe(1);
		await expect
			.element(page.getByRole('group', { name: 'Part 2 of 3' }))
			.not.toHaveAttribute('aria-hidden');
		(
			el(page.getByTestId('carousel')).querySelector(
				'.oito2-carousel-viewport'
			) as HTMLElement
		).focus();
		await userEvent.keyboard('{ArrowLeft}');
		expect(props.slide).toBe(0);
		await userEvent.keyboard('{ArrowLeft}');
		expect(props.slide).toBe(2);
	});
});

describe('PanedView', () => {
	it('resizes the pane with the keyboard within its limits', async () => {
		const props = $state({ show: 'paned' as const, paneSize: 280 });
		render(LayoutHarness, props);
		const handle = page.getByRole('separator', { name: 'Resize pane' });
		await expect.element(handle).toHaveAttribute('aria-valuenow', '280');
		el(handle).focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(props.paneSize).toBe(296);
		await userEvent.keyboard('{End}');
		// 800 wide, minus the divider and the 320-pixel page.
		expect(props.paneSize).toBe(479);
		await userEvent.keyboard('{Home}');
		expect(props.paneSize).toBe(180);
	});
});

describe('Splitter', () => {
	it('moves a divider and collapses the pane before it', async () => {
		const props = { sizes: [] as readonly number[] };
		render(LayoutHarness, { show: 'splitter', onSizes: (sizes) => (props.sizes = sizes) });
		const [first] = page.getByRole('separator').all();
		await frames();
		el(first!).focus();
		await userEvent.keyboard('{ArrowRight}');
		// 798 pixels: a quarter for the first pane, the rest shared; the arrow moves 16.
		expect(props.sizes.map(Math.round)).toEqual([216, 283, 299]);
		await userEvent.keyboard('{Enter}');
		expect(props.sizes[0]).toBe(0);
		await expect.element(page.getByText('Left')).not.toBeInTheDocument();
		await userEvent.keyboard('{Enter}');
		expect(Math.round(props.sizes[0] ?? 0)).toBe(216);
	});
});

describe('NavigationPage', () => {
	it('picks the rail style by width and switches pages', async () => {
		const props = $state({
			show: 'navigation' as const,
			width: 800,
			destination: 'home',
			extendedBreakpoint: 900
		});
		render(LayoutHarness, props);
		const nav = page.getByRole('navigation', { name: 'Main' });
		await expect.element(nav).toHaveStyle({ width: '88px' });
		await page.getByRole('button', { name: 'Settings' }).click();
		expect(props.destination).toBe('settings');
		await expect.element(page.getByText('Settings page')).toBeVisible();
		props.width = 1000;
		await expect.element(nav).toHaveStyle({ width: '240px' });
		props.width = 500;
		await expect.element(nav).toHaveStyle({ width: '64px' });
	});

	it('uses a bottom bar for narrow touch layouts', async () => {
		render(LayoutHarness, { show: 'navigation', width: 500, density: 'touch' });
		await expect
			.element(page.getByRole('button', { name: 'Home' }))
			.toHaveAttribute('aria-current', 'page');
		await expect.element(page.getByText('Home page')).toBeVisible();
		const bar = el(page.getByRole('navigation', { name: 'Main' }));
		expect(bar.classList.contains('oito2-navigation-bar')).toBe(true);
	});
});

describe('MasterDetail', () => {
	it('selects the first item side by side', async () => {
		const props = $state({ show: 'master-detail' as const, item: null as string | null });
		render(LayoutHarness, props);
		await expect.element(page.getByText('About Ana')).toBeVisible();
		expect(props.item).toBe('Ana');
		await page.getByRole('button', { name: 'Carla' }).click();
		await expect.element(page.getByText('About Carla')).toBeVisible();
	});

	it('shows one at a time when narrow and goes back to the list', async () => {
		const props = $state({
			show: 'master-detail' as const,
			width: 500,
			item: null as string | null
		});
		render(LayoutHarness, props);
		await page.getByRole('button', { name: 'Bruno' }).click();
		await expect.element(page.getByText('About Bruno')).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Ana' })).not.toBeInTheDocument();
		await page.getByRole('button', { name: 'Back' }).click();
		expect(props.item).toBeNull();
		await expect.element(page.getByRole('button', { name: 'Bruno' })).toHaveFocus();
	});
});

describe('HeaderBar tabs', () => {
	it('switches views from the tabs in place of the title', async () => {
		const props = $state({ show: 'header' as const, destination: 'home' });
		render(LayoutHarness, props);
		const tab = page.getByRole('tab', { name: 'Settings' });
		await expect.element(tab).toHaveStyle({ width: '120px' });
		await tab.click();
		expect(props.destination).toBe('settings');
		await expect.element(page.getByRole('tabpanel')).toHaveTextContent('Settings view');
	});
});

const schemes = [
	{ name: 'light', mode: 'light', highContrast: false },
	{ name: 'dark', mode: 'dark', highContrast: false },
	{ name: 'light-hc', mode: 'light', highContrast: true }
] as const;

describe('layout gallery', () => {
	beforeEach(async () => {
		await page.viewport(840, 1000);
	});

	for (const scheme of schemes) {
		it(`has no axe violations in ${scheme.name}`, async () => {
			render(LayoutGallery, { mode: scheme.mode, highContrast: scheme.highContrast });
			await document.fonts.ready;
			await new Promise((resolve) => setTimeout(resolve, 300));
			const result = await axe.run(page.getByTestId('gallery').element());
			const violations = result.violations.map(
				(v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`
			);
			expect(violations).toEqual([]);
		});

		it(`matches the golden in ${scheme.name}`, async () => {
			render(LayoutGallery, { mode: scheme.mode, highContrast: scheme.highContrast });
			await document.fonts.ready;
			await new Promise((resolve) => setTimeout(resolve, 300));
			await expect(page.getByTestId('gallery')).toMatchScreenshot(`layout-${scheme.name}`);
		});
	}
});
