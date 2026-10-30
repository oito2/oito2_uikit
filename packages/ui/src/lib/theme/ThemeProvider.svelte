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
  Applies an oito2 color theme to its content: renders a `div` carrying the theme's CSS
  custom properties, its page background and text color, and provides the theme to
  `useTheme()`. By default it follows the system: light or dark from
  `prefers-color-scheme`, the accent and high contrast from the closest `SystemScope`
  (and `prefers-contrast: more`). Overlays opened inside it (popovers, menus, dialogs) are
  rendered at the end of that `div`, so they keep the theme.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { MediaQuery } from 'svelte/reactivity';
	import { useSystemSettings } from '../foundation/system-scope.js';
	import { setPortalTarget } from '../internal/portal.js';
	import type { AccentColor } from '../tokens/values.js';
	import { createColorTheme, type ColorTheme } from './color-theme.js';
	import { colorThemeStyle } from './css.js';
	import { setTheme } from './theme-context.js';

	/** A fixed theme, or a function that builds one for the requested contrast. */
	type ThemeSource = ColorTheme | ((options: { highContrast: boolean }) => ColorTheme);

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** Light, dark, or the system preference. Defaults to `system`. */
		mode?: 'light' | 'dark' | 'system';
		/** A named accent or a hex color. Defaults to the system accent, then blue. */
		accent?: AccentColor | string;
		/** High contrast on, off, or from the system. Defaults to `system`. */
		highContrast?: boolean | 'system';
		/** The theme for light mode, such as a preset. Defaults to the base scheme. */
		light?: ThemeSource;
		/** The theme for dark mode, such as a preset. Defaults to the base scheme. */
		dark?: ThemeSource;
		/** The themed content. */
		children: Snippet;
	}

	let {
		mode = 'system',
		accent,
		highContrast = 'system',
		light,
		dark,
		children,
		class: className,
		...rest
	}: Props = $props();

	const system = useSystemSettings();
	const prefersDark = new MediaQuery('(prefers-color-scheme: dark)', false);
	const prefersMoreContrast = new MediaQuery('(prefers-contrast: more)', false);

	let brightness = $derived(mode === 'system' ? (prefersDark.current ? 'dark' : 'light') : mode);
	let contrast = $derived(
		highContrast === 'system'
			? system.current.highContrast || prefersMoreContrast.current
			: highContrast
	);
	let theme = $derived.by(() => {
		const source = brightness === 'dark' ? dark : light;
		if (typeof source === 'function') return source({ highContrast: contrast });
		if (source) return source;
		return createColorTheme({
			brightness,
			accent: accent ?? system.current.accentColor ?? undefined,
			highContrast: contrast
		});
	});

	setTheme(() => theme);

	let portalHost: HTMLDivElement | undefined = $state();
	setPortalTarget(() => portalHost);
</script>

<div
	{...rest}
	class={['oito2-theme', className]}
	data-oito2-brightness={theme.brightness}
	data-oito2-contrast={theme.highContrast ? 'high' : 'normal'}
	style={colorThemeStyle(theme)}
>
	{@render children()}
	<div class="oito2-portal-host" bind:this={portalHost}></div>
</div>

<style>
	@layer oito2 {
		.oito2-theme {
			background: var(--oito2-color-background);
			color: var(--oito2-color-on-surface);
		}

		/* Overlays rendered here keep the theme's custom properties. */
		.oito2-portal-host {
			display: contents;
		}
	}
</style>
