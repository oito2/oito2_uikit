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
  Test helper: components with a value, controlled without `bind:`, uncontrolled from
  their `default*` props, and with consumer handlers next to their own. Every callback
  and handler pushes an entry to `log`.
-->
<script lang="ts">
	import '../lib/styles/styles.css';
	import ThemeProvider from '../lib/theme/ThemeProvider.svelte';
	import { ListCollection } from '../lib/collections/list-collection.js';
	import Calendar from '../lib/components/calendar/Calendar.svelte';
	import DatePicker from '../lib/components/calendar/DatePicker.svelte';
	import ColorPicker from '../lib/components/color-picker/ColorPicker.svelte';
	import ColorPickerButton from '../lib/components/color-picker/ColorPickerButton.svelte';
	import NumberEntry from '../lib/components/entries/NumberEntry.svelte';
	import SegmentedEntry from '../lib/components/entries/SegmentedEntry.svelte';
	import * as Menu from '../lib/components/menu/menu/index.js';
	import PageIndicator from '../lib/components/navigation/PageIndicator.svelte';
	import Pagination from '../lib/components/pagination/Pagination.svelte';
	import AngleSlider from '../lib/components/rating/AngleSlider.svelte';
	import Rating from '../lib/components/rating/Rating.svelte';
	import * as Select from '../lib/components/select/select/index.js';
	import PasswordField from '../lib/components/text/PasswordField.svelte';
	import PinEntry from '../lib/components/text/PinEntry.svelte';
	import SearchField from '../lib/components/text/SearchField.svelte';
	import TagsField from '../lib/components/text/TagsField.svelte';
	import * as Tooltip from '../lib/components/tooltip/index.js';

	interface Props {
		show: 'controlled' | 'defaults' | 'select' | 'menu' | 'tooltip' | 'handlers';
		log?: string[];
	}

	let { show, log = [] }: Props = $props();

	const fruits = new ListCollection(['Apple', 'Banana', 'Cherry']);
	const today = new Date(2026, 10, 4);
	const record = (entry: string) => () => log.push(entry);
</script>

<ThemeProvider mode="light" highContrast={false} accent="blue">
	<main style="padding: 16px">
		{#if show === 'controlled'}
			<Pagination
				page={2}
				pageCount={5}
				onPageChange={(page) => log.push(`pagination:${page}`)}
				aria-label="Pages"
			/>
			<PageIndicator
				length={4}
				page={1}
				onPageChange={(page) => log.push(`indicator:${page}`)}
				label="Slides"
			/>
			<Rating
				value={2}
				onValueChange={(value) => log.push(`rating:${value}`)}
				aria-label="Fixed rating"
			/>
			<AngleSlider
				value={30}
				step={15}
				onValueChange={(value) => log.push(`angle:${value}`)}
				onValueCommit={(value) => log.push(`angle-commit:${value}`)}
				aria-label="Fixed angle"
			/>
			<NumberEntry
				value={5}
				onValueChange={(value) => log.push(`number:${value}`)}
				aria-label="Fixed amount"
			/>
			<PinEntry
				value="12"
				length={4}
				onValueChange={(value) => log.push(`pin:${value}`)}
				aria-label="Fixed code"
			/>
			<Calendar
				value={new Date(2026, 10, 12)}
				{today}
				onValueChange={(value) => log.push(`calendar:${value.getDate()}`)}
			/>
			<ColorPicker
				value="#3584E4"
				swatches={['#E62D42']}
				onValueChange={(value) => log.push(`color:${value}`)}
			/>
		{:else if show === 'defaults'}
			<PageIndicator length={4} defaultPage={2} onPageChange={() => {}} label="Slides" />
			<NumberEntry defaultValue={7} aria-label="Amount" />
			<SearchField defaultValue="report" aria-label="Search" />
			<PasswordField defaultValue="secret" defaultVisible aria-label="Password" />
			<PinEntry defaultValue="34" length={4} aria-label="Code" />
			<TagsField defaultValue={['red', 'green']} label="Tags" />
			<SegmentedEntry
				defaultValue={['10', '0']}
				segments={[{ length: 3 }, { length: 3 }]}
				aria-label="Address"
			/>
			<ColorPickerButton defaultValue="#E62D42" label="Accent" />
			<DatePicker defaultValue={new Date(2026, 10, 4)} aria-label="Due" />
			<Calendar defaultValue={new Date(2026, 10, 12)} {today} />
		{:else if show === 'select'}
			<Select.Root
				collection={fruits}
				defaultOpen
				onOpenChange={(open) => log.push(`select:${open}`)}
				label="Fruit"
			/>
		{:else if show === 'menu'}
			<Menu.Root defaultOpen onOpenChange={(open) => log.push(`menu:${open}`)}>
				<Menu.Trigger>Actions</Menu.Trigger>
				<Menu.Content>
					<Menu.Item onSelect={record('copy')}>Copy</Menu.Item>
				</Menu.Content>
			</Menu.Root>
		{:else if show === 'tooltip'}
			<Tooltip.Root defaultOpen>
				<Tooltip.Trigger><span>Plain text</span></Tooltip.Trigger>
				<Tooltip.Content>About the text</Tooltip.Content>
			</Tooltip.Root>
		{:else if show === 'handlers'}
			<Rating
				defaultValue={1}
				onclick={record('rating-click')}
				onkeydown={record('rating-key')}
				aria-label="Stars"
			/>
			<AngleSlider defaultValue={0} onkeydown={record('angle-key')} aria-label="Angle" />
			<NumberEntry
				defaultValue={1}
				oninput={record('number-input')}
				onValueChange={(value) => log.push(`number:${value}`)}
				aria-label="Amount"
			/>
			<PinEntry
				length={4}
				oninput={record('pin-input')}
				onfocus={record('pin-focus')}
				onValueChange={(value) => log.push(`pin:${value}`)}
				aria-label="Code"
			/>
			<DatePicker
				onclick={record('date-click')}
				onkeydown={record('date-key')}
				aria-label="Due"
			/>
			<ColorPickerButton onclick={record('color-click')} label="Accent" />
		{/if}
	</main>
</ThemeProvider>
