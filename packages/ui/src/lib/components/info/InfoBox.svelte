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
  A message box tinted by its `type`, with an icon, a `title`, an optional `subtitle`,
  extra content and `trailing` content such as a close button. The icon carries the
  kind's name for assistive technologies, and warnings and errors are announced as they
  appear.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useLocale } from '../../l10n/locale.js';
	import { infoTypeIcons, infoTypeLabel, type InfoType } from './info-type.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
		/** The kind of message. */
		type: InfoType;
		/** The headline, in the kind color. */
		title?: string | Snippet;
		/** The message text. */
		subtitle?: string | Snippet;
		/** Replaces the kind icon; unlike it, it carries no name for assistive technologies. */
		icon?: Snippet;
		/** Content at the end, such as a close or action button. */
		trailing?: Snippet;
		/** The box element. */
		ref?: HTMLDivElement | null;
		/** Extra content below the subtitle. */
		children?: Snippet;
	}

	let {
		type,
		title,
		subtitle,
		icon,
		trailing,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	const locale = useLocale();
	let Icon = $derived(infoTypeIcons[type]);
	let urgent = $derived(type === 'danger' || type === 'warning');
</script>

{#snippet text(content: string | Snippet)}
	{#if typeof content === 'string'}{content}{:else}{@render content()}{/if}
{/snippet}

<div
	bind:this={ref}
	role={urgent ? 'status' : undefined}
	class={['oito2-info-box', className]}
	data-type={type}
	{...rest}
>
	<span class="icon">
		{#if icon}
			{@render icon()}
		{:else}
			<Icon size={20} role="img" aria-label={infoTypeLabel(type, locale.strings)} />
		{/if}
	</span>
	<span class="text">
		{#if title}<span class="title">{@render text(title)}</span>{/if}
		{#if subtitle}<span class="subtitle">{@render text(subtitle)}</span>{/if}
		{@render children?.()}
	</span>
	{#if trailing}<span class="trailing">{@render trailing()}</span>{/if}
</div>

<style>
	@layer oito2 {
		.oito2-info-box {
			--oito2-info-box-color: var(--oito2-color-info-box-text-information);
			display: flex;
			align-items: flex-start;
			gap: var(--oito2-space-md);
			padding: var(--oito2-space-md);
			border: 1px solid color-mix(in srgb, var(--oito2-info-box-color) 50%, transparent);
			border-radius: var(--oito2-radius-medium);
			background: var(--oito2-color-info-box-information);
			color: var(--oito2-color-on-surface);
		}

		[data-type='success'] {
			--oito2-info-box-color: var(--oito2-color-info-box-text-success);
			background: var(--oito2-color-info-box-success);
		}

		[data-type='warning'] {
			--oito2-info-box-color: var(--oito2-color-info-box-text-warning);
			background: var(--oito2-color-info-box-warning);
		}

		[data-type='danger'] {
			--oito2-info-box-color: var(--oito2-color-info-box-text-danger);
			background: var(--oito2-color-info-box-danger);
		}

		[data-type='important'] {
			--oito2-info-box-color: var(--oito2-color-info-box-text-important);
			background: var(--oito2-color-info-box-important);
		}

		.icon {
			display: inline-flex;
			flex: none;
			color: var(--oito2-info-box-color);
		}

		.icon :global(svg) {
			width: var(--oito2-icon-size);
			height: var(--oito2-icon-size);
		}

		.text {
			display: flex;
			flex: 1;
			flex-direction: column;
			gap: var(--oito2-space-xs);
			min-width: 0;
		}

		.title {
			color: var(--oito2-info-box-color);
			font: var(--oito2-type-title-small);
			letter-spacing: var(--oito2-type-title-small-tracking);
		}

		.subtitle {
			font: var(--oito2-type-body-medium);
			letter-spacing: var(--oito2-type-body-medium-tracking);
		}

		.trailing {
			display: inline-flex;
			flex: none;
			align-items: center;
			margin-inline-start: calc(var(--oito2-space-sm) - var(--oito2-space-md));
		}
	}
</style>
