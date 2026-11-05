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

<!-- Test helper: the data, display and icon components of phase F10, one at a time. -->
<script lang="ts">
	import '../lib/styles/styles.css';
	import ThemeProvider from '../lib/theme/ThemeProvider.svelte';
	import { ListCollection } from '../lib/collections/list-collection.js';
	import { SelectionController } from '../lib/collections/selection-controller.svelte.js';
	import type { SelectionMode } from '../lib/collections/selection-controller.svelte.js';
	import { TreeCollection, type TreeNode } from '../lib/collections/tree-collection.js';
	import * as ListBox from '../lib/components/list-box/list-box/index.js';
	import TreeView from '../lib/components/tree/TreeView.svelte';
	import { TreeController } from '../lib/components/tree/tree-controller.svelte.js';
	import JsonTreeView from '../lib/components/tree/JsonTreeView.svelte';
	import Avatar from '../lib/components/avatar/Avatar.svelte';
	import AvatarGroup from '../lib/components/avatar/AvatarGroup.svelte';
	import Marquee from '../lib/components/marquee/Marquee.svelte';
	import TimerText from '../lib/components/timer/TimerText.svelte';
	import type { TimerController } from '../lib/components/timer/timer-controller.svelte.js';
	import AnimatedIcon from '../lib/icons/AnimatedIcon.svelte';
	import { animatedIcons, type AnimationMode } from '../lib/icons/animated-icons.js';
	import { draggable, type DraggablePosition } from '../lib/attachments/draggable.js';
	import { undershoot } from '../lib/attachments/undershoot.js';

	interface Fruit {
		id: string;
		name: string;
		kind: string;
		out?: boolean;
	}

	interface Props {
		show: string;
		mode?: SelectionMode;
		values?: readonly string[];
		tree?: TreeCollection<unknown>;
		controller?: TreeController;
		checkable?: boolean;
		query?: string;
		dir?: 'ltr' | 'rtl';
		data?: unknown;
		src?: string | null;
		text?: string;
		width?: number;
		animation?: AnimationMode;
		timer?: TimerController;
		position?: DraggablePosition | null;
		loadChildren?: (node: TreeNode<unknown>) => Promise<TreeNode<unknown>[]>;
		log?: string[];
	}

	let {
		show,
		mode = 'single',
		values = $bindable(),
		tree = $bindable(new TreeCollection([])),
		controller,
		checkable = false,
		query = '',
		dir = 'ltr',
		data = null,
		src = null,
		text = 'Short',
		width = 200,
		animation = 'once',
		timer,
		position = $bindable(),
		loadChildren,
		log = []
	}: Props = $props();

	const fruits = new ListCollection<Fruit>(
		[
			{ id: 'apple', name: 'Apple', kind: 'Pome' },
			{ id: 'pear', name: 'Pear', kind: 'Pome', out: true },
			{ id: 'quince', name: 'Quince', kind: 'Pome' },
			{ id: 'cherry', name: 'Cherry', kind: 'Drupe' },
			{ id: 'peach', name: 'Peach', kind: 'Drupe' },
			{ id: 'plum', name: 'Plum', kind: 'Drupe' }
		],
		{
			getValue: (fruit) => fruit.id,
			getLabel: (fruit) => fruit.name,
			getGroup: (fruit) => fruit.kind,
			isDisabled: (fruit) => fruit.out === true
		}
	);
	const selection = new SelectionController(fruits, { mode: 'multiple' });

	/** Replaces the label of `node` in the tree. */
	function rename(node: TreeNode<unknown>, label: string) {
		log.push(`rename:${node.value}:${label}`);
		tree = tree.replace(node.value, { ...node, label });
	}

	/** Adds the loaded children of `node` to the tree. */
	async function load(node: TreeNode<unknown>) {
		const children = await loadChildren?.(node);
		tree = tree.insert(node.value, children ?? []);
	}
</script>

<ThemeProvider mode="light" highContrast={false} accent="blue">
	<div
		{dir}
		style="padding: 16px"
		data-values={values?.join(',')}
		data-position={position ? `${position.x},${position.y}` : undefined}
	>
		{#if show === 'list-box'}
			<ListBox.Root
				collection={fruits}
				{mode}
				aria-label="Fruits"
				style="max-height: 240px; width: 220px"
				onValuesChange={(next) => (values = next)}
				onActivate={(fruit) => log.push(`activate:${fruit.id}`)}
			/>
		{:else if show === 'list-box-parts'}
			<ListBox.Root collection={fruits} controller={selection} aria-label="Picked fruits">
				<ListBox.Group>
					<ListBox.GroupLabel>Favorites</ListBox.GroupLabel>
					<ListBox.Item value="cherry">Cherry 🍒</ListBox.Item>
					<ListBox.Item value="plum" />
				</ListBox.Group>
			</ListBox.Root>
			<output>{selection.selectedValues.join(',')}</output>
		{:else if show === 'list-box-empty'}
			<ListBox.Root collection={new ListCollection<Fruit>([])} aria-label="Nothing">
				{#snippet empty()}No fruits{/snippet}
			</ListBox.Root>
		{:else if show === 'tree'}
			<TreeView
				collection={tree}
				{controller}
				{checkable}
				{query}
				aria-label="Files"
				style="height: 240px; width: 280px"
				onActivate={log.includes('use-activate')
					? (node) => log.push(`activate:${node.value}`)
					: undefined}
				onRename={rename}
				onLoadChildren={loadChildren ? load : undefined}
				onLoadError={(error, node) => log.push(`error:${node.value}:${String(error)}`)}
			/>
		{:else if show === 'json'}
			<JsonTreeView
				{data}
				{query}
				expandDepth={2}
				aria-label="Document"
				style="height: 240px"
			/>
		{:else if show === 'avatar'}
			<Avatar name="Ana Souza" status="busy" {src} />
			<Avatar />
			<AvatarGroup
				label="Members"
				max={2}
				avatars={[{ name: 'Ana Souza' }, { name: 'Bruno Lima' }, { name: 'Carla Dias' }]}
			/>
		{:else if show === 'marquee'}
			<div style:width="{width}px">
				<Marquee data-testid="marquee"><span>{text}</span></Marquee>
			</div>
		{:else if show === 'animated-icon'}
			<AnimatedIcon data={animatedIcons.ok} mode={animation} label="Done" />
		{:else if show === 'timer' && timer}
			<TimerText controller={timer} data-testid="timer" />
		{:else if show === 'draggable'}
			<div style="position: relative; width: 300px; height: 200px">
				<div
					aria-label="Note"
					data-testid="note"
					style="width: 60px; height: 40px; background: gold"
					{@attach draggable({
						initialPosition: { x: 10, y: 20 },
						onMove: (next) => (position = next)
					})}
				></div>
			</div>
		{:else if show === 'undershoot'}
			<div
				data-testid="scroller"
				style="height: 100px; overflow: auto"
				{@attach undershoot()}
			>
				{#each { length: 20 }, i (i)}<p style="margin: 0; height: 20px">
						Line {i}
					</p>{/each}
			</div>
		{/if}
	</div>
</ThemeProvider>
