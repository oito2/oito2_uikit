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
  A square button that shows only an icon, as large as a button is high. `label` names it
  for screen readers and shows as its tooltip. With `selected` it is a toggle: selected, it
  fills with the secondary container color and reports `aria-pressed`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { IconComponent } from '../icon.js';
	import * as Tooltip from '../tooltip/index.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		/** The icon. */
		icon?: IconComponent;
		/** The icon shown while `selected`. Defaults to `icon`. */
		selectedIcon?: IconComponent;
		/** The accessible name, also shown as the tooltip. */
		label: string;
		/** Whether the button is a toggle that is on; leave it out for a plain button. */
		selected?: boolean;
		/** Whether \`label\` shows as a tooltip. Defaults to true. */
		tooltip?: boolean;
		/** The button element. */
		ref?: HTMLButtonElement | null;
		/** Custom content instead of `icon`. */
		children?: Snippet;
	}

	let {
		icon,
		selectedIcon,
		label,
		selected,
		tooltip = true,
		ref = $bindable(null),
		disabled = false,
		type = 'button',
		class: className,
		children,
		...rest
	}: Props = $props();

	let Icon = $derived(selected && selectedIcon ? selectedIcon : icon);
</script>

<Tooltip.Root disabled={!tooltip}>
	<Tooltip.Trigger>
		{#snippet child({ props })}
			<button
				bind:this={ref}
				{type}
				{disabled}
				aria-label={label}
				aria-pressed={selected}
				class={['oito2-icon-button', className]}
				data-state={selected === undefined ? undefined : selected ? 'on' : 'off'}
				data-disabled={disabled ? '' : undefined}
				{...rest}
				{...props}
			>
				{#if children}
					{@render children()}
				{:else if Icon}
					<Icon size={20} aria-hidden="true" class="oito2-icon-button-icon" />
				{/if}
			</button>
		{/snippet}
	</Tooltip.Trigger>
	<Tooltip.Content>{label}</Tooltip.Content>
</Tooltip.Root>

<style>
	@layer oito2 {
		.oito2-icon-button {
			position: relative;
			display: inline-flex;
			flex: none;
			align-items: center;
			justify-content: center;
			box-sizing: border-box;
			width: var(--oito2-control-height);
			height: var(--oito2-control-height);
			margin: 0;
			padding: 0;
			border: none;
			border-radius: var(--oito2-radius-medium);
			background: transparent;
			color: var(--oito2-color-on-surface-variant);
			cursor: pointer;
			-webkit-tap-highlight-color: transparent;
		}

		.oito2-icon-button::before {
			content: '';
			position: absolute;
			inset: 0;
			border-radius: inherit;
			background: currentColor;
			opacity: 0;
			pointer-events: none;
		}

		.oito2-icon-button:not(:disabled):hover::before {
			opacity: 0.08;
		}

		.oito2-icon-button:not(:disabled):active::before {
			opacity: 0.1;
		}

		.oito2-icon-button:focus-visible {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 0;
		}

		.oito2-icon-button[data-state='on']:not(:disabled) {
			background: var(--oito2-color-secondary-container);
			color: var(--oito2-color-on-secondary-container);
		}

		.oito2-icon-button:disabled {
			color: color-mix(in srgb, var(--oito2-color-on-surface) 38%, transparent);
			cursor: default;
		}

		.oito2-icon-button :global(.oito2-icon-button-icon) {
			width: var(--oito2-icon-size);
			height: var(--oito2-icon-size);
		}
	}
</style>
