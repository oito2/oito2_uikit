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

<script lang="ts">
	import {
		AnimatedIcon,
		Avatar,
		AvatarGroup,
		Button,
		DiagonalClip,
		JsonTreeView,
		ListBox,
		ListCollection,
		Marquee,
		PlaceholderIcon,
		SearchField,
		SelectionController,
		Switch,
		TimerController,
		TimerText,
		TreeCollection,
		TreeController,
		TreeView,
		animatedIcons,
		draggable,
		focusBorder,
		undershoot,
		useLocale,
		type AnimatedIconName,
		type TreeNode
	} from '@oito2/ui';
	import { freedesktopIcon } from '@oito2/ui/icons';
	import { onDestroy } from 'svelte';

	const locale = useLocale();

	interface Language {
		id: string;
		name: string;
		family: string;
		legacy?: boolean;
	}

	const languages = new ListCollection<Language>(
		[
			{ id: 'rust', name: 'Rust', family: 'Systems' },
			{ id: 'c', name: 'C', family: 'Systems', legacy: true },
			{ id: 'zig', name: 'Zig', family: 'Systems' },
			{ id: 'ts', name: 'TypeScript', family: 'Web' },
			{ id: 'svelte', name: 'Svelte', family: 'Web' },
			{ id: 'dart', name: 'Dart', family: 'Apps' },
			{ id: 'kotlin', name: 'Kotlin', family: 'Apps' }
		],
		{
			getValue: (language) => language.id,
			getLabel: (language) => language.name,
			getGroup: (language) => language.family,
			isDisabled: (language) => language.legacy === true
		}
	);
	const picked = new SelectionController(languages, {
		mode: 'multiple',
		initialValues: ['rust', 'svelte']
	});
	let activated = $state('none');

	let files = $state(
		TreeCollection.fromPaths<unknown>([
			'apps/showcase/src/routes/+layout.svelte',
			'apps/showcase/src/routes/data/+page.svelte',
			'packages/ui/src/lib/index.ts',
			'packages/ui/src/lib/components/tree/TreeView.svelte',
			'packages/ui/package.json',
			'README.md',
			'LICENSE'
		]).insert(null, [{ value: 'remote', label: 'remote (loads on open)', children: [] }])
	);
	const fileTree = new TreeController({
		selectionMode: 'multiple',
		expanded: ['packages', 'packages/ui']
	});
	let checkable = $state(false);
	let query = $state('');

	/** Adds three children to the branch `node` after a short wait. */
	async function loadChildren(node: TreeNode<unknown>) {
		await new Promise((resolve) => setTimeout(resolve, 900));
		files = files.insert(
			node.value,
			[1, 2, 3].map((n) => ({ value: `${node.value}/item-${n}`, label: `Item ${n}` }))
		);
	}

	/** Gives `node` its new label. */
	function rename(node: TreeNode<unknown>, label: string) {
		files = files.replace(node.value, { ...node, label });
	}

	const big = new TreeCollection(
		Array.from({ length: 100 }, (_, b) => ({
			value: `b${b}`,
			label: `Folder ${b + 1}`,
			children: Array.from({ length: 99 }, (_, l) => ({
				value: `b${b}/f${l}`,
				label: `File ${b + 1}.${l + 1}`
			}))
		}))
	);
	const bigTree = new TreeController({ expanded: ['b0', 'b1'] });

	let jsonQuery = $state('');
	const document = {
		name: '@oito2/ui',
		version: '0.0.0',
		private: false,
		keywords: ['svelte', 'tauri', 'design-system'],
		exports: { '.': './dist/index.js', './icons': './dist/icons/index.js' },
		engines: { node: '>=24' },
		funding: null
	};

	const timer = new TimerController({ interval: 100 });
	const countdown = new TimerController({
		countdown: 10_000,
		interval: 100,
		onComplete: () => (finished = true)
	});
	let finished = $state(false);
	onDestroy(() => {
		timer.dispose();
		countdown.dispose();
	});

	let replay = $state(0);
	const iconNames = Object.keys(animatedIcons) as AnimatedIconName[];
	const freedesktopNames = [
		'document-open',
		'document-save',
		'edit-copy',
		'edit-paste',
		'folder-documents',
		'go-next-symbolic',
		'mail-send',
		'media-playback-start',
		'network-wireless',
		'system-search',
		'user-trash',
		'weather-clear'
	];

	let position = $state({ x: 24, y: 24 });
</script>

<main>
	<p>The lists, trees, avatars, timers, icons and utilities of phase F10.</p>

	<section aria-labelledby="list-box">
		<h2 id="list-box">List box</h2>
		<p>
			Arrows, Home and End move; Shift extends, Space toggles, Control+A selects all, letters
			jump and Enter or a double click activates.
		</p>
		<div class="row top">
			<ListBox.Root
				collection={languages}
				controller={picked}
				aria-label="Languages"
				class="panel list"
				onActivate={(language) => (activated = language.name)}
			/>
			<p>
				Selected: {picked.selectedValues.join(', ') || 'none'}<br />Activated: {activated}
			</p>
		</div>
	</section>

	<section aria-labelledby="tree-view">
		<h2 id="tree-view">Tree view</h2>
		<p>
			Right and Left open, close and move between levels; F2 renames; the "remote" folder
			loads its children when it opens. Filtering shows the matches with their folders.
		</p>
		<div class="row">
			<SearchField bind:value={query} aria-label="Filter files" placeholder="Filter files" />
			<label class="row">Check boxes <Switch bind:checked={checkable} /></label>
			<Button variant="text" onclick={() => fileTree.expandAll(files)}>Expand all</Button>
			<Button variant="text" onclick={() => fileTree.collapseAll()}>Collapse all</Button>
		</div>
		<div class="row top">
			<TreeView
				collection={files}
				controller={fileTree}
				{checkable}
				{query}
				aria-label="Files"
				class="panel tree"
				onLoadChildren={loadChildren}
				onRename={rename}
			>
				{#snippet icon(node, open)}
					{@const Glyph = freedesktopIcon(
						node.children ? (open ? 'folder-open' : 'folder') : 'text-x-generic'
					)}
					{#if Glyph}<Glyph aria-hidden="true" />{/if}
				{/snippet}
			</TreeView>
			<div class="column">
				<TreeView
					collection={big}
					controller={bigTree}
					aria-label="Ten thousand files"
					class="panel tree"
				/>
				<small>10 000 nodes; only the rows in view are rendered.</small>
			</div>
		</div>
	</section>

	<section aria-labelledby="json-tree">
		<h2 id="json-tree">JSON tree view</h2>
		<SearchField
			bind:value={jsonQuery}
			aria-label="Filter keys and values"
			placeholder="Filter"
		/>
		<JsonTreeView
			data={document}
			query={jsonQuery}
			expandDepth={2}
			aria-label="package.json"
			class="panel tree wide"
		/>
	</section>

	<section aria-labelledby="avatars">
		<h2 id="avatars">Avatars</h2>
		<div class="row">
			<Avatar name="Ana Souza" status="online" size={48} />
			<Avatar name="Bruno Lima" status="away" />
			<Avatar name="Carla Dias" status="busy" shape="square" />
			<Avatar name="Diego Rocha" status="offline" size={32} />
			<Avatar />
			<AvatarGroup
				label="Project members"
				avatars={[
					{ name: 'Ana Souza' },
					{ name: 'Bruno Lima' },
					{ name: 'Carla Dias' },
					{ name: 'Diego Rocha' },
					{ name: 'Eva Nunes' },
					{ name: 'Fábio Reis' }
				]}
			/>
		</div>
	</section>

	<section aria-labelledby="marquee">
		<h2 id="marquee">Marquee</h2>
		<div class="marquee">
			<Marquee>
				Breaking: the oito2 design system now runs on Svelte 5 and Tauri v2, on Linux,
				Windows and macOS.
			</Marquee>
		</div>
		<div class="marquee short"><Marquee>Fits, so it stays still.</Marquee></div>
	</section>

	<section aria-labelledby="timers">
		<h2 id="timers">Timers</h2>
		<div class="row">
			<span class="time"><TimerText controller={timer} tenths /></span>
			<Button onclick={() => (timer.isRunning ? timer.pause() : timer.start())}
				>{timer.isRunning ? 'Pause' : 'Start'}</Button
			>
			<Button variant="text" onclick={() => timer.reset()}>Reset</Button>
		</div>
		<div class="row">
			<span class="time"><TimerText controller={countdown} /></span>
			<Button
				onclick={() => {
					finished = false;
					countdown.restart();
				}}>Count down 10 s</Button
			>
			{#if finished}<span role="status">Time is up</span>{/if}
		</div>
	</section>

	<section aria-labelledby="icons">
		<h2 id="icons">Icons</h2>
		<div class="row">
			{#key replay}
				{#each iconNames as name (name)}
					<span class="icon" title={name}
						><AnimatedIcon data={animatedIcons[name]} size={32} label={name} /></span
					>
				{/each}
			{/key}
			<Button variant="text" onclick={() => replay++}>Play again</Button>
		</div>
		<div class="row">
			<PlaceholderIcon />
			<PlaceholderIcon size={64} radius="large" />
			{#each freedesktopNames as name (name)}
				{@const Glyph = freedesktopIcon(name)}
				<span class="icon" title={name}
					>{#if Glyph}<Glyph aria-label={name} />{/if}</span
				>
			{/each}
		</div>
	</section>

	<section aria-labelledby="utilities">
		<h2 id="utilities">Utilities</h2>
		<div class="row top">
			<div class="swatch" role="img" aria-label="Light and dark preview">
				<DiagonalClip corner="top-left" class="half light">Aa</DiagonalClip>
				<DiagonalClip corner="bottom-right" class="half dark">Aa</DiagonalClip>
			</div>
			<div class="stage">
				<div
					class="note"
					role="group"
					aria-label="Sticky note"
					aria-describedby="note-hint"
					{@attach focusBorder()}
					{@attach draggable({
						initialPosition: { x: 24, y: 24 },
						onMove: (next) => (position = next)
					})}
				>
					Drag me ({position.x}, {position.y})
					<span id="note-hint" hidden>{locale.strings.moveWithArrowKeys}</span>
				</div>
			</div>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div
				class="scroller"
				tabindex="0"
				role="region"
				aria-label="Undershoot"
				{@attach undershoot()}
			>
				{#each { length: 20 }, i (i)}<p>Line {i + 1}</p>{/each}
			</div>
		</div>
	</section>
</main>

<style>
	main {
		display: grid;
		gap: var(--oito2-space-xl);
		padding: var(--oito2-space-xl);
	}

	h2,
	p {
		margin: 0 0 var(--oito2-space-sm);
	}

	section {
		display: grid;
		gap: var(--oito2-space-md);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--oito2-space-md);
	}

	.top {
		align-items: flex-start;
	}

	.column {
		display: grid;
		gap: var(--oito2-space-xs);
	}

	:global(.panel) {
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-large);
		background: var(--oito2-color-surface-container-lowest);
	}

	:global(.list) {
		width: 220px;
		max-height: 300px;
	}

	:global(.tree) {
		width: 320px;
		height: 300px;
	}

	:global(.wide) {
		width: 480px;
	}

	.marquee {
		width: min(480px, 100%);
		padding: var(--oito2-space-sm);
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-medium);
	}

	.time {
		min-width: 80px;
		font: var(--oito2-type-title-large);
	}

	.icon {
		display: inline-flex;
		--oito2-icon-size: 24px;
	}

	.swatch {
		position: relative;
		width: 96px;
		height: 96px;
		overflow: hidden;
		border-radius: var(--oito2-radius-large);
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

	.stage {
		position: relative;
		width: 320px;
		height: 180px;
		border: 1px dashed var(--oito2-color-outline);
		border-radius: var(--oito2-radius-large);
	}

	.note {
		padding: var(--oito2-space-sm);
		border-radius: var(--oito2-radius-medium);
		background: var(--oito2-color-secondary-container);
		color: var(--oito2-color-on-secondary-container);
	}

	.scroller {
		width: 200px;
		height: 180px;
		overflow: auto;
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-medium);
	}

	.scroller p {
		margin: 0;
		padding: 2px var(--oito2-space-sm);
	}
</style>
