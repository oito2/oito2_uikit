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

<!-- Test helper: a tooltip, a dialog, an alert dialog, a menu and a select. -->
<script lang="ts">
	import '../lib/styles/styles.css';
	import ThemeProvider from '../lib/theme/ThemeProvider.svelte';
	import Button from '../lib/components/button/Button.svelte';
	import AlertDialog from '../lib/components/dialog/AlertDialog.svelte';
	import * as Dialog from '../lib/components/dialog/dialog/index.js';
	import * as Menu from '../lib/components/menu/menu/index.js';
	import * as Select from '../lib/components/select/select/index.js';
	import * as Tooltip from '../lib/components/tooltip/index.js';
	import { ListCollection } from '../lib/collections/list-collection.js';

	interface Props {
		log?: string[];
		alertOpen?: boolean;
		fruit?: string | null;
		hidden?: boolean;
		sort?: string | null;
	}

	let {
		log = [],
		alertOpen = $bindable(false),
		fruit = $bindable(null),
		hidden = $bindable(false),
		sort = $bindable('name')
	}: Props = $props();

	const fruits = new ListCollection(['Apple', 'Banana', 'Cherry', 'Plum'], {
		isDisabled: (f) => f === 'Banana'
	});
</script>

<ThemeProvider mode="light" highContrast={false} accent="blue">
	<Tooltip.Root delay={50}>
		<Tooltip.Trigger>
			{#snippet child({ props })}<Button {...props}>Info</Button>{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content>More information</Tooltip.Content>
	</Tooltip.Root>

	<Dialog.Root>
		<Dialog.Trigger>Open dialog</Dialog.Trigger>
		<Dialog.Content>
			<Dialog.TitleBar>Settings</Dialog.TitleBar>
			<Dialog.Description>Change the settings.</Dialog.Description>
			<input aria-label="Setting" />
			<Dialog.Actions>
				<Dialog.Close>Done</Dialog.Close>
			</Dialog.Actions>
		</Dialog.Content>
	</Dialog.Root>

	<Button onclick={() => (alertOpen = true)}>Delete</Button>
	<AlertDialog
		bind:open={alertOpen}
		title="Delete it?"
		description="This can't be undone."
		confirmLabel="Delete"
		cancelLabel="Keep"
		onConfirm={() => log.push('confirm')}
		onCancel={() => log.push('cancel')}
	/>

	<Menu.Root>
		<Menu.Trigger>Actions</Menu.Trigger>
		<Menu.Content>
			<Menu.Item onSelect={() => log.push('copy')}>Copy</Menu.Item>
			<Menu.Item onSelect={() => log.push('cut')}>Cut</Menu.Item>
			<Menu.Item disabled>Disabled</Menu.Item>
			<Menu.CheckboxItem bind:checked={hidden}>Hidden files</Menu.CheckboxItem>
			<Menu.RadioGroup bind:value={sort}>
				<Menu.RadioItem value="name">By name</Menu.RadioItem>
				<Menu.RadioItem value="date">By date</Menu.RadioItem>
			</Menu.RadioGroup>
			<Menu.Sub>
				<Menu.SubTrigger>More</Menu.SubTrigger>
				<Menu.SubContent>
					<Menu.Item onSelect={() => log.push('share')}>Share</Menu.Item>
					<Menu.Item onSelect={() => log.push('print')}>Print</Menu.Item>
				</Menu.SubContent>
			</Menu.Sub>
		</Menu.Content>
	</Menu.Root>

	<Select.Root collection={fruits} bind:value={fruit} placeholder="Fruit" label="Fruit" />
	<button data-testid="outside">Outside</button>
</ThemeProvider>
