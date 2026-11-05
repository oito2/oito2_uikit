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
	import Pencil from '@lucide/svelte/icons/pencil';
	import Info from '@lucide/svelte/icons/info';
	import { Button, Dialog, Field, IconButton, TextField } from '@oito2/ui';

	let renameOpen = $state(false);
	let fileName = $state('report.pdf');
	let draft = $state('');
	let invalid = $derived(draft.trim() === '');
</script>

<main class="showcase-page">
	<p>
		<code>Dialog</code> is a modal panel centered over a dimmed page. Focus moves into it and
		stays there until it closes; Escape and a click outside close it. Compose it with
		<code>Dialog.Trigger</code> and <code>Dialog.Content</code>, which holds a title, a
		description, any content and <code>Dialog.Actions</code>. For a plain confirmation, use
		<code>AlertDialog</code>.
	</p>

	<section aria-labelledby="dialog-basic">
		<h2 id="dialog-basic">Title bar and actions</h2>
		<p>
			<code>Dialog.TitleBar</code> puts a close button next to the title;
			<code>Dialog.Close</code> closes the dialog from any button.
		</p>
		<div class="row">
			<Dialog.Root>
				<Dialog.Trigger variant="tonal">About this app</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.TitleBar>About this app</Dialog.TitleBar>
					<Dialog.Description>
						oito2 UI Kit is free software, released under the GNU General Public
						License, version 3 or later.
					</Dialog.Description>
					<Dialog.Actions>
						<Dialog.Close variant="filled">OK</Dialog.Close>
					</Dialog.Actions>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	</section>

	<section aria-labelledby="dialog-form">
		<h2 id="dialog-form">A form in a dialog</h2>
		<p>Bind <code>open</code> to close the dialog from your own code once the form is valid.</p>
		<div class="row">
			<Dialog.Root
				bind:open={renameOpen}
				onOpenChange={(open) => {
					if (open) draft = fileName;
				}}
			>
				<Dialog.Trigger variant="outlined" icon={Pencil}>Rename…</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.TitleBar>Rename the file</Dialog.TitleBar>
					<Dialog.Description>Choose a new name for the file.</Dialog.Description>
					<Field.Root {invalid} required>
						<Field.Label>Name</Field.Label>
						<TextField bind:value={draft} />
						<Field.Error>Enter a name.</Field.Error>
					</Field.Root>
					<Dialog.Actions>
						<Dialog.Close>Cancel</Dialog.Close>
						<Button
							disabled={invalid}
							onclick={() => {
								fileName = draft.trim();
								renameOpen = false;
							}}>Rename</Button
						>
					</Dialog.Actions>
				</Dialog.Content>
			</Dialog.Root>
			<span>File name: <strong>{fileName}</strong></span>
		</div>
	</section>

	<section aria-labelledby="dialog-plain-title">
		<h2 id="dialog-plain-title">Plain title, no outside click</h2>
		<p>
			<code>Dialog.Title</code> is a title without the close button, and
			<code>closeOnOutsideClick=&#123;false&#125;</code> keeps the dialog open on a click outside.
		</p>
		<div class="row">
			<Dialog.Root>
				<Dialog.Trigger variant="text">Read the terms</Dialog.Trigger>
				<Dialog.Content closeOnOutsideClick={false}>
					<Dialog.Title>Terms of use</Dialog.Title>
					<Dialog.Description>
						Read the terms to the end, then close the dialog with the button below or
						Escape.
					</Dialog.Description>
					<Dialog.Actions>
						<Dialog.Close>Close</Dialog.Close>
					</Dialog.Actions>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	</section>

	<section aria-labelledby="dialog-custom-trigger">
		<h2 id="dialog-custom-trigger">Custom trigger and close button</h2>
		<p>
			With <code>child</code>, the trigger and the close button render your own element with
			the props they receive. <code>Dialog.Close</code> without a label is the X icon button.
		</p>
		<div class="row">
			<Dialog.Root>
				<Dialog.Trigger>
					{#snippet child({ props })}
						<IconButton icon={Info} label="Keyboard help" {...props} />
					{/snippet}
				</Dialog.Trigger>
				<Dialog.Content>
					<div class="header">
						<Dialog.Title>Keyboard help</Dialog.Title>
						<Dialog.Close />
					</div>
					<Dialog.Description>
						Tab moves between the controls of the dialog, and Escape closes it.
					</Dialog.Description>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	</section>
</main>

<style>
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--oito2-space-md);
	}
</style>
