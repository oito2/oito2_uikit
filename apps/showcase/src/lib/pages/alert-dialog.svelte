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
	import { AlertDialog, Button } from '@oito2/ui';

	let deleteOpen = $state(false);
	let discardOpen = $state(false);
	let outcome = $state('nothing yet');
	let files = $state(3);
</script>

<main class="showcase-page">
	<p>
		<code>AlertDialog</code> asks the user to confirm an action before it happens. It shows a
		title, a description and two buttons; only those buttons and Escape close it, so a click
		outside doesn't dismiss the question by accident. Bind <code>open</code> to show it.
	</p>

	<section aria-labelledby="alert-dialog-confirm">
		<h2 id="alert-dialog-confirm">Confirm a destructive action</h2>
		<p>
			<code>onConfirm</code> runs the action; <code>onCancel</code> runs on the cancel button or
			Escape.
		</p>
		<div class="row">
			<Button variant="outlined" disabled={files === 0} onclick={() => (deleteOpen = true)}>
				Delete a file…
			</Button>
			<Button variant="text" onclick={() => (files = 3)}>Restore all</Button>
		</div>
		<p>{files} files left. Last answer: {outcome}.</p>
		<AlertDialog
			bind:open={deleteOpen}
			title="Delete the file?"
			description="It moves to the trash, where you can still restore it for 30 days."
			confirmLabel="Delete"
			cancelLabel="Cancel"
			onConfirm={() => {
				files = Math.max(0, files - 1);
				outcome = 'deleted';
			}}
			onCancel={() => (outcome = 'cancelled')}
		/>
	</section>

	<section aria-labelledby="alert-dialog-labels">
		<h2 id="alert-dialog-labels">Labels and rich text</h2>
		<p>
			Name the buttons after the action with <code>confirmLabel</code> and
			<code>cancelLabel</code>. <code>description</code> also takes a snippet for rich text.
		</p>
		<div class="row">
			<Button variant="tonal" onclick={() => (discardOpen = true)}>Close the editor…</Button>
		</div>
		<AlertDialog
			bind:open={discardOpen}
			title="Discard your changes?"
			confirmLabel="Discard"
			cancelLabel="Keep editing"
			onConfirm={() => (outcome = 'changes discarded')}
			onCancel={() => (outcome = 'kept editing')}
		>
			{#snippet description()}
				The draft has <strong>12 unsaved edits</strong>. They can't be recovered.
			{/snippet}
		</AlertDialog>
	</section>
</main>
