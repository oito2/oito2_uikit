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

<!-- Test helper: the component fixes of phase F14c, one at a time. -->
<script lang="ts">
	import '../lib/styles/styles.css';
	import ThemeProvider from '../lib/theme/ThemeProvider.svelte';
	import LocaleProvider from '../lib/l10n/LocaleProvider.svelte';
	import ScrollArea from '../lib/components/scroll/ScrollArea.svelte';
	import * as Carousel from '../lib/components/carousel/carousel/index.js';
	import type { CarouselController } from '../lib/components/carousel/carousel-controller.svelte.js';
	import PageIndicator from '../lib/components/navigation/PageIndicator.svelte';
	import Avatar from '../lib/components/avatar/Avatar.svelte';
	import Rating from '../lib/components/rating/Rating.svelte';
	import AngleSlider from '../lib/components/rating/AngleSlider.svelte';
	import * as Tooltip from '../lib/components/tooltip/index.js';
	import TitleBar from '../lib/window/TitleBar.svelte';
	import HeaderBar from '../lib/window/HeaderBar.svelte';
	import AlertDialog from '../lib/components/dialog/AlertDialog.svelte';
	import EditableLabel from '../lib/components/text/EditableLabel.svelte';
	import Pagination from '../lib/components/pagination/Pagination.svelte';
	import * as Select from '../lib/components/select/select/index.js';

	interface Props {
		show: string;
		locale?: string;
		lines?: number;
		carousel?: CarouselController | null;
		editing?: boolean;
		text?: string;
	}

	let {
		show,
		locale = 'en',
		lines = 30,
		carousel = $bindable(null),
		editing = $bindable(false),
		text = $bindable('Report')
	}: Props = $props();
</script>

<LocaleProvider {locale}>
	<ThemeProvider mode="light" highContrast={false} accent="blue">
		<main style="padding: 16px">
			{#if show === 'scroll-area'}
				<ScrollArea style="height: 120px; width: 240px" data-testid="scroll">
					{#each { length: lines }, i (i)}<p>Line {i + 1}</p>{/each}
				</ScrollArea>
			{:else if show === 'carousel'}
				<Carousel.Root
					bind:controller={carousel}
					aria-label="Photos"
					data-testid="carousel"
				>
					<Carousel.Viewport height={80}>
						<Carousel.Item>Slide one</Carousel.Item>
						<Carousel.Item>Slide two</Carousel.Item>
						<Carousel.Item>Slide three</Carousel.Item>
					</Carousel.Viewport>
				</Carousel.Root>
			{:else if show === 'names'}
				<PageIndicator length={4} page={1} onPageChange={() => {}} label="Slides" />
				<Avatar label="Guest" />
				<Avatar />
			{:else if show === 'sliders'}
				<Rating value={3} readonly aria-label="Product rating" />
				<Rating value={2} disabled />
				<AngleSlider value={90} readonly />
				<AngleSlider value={45} disabled aria-label="Rotation" />
				<Rating defaultValue={4} aria-label="Default rating" />
				<AngleSlider defaultValue={30} aria-label="Default angle" />
				<Pagination pageCount={5} defaultPage={3} aria-label="Pages" />
			{:else if show === 'tooltip'}
				<Tooltip.Root delay={0}>
					<Tooltip.Trigger><span>Plain text</span></Tooltip.Trigger>
					<Tooltip.Content>About the text</Tooltip.Content>
				</Tooltip.Root>
				<Tooltip.Root delay={0}>
					<Tooltip.Trigger><button type="button">Inner button</button></Tooltip.Trigger>
					<Tooltip.Content>About the button</Tooltip.Content>
				</Tooltip.Root>
			{:else if show === 'headings'}
				<TitleBar title="Bar title" headingLevel={3} />
				<HeaderBar title="Header title" headingLevel={2} />
			{:else if show === 'alert'}
				<AlertDialog open title="Delete the file?" />
			{:else if show === 'editable'}
				<EditableLabel {text} bind:editing onSubmit={(next) => (text = next)} />
			{:else if show === 'select'}
				<Select.Root defaultValue="pear">
					<Select.Trigger aria-label="Fruit" />
					<Select.Content>
						<Select.Item value="apple" label="Apple" />
						<Select.Item value="pear" label="Pear" />
					</Select.Content>
				</Select.Root>
			{/if}
		</main>
	</ThemeProvider>
</LocaleProvider>
