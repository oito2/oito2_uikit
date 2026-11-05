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
  @component
  A step of a `Steps.Root`: its circle (the number, a check mark when completed or a
  cross on error), `title` and `description`, announced with its position and state. The
  children are the step's content, shown while it is the current step.
-->
<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';
	import { onDestroy, type Snippet } from 'svelte';
	import { useLocale } from '../../../l10n/locale.js';
	import { stepState, useSteps } from '../steps-state.svelte.js';

	interface Props {
		/** The step name. */
		title: string;
		/** A short second line. */
		description?: string;
		/** Whether the step shows the error state. */
		error?: boolean;
		/** The content shown while the step is current. */
		children?: Snippet;
	}

	let { title, description, error = false, children }: Props = $props();

	const steps = useSteps();
	const locale = useLocale();
	const item = steps.register();
	onDestroy(() => steps.unregister(item));

	let index = $derived(steps.indexOf(item));
	let state = $derived(stepState(index, steps.current, error));
	let reachable = $derived(steps.reachable(index));
	let vertical = $derived(steps.orientation === 'vertical');
	let last = $derived(index === steps.count - 1);
	let stateLabel = $derived(
		state === 'completed'
			? locale.strings.stepCompleted
			: state === 'current'
				? locale.strings.stepCurrent
				: state === 'error'
					? locale.strings.stepError
					: undefined
	);
	/** The position and state, read after the visible title and description. */
	let position = $derived(
		[locale.strings.stepOf(index + 1, steps.count), stateLabel].filter(Boolean).join(', ')
	);
</script>

{#snippet circle()}
	<span class="indicator" data-state={state} aria-hidden="true">
		{#if state === 'completed'}<Check size={16} />{:else if state === 'error'}<X
				size={16}
			/>{:else}{index + 1}{/if}
	</span>
{/snippet}

{#snippet text()}
	<span class="text">
		<span class="title" data-state={state}>{title}<span class="hidden"> {position}</span></span>
		{#if description}<span class="description">{description}</span>{/if}
	</span>
{/snippet}

{#snippet header()}
	<svelte:element
		this={reachable ? 'button' : 'div'}
		type={reachable ? 'button' : undefined}
		role={reachable ? undefined : 'group'}
		aria-label={reachable ? undefined : `${title}, ${position}`}
		aria-current={state === 'current' ? 'step' : undefined}
		class="header"
		data-interactive={reachable ? '' : undefined}
		onclick={reachable ? () => steps.goTo(index) : undefined}
	>
		{#if !vertical}{@render circle()}{/if}
		{@render text()}
	</svelte:element>
{/snippet}

{#if vertical}
	<div class="oito2-steps-item" data-orientation="vertical">
		<div class="rail">
			{@render circle()}
			{#if !last}<span
					class="connector oito2-steps-connector"
					data-done={index < steps.current ? '' : undefined}
				></span>{/if}
		</div>
		<div class="body">
			{@render header()}
			{#if state === 'current' && children}<div class="content oito2-steps-content">
					{@render children()}
				</div>{/if}
		</div>
	</div>
{:else}
	{#if index > 0}
		<span
			class="connector oito2-steps-connector"
			data-orientation="horizontal"
			data-done={index <= steps.current ? '' : undefined}
		></span>
	{/if}
	<div
		class="oito2-steps-item"
		data-orientation="horizontal"
		style:--oito2-steps-count={steps.count}
	>
		{@render header()}
	</div>
	{#if steps.current === index && children}
		<div class="content oito2-steps-content" data-orientation="horizontal">
			{@render children()}
		</div>
	{/if}
{/if}

<style>
	@layer oito2 {
		/* Text for assistive technologies only. */
		.hidden {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip-path: inset(50%);
			white-space: nowrap;
		}

		.oito2-steps-item[data-orientation='horizontal'] {
			flex: none;
			max-width: min(160px, calc(100% / var(--oito2-steps-count)));
		}

		.connector {
			flex: 1;
			min-width: var(--oito2-space-sm);
			height: 2px;
			margin: 15px var(--oito2-space-sm) 0;
			border-radius: 1px;
			background: var(--oito2-color-outline-variant);
		}

		.connector[data-done] {
			background: var(--oito2-color-selected-fill);
		}

		.content[data-orientation='horizontal'] {
			order: 1;
			flex-basis: 100%;
		}

		.header {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: var(--oito2-space-xs);
			width: 100%;
			margin: 0;
			padding: var(--oito2-space-xxs);
			border: none;
			border-radius: var(--oito2-radius-small);
			background: none;
			color: inherit;
			font: inherit;
			text-align: center;
		}

		[data-interactive] {
			cursor: pointer;
		}

		.header:focus-visible {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 0;
		}

		.indicator {
			display: inline-flex;
			flex: none;
			align-items: center;
			justify-content: center;
			box-sizing: border-box;
			width: 28px;
			height: 28px;
			border: 1.5px solid var(--oito2-color-outline);
			border-radius: 50%;
			color: var(--oito2-color-on-surface-variant);
			font: var(--oito2-type-label-medium);
			font-weight: 600;
			letter-spacing: var(--oito2-type-label-medium-tracking);
		}

		.indicator[data-state='completed'] {
			border-color: var(--oito2-color-selected-fill);
			background: var(--oito2-color-selected-fill);
			color: var(--oito2-color-on-selected-fill);
		}

		.indicator[data-state='current'] {
			border: 2px solid var(--oito2-color-primary-text);
			color: var(--oito2-color-primary-text);
		}

		.indicator[data-state='error'] {
			border-color: var(--oito2-color-error-text);
			color: var(--oito2-color-error-text);
		}

		.text {
			display: flex;
			flex-direction: column;
			align-items: inherit;
			min-width: 0;
			max-width: 100%;
		}

		.title,
		.description {
			display: -webkit-box;
			overflow: hidden;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			line-clamp: 2;
		}

		.title {
			color: var(--oito2-color-on-surface);
			font: var(--oito2-type-title-small);
			letter-spacing: var(--oito2-type-title-small-tracking);
		}

		.title[data-state='upcoming'] {
			color: var(--oito2-color-on-surface-variant);
		}

		.title[data-state='error'] {
			color: var(--oito2-color-error-text);
		}

		.description {
			color: var(--oito2-color-on-surface-variant);
			font: var(--oito2-type-body-small);
			letter-spacing: var(--oito2-type-body-small-tracking);
		}

		.oito2-steps-item[data-orientation='vertical'] {
			display: flex;
			gap: var(--oito2-space-md);
		}

		.rail {
			display: flex;
			flex: none;
			flex-direction: column;
			align-items: center;
		}

		.rail .connector {
			flex: 1;
			width: 2px;
			min-width: 0;
			height: auto;
			margin: var(--oito2-space-xs) 0;
		}

		.body {
			display: flex;
			flex: 1;
			flex-direction: column;
			gap: var(--oito2-space-sm);
			min-width: 0;
			padding-bottom: var(--oito2-space-lg);
		}

		[data-orientation='vertical'] .header {
			align-items: flex-start;
			padding-top: calc(var(--oito2-space-xxs) + 4px);
			text-align: start;
		}

		[data-orientation='vertical'] .title,
		[data-orientation='vertical'] .description {
			display: block;
		}
	}
</style>
