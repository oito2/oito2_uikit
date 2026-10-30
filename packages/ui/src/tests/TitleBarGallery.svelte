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

<!-- Test helper: a title bar in each window control style, restored and maximized. -->
<script lang="ts">
	import '../lib/styles/styles.css';
	import {
		WindowButtonLayout,
		windowControlStyles
	} from '../lib/foundation/window-button-layout.js';
	import ThemeProvider from '../lib/theme/ThemeProvider.svelte';
	import TitleBar from '../lib/window/TitleBar.svelte';
	import { FakeWindowController } from './fake-window-controller.svelte.js';

	let { mode = 'light' }: { mode?: 'light' | 'dark' } = $props();

	const restored = new FakeWindowController();
	const maximized = new FakeWindowController();
	maximized.state = { ...maximized.state, isMaximized: true, isActive: false };
	const styles = windowControlStyles.filter((style) => style !== 'none');
</script>

<ThemeProvider {mode} highContrast={false} accent="blue" data-testid="gallery">
	<div class="gallery">
		{#each styles as style (style)}
			{#each [restored, maximized] as controller, index (index)}
				<TitleBar
					title={`${style}${index ? ' (maximized, inactive)' : ''}`}
					controlStyle={style}
					buttonLayout={WindowButtonLayout.defaultFor(style)}
					{controller}
				/>
			{/each}
		{/each}
	</div>
</ThemeProvider>

<style>
	.gallery {
		display: grid;
		gap: 8px;
		width: 560px;
		padding: 8px;
	}
</style>
