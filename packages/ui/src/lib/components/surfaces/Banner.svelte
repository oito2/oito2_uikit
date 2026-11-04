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
  A card-like surface for promoting content, such as an app in a store grid. With
  `onclick` it is a button whose border strengthens on hover. Give it `title`, `subtitle`
  and `icon` for the tile layout, or any content as children. `onHoverChange` tells when
  the pointer enters and leaves, and `tint` washes the background with a color.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import InteractiveSurface from './InteractiveSurface.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'children'> {
		/** The title of the tile layout. */
		title?: string | Snippet;
		/** The text under the title. */
		subtitle?: string | Snippet;
		/** Content before the title, such as an icon or an image. */
		icon?: Snippet;
		/** Whether the banner is selected. */
		selected?: boolean;
		/** Whether the banner can't be used. */
		disabled?: boolean;
		/** A CSS color for the background. Defaults to the surface. */
		color?: string;
		/** A CSS color blended at 8% over the background. */
		tint?: string;
		/** Called with true when the pointer enters the banner and false when it leaves. */
		onHoverChange?: (hovered: boolean) => void;
		/** The banner element. */
		ref?: HTMLElement | null;
		/** Content of a custom layout, after the tile layout when both are given. */
		children?: Snippet;
	}

	let {
		title,
		subtitle,
		icon,
		selected = false,
		disabled = false,
		color,
		tint,
		onHoverChange,
		ref = $bindable(null),
		style,
		children,
		...rest
	}: Props = $props();

	let fill = $derived.by(() => {
		const base = color ?? 'var(--oito2-color-surface)';
		return tint ? `color-mix(in srgb, ${tint} 8%, ${base})` : color;
	});
</script>

{#snippet text(content: string | Snippet)}
	{#if typeof content === 'string'}{content}{:else}{@render content()}{/if}
{/snippet}

<InteractiveSurface
	bind:ref
	kind="banner"
	{selected}
	{disabled}
	{onHoverChange}
	style={[fill ? `--oito2-surface-color: ${fill}` : '', style].filter(Boolean).join('; ') ||
		undefined}
	{...rest}
>
	{#if title}
		<span class="oito2-banner-tile">
			{#if icon}<span class="icon">{@render icon()}</span>{/if}
			<span class="text">
				<span class="title">{@render text(title)}</span>
				{#if subtitle}<span class="subtitle">{@render text(subtitle)}</span>{/if}
			</span>
		</span>
	{/if}
	{@render children?.()}
</InteractiveSurface>

<style>
	@layer oito2 {
		.oito2-banner-tile {
			display: flex;
			align-items: flex-start;
			gap: var(--oito2-space-lg);
		}

		.icon {
			display: inline-flex;
			flex: none;
		}

		.text {
			display: flex;
			flex: 1;
			flex-direction: column;
			gap: var(--oito2-space-xs);
			min-width: 0;
		}

		.title {
			font: var(--oito2-type-title-medium);
			letter-spacing: var(--oito2-type-title-medium-tracking);
		}

		.subtitle {
			color: var(--oito2-color-on-surface-variant);
			font: var(--oito2-type-body-medium);
			letter-spacing: var(--oito2-type-body-medium-tracking);
		}
	}
</style>
