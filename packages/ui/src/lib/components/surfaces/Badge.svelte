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
  A small status mark in the error color: a 6-pixel dot, or a 16-pixel pill with `content`
  such as an unread count. Around `children` (an icon or a button), it sits on their top
  end corner.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
		/** The text or count; leave it out for a dot. */
		content?: string | number;
		/** The largest count shown; larger counts show as `max+`. Defaults to 999. */
		max?: number;
		/** Whether the badge shows. Defaults to true. */
		visible?: boolean;
		/** The element the badge marks. */
		children?: Snippet;
	}

	let {
		content,
		max = 999,
		visible = true,
		class: className,
		children,
		...rest
	}: Props = $props();

	let text = $derived(
		typeof content === 'number' && content > max
			? `${max}+`
			: content === undefined
				? ''
				: String(content)
	);
</script>

{#snippet badge()}
	<span
		class={['oito2-badge', className]}
		data-size={text === '' ? 'small' : 'large'}
		data-anchored={children ? '' : undefined}
		{...rest}>{text}</span
	>
{/snippet}

{#if children}
	<span class="oito2-badge-anchor">
		{@render children()}
		{#if visible}{@render badge()}{/if}
	</span>
{:else if visible}
	{@render badge()}
{/if}

<style>
	@layer oito2 {
		.oito2-badge-anchor {
			position: relative;
			display: inline-flex;
		}

		.oito2-badge {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			box-sizing: border-box;
			border-radius: 999px;
			background: var(--oito2-color-error);
			color: var(--oito2-color-on-error);
			font: var(--oito2-type-label-small);
			letter-spacing: var(--oito2-type-label-small-tracking);
			white-space: nowrap;
			pointer-events: none;
		}

		[data-size='small'] {
			width: 6px;
			height: 6px;
		}

		[data-size='large'] {
			min-width: 16px;
			height: 16px;
			padding: 0 4px;
		}

		[data-anchored] {
			position: absolute;
			top: 0;
			inset-inline-end: 0;
		}

		[data-anchored][data-size='large'] {
			top: -4px;
			inset-inline-end: -6px;
		}
	}
</style>
