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
  A destination of a `NavigationRail.Root`. The selected one sits on a rounded pill in
  the secondary container color and is marked as the current page. With `href` it is a
  link, otherwise a button.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import * as Tooltip from '../../tooltip/index.js';
	import type { IconComponent } from '../../icon.js';
	import { useNavigation } from '../navigation-state.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		/** The value that identifies the destination. */
		value: string;
		/** The destination name. */
		label: string;
		/** The icon. */
		icon: IconComponent;
		/** The icon shown while selected. Defaults to `icon`. */
		selectedIcon?: IconComponent;
		/** The tooltip of the compact style. Defaults to `label`. */
		tooltip?: string;
		/** Makes the destination a link to this URL. */
		href?: string;
		/** Whether the destination can't be used. */
		disabled?: boolean;
		/** The button or link element. */
		ref?: HTMLElement | null;
	}

	let {
		value,
		label,
		icon,
		selectedIcon,
		tooltip,
		href,
		disabled = false,
		ref = $bindable(null),
		class: className,
		onclick,
		...rest
	}: Props = $props();

	const navigation = useNavigation();
	let selected = $derived(navigation.value === value);
	let Icon = $derived(selected && selectedIcon ? selectedIcon : icon);
	let railStyle = $derived(navigation.railStyle);
	let link = $derived(href !== undefined && !disabled);
</script>

{#snippet item(props: Record<string | symbol, unknown>)}
	<svelte:element
		this={link ? 'a' : 'button'}
		bind:this={ref}
		href={link ? href : undefined}
		type={link ? undefined : 'button'}
		disabled={link ? undefined : disabled}
		aria-current={selected ? 'page' : undefined}
		aria-label={railStyle === 'compact' ? label : undefined}
		class={['oito2-navigation-rail-item', className]}
		data-style={railStyle}
		data-state={selected ? 'active' : 'inactive'}
		data-disabled={disabled ? '' : undefined}
		onclick={(event: MouseEvent & { currentTarget: EventTarget & HTMLElement }) => {
			onclick?.(event);
			if (!event.defaultPrevented && !disabled) navigation.select(value);
		}}
		{...rest}
		{...props}
	>
		<span class="pill"><Icon size={20} aria-hidden="true" class="oito2-rail-icon" /></span>
		{#if railStyle !== 'compact'}<span class="label">{label}</span>{/if}
	</svelte:element>
{/snippet}

<li class="oito2-navigation-rail-entry" data-style={railStyle}>
	{#if railStyle === 'compact'}
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}{@render item(props)}{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content>{tooltip ?? label}</Tooltip.Content>
		</Tooltip.Root>
	{:else}
		{@render item({})}
	{/if}
</li>

<style>
	@layer oito2 {
		.oito2-navigation-rail-entry {
			display: flex;
			flex-direction: column;
			align-items: inherit;
			padding: var(--oito2-space-xxs) var(--oito2-space-sm);
		}

		.oito2-navigation-rail-entry[data-style='labelled'] {
			padding-block: var(--oito2-space-xs);
		}

		.oito2-navigation-rail-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: var(--oito2-space-xxs);
			margin: 0;
			padding: 0;
			border: none;
			border-radius: var(--oito2-radius-large);
			background: none;
			color: var(--oito2-color-on-surface-variant);
			font: inherit;
			text-decoration: none;
			cursor: pointer;
			-webkit-tap-highlight-color: transparent;
		}

		.oito2-navigation-rail-item:focus-visible {
			outline: none;
		}

		.pill {
			position: relative;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 56px;
			height: 32px;
			border-radius: var(--oito2-radius-large);
		}

		[data-style='compact'] .pill {
			width: 48px;
			height: 40px;
		}

		[data-style='labelledExtended'] {
			flex-direction: row;
			gap: var(--oito2-space-md);
			height: 40px;
			padding: 0 var(--oito2-space-md);
		}

		[data-style='labelledExtended'] .pill {
			width: auto;
			height: auto;
			border-radius: 0;
		}

		.pill::after,
		[data-style='labelledExtended']::after {
			content: '';
			position: absolute;
			inset: 0;
			border-radius: inherit;
			background: var(--oito2-color-on-surface);
			opacity: 0;
			pointer-events: none;
		}

		[data-style='labelledExtended'] {
			position: relative;
		}

		[data-style='labelledExtended'] .pill::after {
			display: none;
		}

		.oito2-navigation-rail-item:not([data-disabled]):hover .pill::after,
		[data-style='labelledExtended']:not([data-disabled]):hover::after {
			opacity: 0.06;
		}

		[data-state='active']:not([data-style='labelledExtended']) .pill,
		[data-state='active'][data-style='labelledExtended'] {
			background: var(--oito2-color-secondary-container);
			color: var(--oito2-color-on-secondary-container);
		}

		.oito2-navigation-rail-item:not([data-style='labelledExtended']):focus-visible .pill,
		[data-style='labelledExtended']:focus-visible {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 0;
		}

		.oito2-navigation-rail-item :global(.oito2-rail-icon) {
			width: var(--oito2-icon-size);
			height: var(--oito2-icon-size);
		}

		.label {
			max-width: 100%;
			overflow: hidden;
			font: var(--oito2-type-label-small);
			letter-spacing: var(--oito2-type-label-small-tracking);
			text-align: center;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		[data-state='active'][data-style='labelled'] .label {
			color: var(--oito2-color-on-surface);
			font-weight: 600;
		}

		[data-style='labelledExtended'] .label {
			flex: 1;
			font: var(--oito2-type-label-large);
			letter-spacing: var(--oito2-type-label-large-tracking);
			text-align: start;
		}

		[data-disabled] {
			opacity: 0.38;
			cursor: default;
		}
	}
</style>
