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
  A picture of a person or thing: `src` when it loads, otherwise the initials of `name` on
  a color picked from the name, otherwise `icon`.

  The initials show while the image loads and if it fails. A `status` adds a presence dot
  at the bottom end. Assistive technologies read `name` and the status as one image.
-->
<script lang="ts">
	import UserRound from '@lucide/svelte/icons/user-round';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { IconComponent } from '../icon.js';
	import { useLocale } from '../../l10n/locale.js';
	import {
		avatarColor,
		avatarForeground,
		avatarStatusLabel,
		initials,
		type AvatarShape,
		type AvatarStatus
	} from './avatar.js';

	interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
		/** The URL of the picture shown once it loads, over the initials or icon. */
		src?: string | null;
		/** The name the initials, the color and the accessible name come from. */
		name?: string | null;
		/** The icon shown when `name` is blank. Defaults to a person. */
		icon?: IconComponent;
		/** The width and height in pixels. Defaults to 40. */
		size?: number;
		/** The outline. Defaults to `circle`. */
		shape?: AvatarShape;
		/** The presence status, shown as a dot. */
		status?: AvatarStatus | null;
		/** The background behind the initials or icon; defaults to a color picked from `name`. */
		background?: string | null;
		/** The element. */
		ref?: HTMLSpanElement | null;
	}

	let {
		src = null,
		name = null,
		icon: Icon = UserRound as IconComponent,
		size = 40,
		shape = 'circle',
		status = null,
		background = null,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	const locale = useLocale();

	let loaded = $state(false);
	let failed = $state(false);
	let letters = $derived(name ? initials(name) : '');
	let fill = $derived(background ?? avatarColor(name));
	let ink = $derived(fill === null ? null : avatarForeground(fill));
	let label = $derived(
		[name?.trim() || null, status ? avatarStatusLabel(status, locale.strings) : null]
			.filter((part) => part !== null)
			.join(', ')
	);
	let dot = $derived(Math.min(16, Math.max(8, size * 0.28)));

	// A new picture starts loading again.
	$effect.pre(() => {
		void src;
		loaded = false;
		failed = false;
	});
</script>

<span
	bind:this={ref}
	role={label ? 'img' : undefined}
	aria-label={label || undefined}
	aria-hidden={label ? undefined : 'true'}
	class={['oito2-avatar', className]}
	data-shape={shape}
	style:--oito2-avatar-size="{size}px"
	style:--oito2-avatar-dot="{dot}px"
	{...rest}
>
	<span
		class="oito2-avatar-picture"
		style:background={fill ?? undefined}
		style:color={ink ?? undefined}
		data-neutral={fill === null ? '' : undefined}
	>
		{#if !loaded || failed || !src}
			{#if letters}
				<span class="oito2-avatar-initials">{letters}</span>
			{:else}
				<Icon class="oito2-avatar-icon" aria-hidden="true" />
			{/if}
		{/if}
		{#if src && !failed}
			<img
				{src}
				alt=""
				data-loaded={loaded ? '' : undefined}
				onload={() => (loaded = true)}
				onerror={() => (failed = true)}
			/>
		{/if}
	</span>
	{#if status}<span class="oito2-avatar-status" data-status={status}></span>{/if}
</span>

<style>
	@layer oito2 {
		.oito2-avatar {
			position: relative;
			display: inline-flex;
			flex: none;
			width: var(--oito2-avatar-size);
			height: var(--oito2-avatar-size);
			--oito2-avatar-radius: calc(var(--oito2-avatar-size) / 2);
		}

		.oito2-avatar[data-shape='square'] {
			--oito2-avatar-radius: calc(var(--oito2-avatar-size) * 0.22);
		}

		.oito2-avatar-picture {
			position: relative;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			height: 100%;
			overflow: hidden;
			border-radius: var(--oito2-avatar-radius);
		}

		.oito2-avatar-picture[data-neutral] {
			background: var(--oito2-color-surface-container-highest);
			color: var(--oito2-color-on-surface-variant);
		}

		.oito2-avatar-initials {
			font-family: var(--oito2-font-family, inherit);
			font-size: calc(var(--oito2-avatar-size) * 0.38);
			font-weight: 600;
			line-height: 1;
			white-space: nowrap;
		}

		.oito2-avatar-picture :global(.oito2-avatar-icon) {
			width: calc(var(--oito2-avatar-size) * 0.55);
			height: calc(var(--oito2-avatar-size) * 0.55);
		}

		img {
			position: absolute;
			inset: 0;
			width: 100%;
			height: 100%;
			object-fit: cover;
			opacity: 0;
		}

		img[data-loaded] {
			opacity: 1;
		}

		.oito2-avatar-status {
			position: absolute;
			inset-inline-end: 0;
			bottom: 0;
			box-sizing: border-box;
			width: var(--oito2-avatar-dot);
			height: var(--oito2-avatar-dot);
			border: calc(var(--oito2-avatar-dot) * 0.18) solid var(--oito2-color-background);
			border-radius: 50%;
		}

		[data-status='online'] {
			background: var(--oito2-color-success);
		}

		[data-status='away'] {
			background: var(--oito2-color-warning);
		}

		[data-status='busy'] {
			background: var(--oito2-color-error-text);
		}

		[data-status='offline'] {
			background: var(--oito2-color-outline);
		}
	}
</style>
