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

<!-- Test helper: tabs, accordion, page indicator, pagination, steps and carousel with bindable state. -->
<script lang="ts">
	import '../lib/styles/styles.css';
	import ThemeProvider from '../lib/theme/ThemeProvider.svelte';
	import * as Accordion from '../lib/components/expandable/accordion/index.js';
	import * as Expandable from '../lib/components/expandable/expandable/index.js';
	import * as Tabs from '../lib/components/tabs/tabs/index.js';
	import PageIndicator from '../lib/components/navigation/PageIndicator.svelte';
	import Pagination from '../lib/components/pagination/Pagination.svelte';
	import * as Steps from '../lib/components/steps/steps/index.js';
	import * as Carousel from '../lib/components/carousel/carousel/index.js';

	interface Props {
		tab?: string;
		dir?: 'ltr' | 'rtl';
		open?: readonly string[];
		multiple?: boolean;
		changes?: string[];
		expanded?: boolean;
		dot?: number;
		page?: number;
		step?: number;
		linear?: boolean;
		slide?: number;
		width?: number;
	}

	let {
		tab = $bindable('one'),
		dir = 'ltr',
		open = $bindable([]),
		multiple = false,
		changes = $bindable([]),
		expanded = $bindable(false),
		dot = $bindable(0),
		page = $bindable(1),
		step = $bindable(0),
		linear = true,
		slide = $bindable(0),
		width = 700
	}: Props = $props();
</script>

<ThemeProvider mode="light" highContrast={false} accent="blue">
	<div {dir} style:width="{width}px">
		<Tabs.Root bind:value={tab}>
			<Tabs.List aria-label="Views">
				<Tabs.Trigger value="one">One</Tabs.Trigger>
				<Tabs.Trigger value="two">Two</Tabs.Trigger>
				<Tabs.Trigger value="three" disabled>Three</Tabs.Trigger>
				<Tabs.Trigger value="four">Four</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="one">Panel one</Tabs.Content>
			<Tabs.Content value="two">Panel two</Tabs.Content>
			<Tabs.Content value="four">Panel four</Tabs.Content>
		</Tabs.Root>

		<Expandable.Root bind:open={expanded}>
			<Expandable.Trigger>Details</Expandable.Trigger>
			<Expandable.Content>Hidden details</Expandable.Content>
		</Expandable.Root>

		<Accordion.Root
			bind:value={open}
			{multiple}
			onItemOpenChange={(value, isOpen) => (changes = [...changes, `${value}:${isOpen}`])}
		>
			<Accordion.Item value="a">
				<Accordion.Trigger headingLevel={3}>Section A</Accordion.Trigger>
				<Accordion.Content>Content A</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="b">
				<Accordion.Trigger headingLevel={3}>Section B</Accordion.Trigger>
				<Accordion.Content>Content B</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>

		<PageIndicator length={4} bind:page={dot} onPageChange={() => {}} data-testid="dots" />

		<Pagination bind:page pageCount={10} data-testid="pagination" />

		<Steps.Root bind:current={step} {linear} onCurrentChange={() => {}}>
			<Steps.Item title="Account">Step one</Steps.Item>
			<Steps.Item title="Profile">Step two</Steps.Item>
			<Steps.Item title="Done">Step three</Steps.Item>
			<div><Steps.Prev /><Steps.Next /></div>
		</Steps.Root>

		<Carousel.Root bind:page={slide} aria-label="Photos" data-testid="carousel">
			<Carousel.Viewport height={80}>
				<Carousel.Item>Slide one</Carousel.Item>
				<Carousel.Item>Slide two</Carousel.Item>
				<Carousel.Item>Slide three</Carousel.Item>
				<Carousel.Prev />
				<Carousel.Next />
			</Carousel.Viewport>
			<Carousel.Indicators />
		</Carousel.Root>
	</div>
</ThemeProvider>
