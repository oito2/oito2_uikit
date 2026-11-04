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
  A destination of a `NavigationBar.Root`: an icon on a pill indicator, filled while
  selected, with the label below. With `href` it is a link, otherwise a button.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
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
	let link = $derived(href !== undefined && !disabled);
</script>

<li class="oito2-navigation-bar-entry">
	<svelte:element
		this={link ? 'a' : 'button'}
		bind:this={ref}
		href={link ? href : undefined}
		type={link ? undefined : 'button'}
		disabled={link ? undefined : disabled}
		aria-current={selected ? 'page' : undefined}
		class={['oito2-navigation-bar-item', className]}
		data-state={selected ? 'active' : 'inactive'}
		data-disabled={disabled ? '' : undefined}
		onclick={(event: MouseEvent & { currentTarget: EventTarget & HTMLElement }) => {
			onclick?.(event);
			if (!event.defaultPrevented && !disabled) navigation.select(value);
		}}
		{...rest}
	>
		<span class="pill"><Icon size={24} aria-hidden="true" class="oito2-bar-icon" /></span>
		<span class="label">{label}</span>
	</svelte:element>
</li>

<style>
	@layer oito2 {
		.oito2-navigation-bar-entry {
			display: flex;
			flex: 1;
			min-width: 0;
		}

		.oito2-navigation-bar-item {
			display: flex;
			flex: 1;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: var(--oito2-space-xs);
			min-width: 0;
			margin: 0;
			padding: 0;
			border: none;
			border-radius: var(--oito2-radius-medium);
			background: none;
			color: var(--oito2-color-on-surface-variant);
			font: inherit;
			text-decoration: none;
			cursor: pointer;
			-webkit-tap-highlight-color: transparent;
		}

		.oito2-navigation-bar-item:focus-visible {
			outline: none;
		}

		.oito2-navigation-bar-item:focus-visible .pill {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 0;
		}

		.pill {
			position: relative;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 64px;
			height: 32px;
			border-radius: 999px;
		}

		.pill::after {
			content: '';
			position: absolute;
			inset: 0;
			border-radius: inherit;
			background: var(--oito2-color-on-surface);
			opacity: 0;
			pointer-events: none;
		}

		.oito2-navigation-bar-item:not([data-disabled]):hover .pill::after {
			opacity: 0.08;
		}

		[data-state='active'] .pill {
			background: var(--oito2-color-secondary-container);
			color: var(--oito2-color-on-secondary-container);
		}

		.oito2-navigation-bar-item :global(.oito2-bar-icon) {
			width: 24px;
			height: 24px;
		}

		.label {
			max-width: 100%;
			overflow: hidden;
			font: var(--oito2-type-label-medium);
			letter-spacing: var(--oito2-type-label-medium-tracking);
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		[data-state='active'] .label {
			color: var(--oito2-color-on-surface);
			font-weight: 600;
		}

		[data-disabled] {
			opacity: 0.38;
			cursor: default;
		}
	}
</style>
