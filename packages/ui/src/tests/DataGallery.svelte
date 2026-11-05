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

<!-- Test helper: the data, display and icon components of phase F10 at rest, for axe and goldens. -->
<script lang="ts">
	import '../lib/styles/styles.css';
	import ThemeProvider from '../lib/theme/ThemeProvider.svelte';
	import type { ColorTheme } from '../lib/theme/color-theme.js';
	import { ListCollection } from '../lib/collections/list-collection.js';
	import { SelectionController } from '../lib/collections/selection-controller.svelte.js';
	import { TreeCollection } from '../lib/collections/tree-collection.js';
	import * as ListBox from '../lib/components/list-box/list-box/index.js';
	import TreeView from '../lib/components/tree/TreeView.svelte';
	import { TreeController } from '../lib/components/tree/tree-controller.svelte.js';
	import JsonTreeView from '../lib/components/tree/JsonTreeView.svelte';
	import Avatar from '../lib/components/avatar/Avatar.svelte';
	import AvatarGroup from '../lib/components/avatar/AvatarGroup.svelte';
	import Marquee from '../lib/components/marquee/Marquee.svelte';
	import TimerText from '../lib/components/timer/TimerText.svelte';
	import { TimerController } from '../lib/components/timer/timer-controller.svelte.js';
	import DiagonalClip from '../lib/components/layout/DiagonalClip.svelte';
	import AnimatedIcon from '../lib/icons/AnimatedIcon.svelte';
	import PlaceholderIcon from '../lib/icons/PlaceholderIcon.svelte';
	import { animatedIcons } from '../lib/icons/animated-icons.js';
	import { freedesktopIcon } from '../lib/icons/freedesktop-icons.js';
	import { undershoot } from '../lib/attachments/undershoot.js';

	interface Props {
		mode?: 'light' | 'dark';
		highContrast?: boolean;
		theme?: ColorTheme;
	}

	let { mode = 'light', highContrast = false, theme }: Props = $props();

	const people = new ListCollection(
		['Ana Souza', 'Bruno Lima', 'Carla Dias', 'Diego Rocha', 'Eva Nunes'],
		{ isDisabled: (name) => name === 'Diego Rocha' }
	);
	const picked = new SelectionController(people, {
		mode: 'multiple',
		initialValues: ['Bruno Lima', 'Carla Dias']
	});
	const files = TreeCollection.fromPaths([
		'src/lib/index.ts',
		'src/lib/button.svelte',
		'src/routes/+page.svelte',
		'package.json',
		'README.md'
	]);
	const tree = new TreeController({
		expanded: ['src', 'src/lib'],
		selected: ['src/lib/index.ts'],
		checked: ['src/lib/index.ts']
	});
	const timer = new TimerController({ countdown: 90_000 });
	const Folder = freedesktopIcon('folder');
	const File = freedesktopIcon('text-x-generic');
</script>

<ThemeProvider {mode} {highContrast} accent="blue" light={theme} dark={theme} data-testid="gallery">
	<main class="gallery">
		<div class="row">
			<ListBox.Root
				collection={people}
				controller={picked}
				aria-label="People"
				style="width: 200px"
			/>
			<TreeView
				collection={files}
				controller={tree}
				checkable
				aria-label="Files"
				style="width: 260px; height: 230px"
			>
				{#snippet icon(node, open)}
					{@const Glyph = node.children ? Folder : File}
					{#if Glyph}<Glyph aria-hidden="true" data-open={open || undefined} />{/if}
				{/snippet}
			</TreeView>
			<JsonTreeView
				data={{ name: 'oito2', stars: 42, tags: ['ui', 'svelte'], beta: true, owner: null }}
				expandDepth={2}
				aria-label="Package"
				style="width: 260px; height: 230px"
			/>
		</div>
		<div class="row center">
			<Avatar name="Ana Souza" status="online" />
			<Avatar name="Bruno Lima" status="away" shape="square" />
			<Avatar name="Carla Dias" status="busy" size={32} />
			<Avatar status="offline" />
			<AvatarGroup
				label="Members"
				max={3}
				avatars={[
					{ name: 'Ana Souza' },
					{ name: 'Bruno Lima' },
					{ name: 'Carla Dias' },
					{ name: 'Diego Rocha' },
					{ name: 'Eva Nunes' }
				]}
			/>
			<AvatarGroup
				label="Square members"
				shape="square"
				avatars={[{ name: 'Ana Souza' }, { name: 'Bruno Lima' }]}
			/>
			<TimerText controller={timer} />
		</div>
		<div class="row center">
			{#each Object.entries(animatedIcons) as [name, data] (name)}
				<AnimatedIcon {data} mode="still" label={name} />
			{/each}
			<PlaceholderIcon />
			<PlaceholderIcon size={32} radius="small" />
			<div class="swatch">
				<DiagonalClip corner="top-left" class="half light">Aa</DiagonalClip>
				<DiagonalClip corner="bottom-right" class="half dark">Aa</DiagonalClip>
			</div>
		</div>
		<div class="row">
			<div class="marquee"><Marquee>Fits in its space</Marquee></div>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div
				class="scroller"
				tabindex="0"
				role="region"
				aria-label="Lines"
				{@attach undershoot()}
			>
				{#each { length: 12 }, i (i)}<p>Line {i + 1}</p>{/each}
			</div>
		</div>
	</main>
</ThemeProvider>

<style>
	/* Keeps a pointer left over from earlier tests from hovering a row in the golden. */
	.gallery {
		pointer-events: none;
		display: flex;
		flex-direction: column;
		gap: 16px;
		width: 840px;
		min-height: 520px;
		padding: 16px;
		background: var(--oito2-color-background);
		color: var(--oito2-color-on-surface);
	}

	.row {
		display: flex;
		gap: 24px;
	}

	.center {
		align-items: center;
	}

	.swatch {
		position: relative;
		width: 48px;
		height: 48px;
		border-radius: 8px;
		overflow: hidden;
	}

	.swatch :global(.half) {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.swatch :global(.light) {
		background: #fafafa;
		color: #1e1e1e;
	}

	.swatch :global(.dark) {
		background: #1e1e1e;
		color: #fafafa;
	}

	.marquee {
		width: 240px;
	}

	.scroller {
		width: 200px;
		height: 120px;
		overflow: auto;
		border: 1px solid var(--oito2-color-outline-variant);
	}

	.scroller p {
		margin: 0;
		padding: 2px 8px;
	}
</style>
