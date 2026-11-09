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

import { el } from '@oito2/ui-test-utils';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import FixesHarness from '../../tests/FixesHarness.svelte';
import type { CarouselController } from './carousel/carousel-controller.svelte.js';

/** Returns the axe violations inside `element`, as `rule: target` lines. */
async function violations(element: Element): Promise<string[]> {
	const result = await axe.run(element);
	return result.violations.map(
		(v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`
	);
}

describe('scrolling regions', () => {
	it('lets the keyboard reach a ScrollArea only while it scrolls', async () => {
		const props = $state({ show: 'scroll-area', lines: 30 });
		render(FixesHarness, props);
		const viewport = el(page.getByTestId('scroll')).querySelector('.viewport') as HTMLElement;
		await expect.poll(() => viewport.getAttribute('tabindex')).toBe('0');
		expect(await violations(el(page.getByTestId('scroll')))).toEqual([]);
		props.lines = 1;
		await expect.poll(() => viewport.hasAttribute('tabindex')).toBe(false);
	});

	it('keeps the carousel scroller out of the tab order and hands out its controller', async () => {
		const props = $state({ show: 'carousel', carousel: null as CarouselController | null });
		render(FixesHarness, props);
		expect(await violations(el(page.getByTestId('carousel')))).toEqual([]);
		await expect.poll(() => props.carousel?.count).toBe(3);
		props.carousel?.goTo(2, false);
		await expect.poll(() => props.carousel?.page).toBe(2);
	});
});

describe('accessible names and states', () => {
	it('names a page indicator group and an avatar with only an icon', async () => {
		render(FixesHarness, { show: 'names' });
		await expect.element(page.getByRole('group', { name: 'Slides' })).toBeVisible();
		await expect.element(page.getByRole('img', { name: 'Guest' })).toBeVisible();
		expect(document.querySelectorAll('[role="img"]')).toHaveLength(1);
	});

	it('keeps read-only and disabled ratings and dials as sliders', async () => {
		render(FixesHarness, { show: 'sliders' });
		const rating = page.getByRole('slider', { name: 'Product rating' });
		await expect.element(rating).toHaveAttribute('aria-readonly', 'true');
		await expect.element(rating).toHaveAttribute('aria-valuetext', '3 of 5 stars');
		await expect.element(rating).toHaveAttribute('tabindex', '0');
		const disabled = page.getByRole('slider', { name: '2 of 5 stars' });
		await expect.element(disabled).toHaveAttribute('aria-disabled', 'true');
		expect(el(disabled).hasAttribute('tabindex')).toBe(false);
		await expect
			.element(page.getByRole('slider', { name: '90°' }))
			.toHaveAttribute('aria-readonly', 'true');
		await expect
			.element(page.getByRole('slider', { name: 'Rotation' }))
			.toHaveAttribute('aria-valuetext', '45°');
		expect(await violations(document.querySelector('main') as Element)).toEqual([]);
	});

	it('starts ratings, dials and paginations at their default values', async () => {
		render(FixesHarness, { show: 'sliders' });
		await expect
			.element(page.getByRole('slider', { name: 'Default rating' }))
			.toHaveAttribute('aria-valuenow', '4');
		await expect
			.element(page.getByRole('slider', { name: 'Default angle' }))
			.toHaveAttribute('aria-valuenow', '30');
		// In the narrow test page the pagination shows its compact form.
		await expect.element(page.getByText('Page 3 of 5')).toBeVisible();
	});

	it('opens a wrapped tooltip from the keyboard and describes the focused element', async () => {
		render(FixesHarness, { show: 'tooltip' });
		const wrappers = document.querySelectorAll<HTMLElement>('.oito2-tooltip-trigger');
		expect(wrappers[0]?.getAttribute('tabindex')).toBe('0');
		expect(wrappers[1]?.hasAttribute('tabindex')).toBe(false);
		await userEvent.keyboard('{Tab}');
		await expect.element(page.getByRole('tooltip')).toHaveTextContent('About the text');
		await userEvent.keyboard('{Tab}');
		const button = page.getByRole('button', { name: 'Inner button' });
		await expect.element(button).toHaveFocus();
		await expect.element(button).toHaveAccessibleDescription('About the button');
	});

	it('sets the heading level of title bar titles', async () => {
		render(FixesHarness, { show: 'headings' });
		await expect
			.element(page.getByRole('heading', { level: 3, name: 'Bar title' }))
			.toBeVisible();
		await expect
			.element(page.getByRole('heading', { level: 2, name: 'Header title' }))
			.toBeVisible();
		expect(document.querySelectorAll('h1')).toHaveLength(0);
	});
});

describe('API fixes', () => {
	it('labels the alert dialog buttons in the active locale by default', async () => {
		render(FixesHarness, { show: 'alert', locale: 'pt-BR' });
		await expect.element(page.getByRole('button', { name: 'OK' })).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Cancelar' })).toBeVisible();
	});

	it('fills and focuses an editable label opened through a bound editing', async () => {
		const props = $state({ show: 'editable', editing: false, text: 'Report' });
		render(FixesHarness, props);
		props.editing = true;
		const field = page.getByRole('textbox', { name: 'Report' });
		await expect.element(field).toHaveFocus();
		await expect.element(field).toHaveValue('Report');
		await userEvent.keyboard('Summary{Enter}');
		expect(props.text).toBe('Summary');
		expect(props.editing).toBe(false);
	});

	it('shows the label of the default value of a composed select before it opens', async () => {
		render(FixesHarness, { show: 'select' });
		await expect
			.element(page.getByRole('combobox', { name: 'Fruit' }))
			.toHaveTextContent('Pear');
		await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
	});
});
