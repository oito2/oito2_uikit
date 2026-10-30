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
import ControlsHarness from '../../tests/ControlsHarness.svelte';
import type { CheckedState } from './toggles/toggle-state.js';
import { nextCheckedState } from './toggles/toggle-state.js';
import { sliderStep, snapSliderValue } from './slider/slider-math.js';

/** Returns the element of a locator. */
const el = (locator: ReturnType<typeof page.getByRole>) => locator.element() as HTMLElement;

describe('toggle state', () => {
	it('cycles through the mixed state only when tristate', () => {
		expect(nextCheckedState(false, false)).toBe(true);
		expect(nextCheckedState(true, false)).toBe(false);
		expect(nextCheckedState(true, true)).toBe('mixed');
		expect(nextCheckedState('mixed', true)).toBe(false);
	});
});

describe('Checkbox and Switch', () => {
	it('toggles on click and Space and reports its state', async () => {
		const props = $state({ checked: false as CheckedState, on: false });
		render(ControlsHarness, props);
		const box = page.getByRole('checkbox', { name: 'Box' });
		await box.click();
		expect(props.checked).toBe(true);
		await expect.element(box).toHaveAttribute('aria-checked', 'true');
		const form = page.getByTestId('form').element() as HTMLFormElement;
		expect(new FormData(form).get('box')).toBe('on');
		el(box).focus();
		await userEvent.keyboard(' ');
		expect(props.checked).toBe(false);
		const power = page.getByRole('switch', { name: 'Power' });
		await power.click();
		expect(props.on).toBe(true);
		await expect.element(power).toHaveAttribute('aria-checked', 'true');
	});

	it('cycles a tristate box through mixed', async () => {
		const props = $state({ checked: true as CheckedState, tristate: true });
		render(ControlsHarness, props);
		const box = page.getByRole('checkbox', { name: 'Box' });
		await box.click();
		expect(props.checked).toBe('mixed');
		await expect.element(box).toHaveAttribute('aria-checked', 'mixed');
		await box.click();
		expect(props.checked).toBe(false);
	});

	it('toggles labeled rows and list tiles anywhere on them', async () => {
		const props = $state({ row: false as CheckedState, tile: false });
		render(ControlsHarness, props);
		await page.getByRole('checkbox', { name: 'Row' }).click();
		expect(props.row).toBe(true);
		await page.getByText('Tile switch').click();
		expect(props.tile).toBe(true);
		await expect
			.element(page.getByRole('switch', { name: 'Tile switch' }))
			.toHaveAttribute('aria-checked', 'true');
		const tileBox = page.getByRole('checkbox', { name: 'Tile box' });
		await tileBox.click();
		await expect.element(tileBox).toHaveAttribute('aria-checked', 'true');
	});
});

describe('RadioGroup', () => {
	it('has one Tab stop and selects with the arrows, skipping disabled items', async () => {
		const props = $state({ radio: 'b' as string | null });
		render(ControlsHarness, props);
		const radios = ['A', 'B', 'C', 'D'].map((name) => el(page.getByRole('radio', { name })));
		expect(radios.map((r) => r.tabIndex)).toEqual([-1, 0, -1, -1]);
		radios[1]?.focus();
		await userEvent.keyboard('{ArrowDown}');
		expect(props.radio).toBe('d');
		expect(document.activeElement).toBe(radios[3]);
		await userEvent.keyboard('{ArrowDown}');
		expect(props.radio).toBe('a');
		await userEvent.keyboard('{ArrowUp}');
		expect(props.radio).toBe('d');
		const form = page.getByTestId('form').element() as HTMLFormElement;
		expect(new FormData(form).get('letter')).toBe('d');
		await page.getByRole('radio', { name: 'A' }).click();
		expect(props.radio).toBe('a');
		await expect
			.element(page.getByRole('radio', { name: 'A' }))
			.toHaveAttribute('aria-checked', 'true');
	});
});

describe('Slider', () => {
	it('snaps and steps', () => {
		expect(snapSliderValue(23, 0, 100, 10)).toBe(20);
		expect(snapSliderValue(120, 0, 100)).toBe(100);
		expect(sliderStep(0, 1)).toBeCloseTo(0.1);
		expect(sliderStep(0, 100, 4)).toBe(25);
	});

	it('moves with the keyboard and reports its value', async () => {
		const props = $state({ volume: 0.5 });
		render(ControlsHarness, props);
		const thumb = page.getByRole('slider', { name: 'Volume' });
		el(thumb).focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(props.volume).toBeCloseTo(0.6);
		await userEvent.keyboard('{End}');
		expect(props.volume).toBe(1);
		await expect.element(thumb).toHaveAttribute('aria-valuenow', '1');
		await userEvent.keyboard('{Home}{ArrowUp}');
		expect(props.volume).toBeCloseTo(0.1);
	});

	it('keeps the thumbs of a range in order', async () => {
		const props = $state({ range: [20, 60] as [number, number] });
		render(ControlsHarness, props);
		const from = page.getByRole('slider', { name: 'From' });
		el(from).focus();
		await userEvent.keyboard('{End}');
		expect(props.range).toEqual([60, 60]);
		const to = page.getByRole('slider', { name: 'To' });
		el(to).focus();
		await userEvent.keyboard('{ArrowLeft}');
		expect(props.range).toEqual([60, 60]);
		await userEvent.keyboard('{ArrowRight}');
		expect(props.range).toEqual([60, 70]);
	});

	it('jumps to a click on the track', async () => {
		const props = $state({ volume: 0 });
		render(ControlsHarness, props);
		const control = el(page.getByRole('slider', { name: 'Volume' })).closest(
			'.control'
		) as HTMLElement;
		const box = control.getBoundingClientRect();
		await userEvent.click(control, { position: { x: box.width - 10, y: box.height / 2 } });
		expect(props.volume).toBeCloseTo(1, 1);
	});
});
