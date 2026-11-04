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
  A button with a main action and an attached arrow that opens a menu of related
  actions. The children are the main label and `onclick` its action; `menu` holds the
  `Menu.Item`s. `disabled` turns off both parts.
-->
<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { useLocale } from '../../l10n/locale.js';
	import Button from '../button/Button.svelte';
	import type { IconComponent } from '../icon.js';
	import * as Menu from '../menu/menu/index.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		/** The look of both parts. Defaults to `elevated`. */
		variant?: 'elevated' | 'filled' | 'outlined';
		/** An icon before the label. */
		icon?: IconComponent;
		/** The menu entries, usually `Menu.Item`s. */
		menu: Snippet;
		/** The accessible name of the arrow part. Defaults to "More options". */
		menuLabel?: string;
		/** The main button element. */
		ref?: HTMLElement | null;
		/** The main label. */
		children?: Snippet;
	}

	let {
		variant = 'elevated',
		icon,
		menu,
		menuLabel,
		disabled = false,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	const locale = useLocale();
</script>

<span class={['oito2-split-button', className]} data-variant={variant}>
	<Button bind:ref {variant} {icon} {disabled} class="oito2-split-button-main" {...rest}>
		{@render children?.()}
	</Button>
	<Menu.Root>
		<Menu.Trigger>
			{#snippet child({ props })}
				<Button
					{variant}
					{disabled}
					aria-label={menuLabel ?? locale.strings.moreOptions}
					class="oito2-split-button-arrow"
					{...props}
				>
					<ChevronDown size={20} aria-hidden="true" class="oito2-split-button-chevron" />
				</Button>
			{/snippet}
		</Menu.Trigger>
		<Menu.Content>{@render menu()}</Menu.Content>
	</Menu.Root>
</span>

<style>
	@layer oito2 {
		.oito2-split-button {
			display: inline-flex;
			gap: 1px;
		}

		.oito2-split-button > :global(.oito2-split-button-main) {
			border-start-end-radius: 0;
			border-end-end-radius: 0;
		}

		.oito2-split-button > :global(.oito2-split-button-arrow) {
			min-width: 0;
			padding: 0 var(--oito2-space-sm);
			border-start-start-radius: 0;
			border-end-start-radius: 0;
		}

		.oito2-split-button :global(.oito2-split-button-chevron) {
			width: var(--oito2-icon-size);
			height: var(--oito2-icon-size);
		}
	}
</style>
