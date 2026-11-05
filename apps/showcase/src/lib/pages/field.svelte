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
	import AtSign from '@lucide/svelte/icons/at-sign';
	import Lock from '@lucide/svelte/icons/lock';
	import Search from '@lucide/svelte/icons/search';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import X from '@lucide/svelte/icons/x';
	import { Field, IconButton, TextArea, TextField } from '@oito2/ui';

	let email = $state('ana@');
	let emailInvalid = $derived(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email));
	let query = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let bio = $state('');
	let date = $state('2026-11-05');

	const bioLimit = 160;
</script>

<main class="showcase-page">
	<p>
		<code>TextField</code> is a single-line text input and <code>TextArea</code> a multi-line
		one.
		<code>Field.Root</code> ties them to a <code>Field.Label</code>, a <code>Field.Helper</code>
		and a <code>Field.Error</code> with ids, so the label names the control and the messages describe
		it.
	</p>

	<section aria-labelledby="field-basic">
		<h2 id="field-basic">Label and helper</h2>
		<div class="fields">
			<Field.Root>
				<Field.Label>Name</Field.Label>
				<TextField placeholder="Your full name" autocomplete="name" />
				<Field.Helper>As it appears on your documents.</Field.Helper>
			</Field.Root>
			<TextField aria-label="Without a field" placeholder="Named by aria-label" />
		</div>
	</section>

	<section aria-labelledby="field-validation">
		<h2 id="field-validation">Validation</h2>
		<p>
			While <code>invalid</code>, the field shows the error look and <code>Field.Error</code>
			replaces the helper. A <code>required</code> field shows an asterisk.
		</p>
		<div class="fields">
			<Field.Root invalid={emailInvalid} required>
				<Field.Label>Email</Field.Label>
				<TextField type="email" bind:value={email} autocomplete="email">
					{#snippet leading()}<AtSign size={20} aria-hidden="true" />{/snippet}
				</TextField>
				<Field.Helper>We never share it.</Field.Helper>
				<Field.Error>Enter a complete email address.</Field.Error>
			</Field.Root>
		</div>
		<p>The address is {emailInvalid ? 'incomplete' : 'valid'}.</p>
	</section>

	<section aria-labelledby="field-adornments">
		<h2 id="field-adornments">Leading and trailing content</h2>
		<p><code>leading</code> and <code>trailing</code> hold icons or buttons inside the box.</p>
		<div class="fields">
			<Field.Root>
				<Field.Label>Search</Field.Label>
				<TextField type="search" placeholder="Search files" bind:value={query}>
					{#snippet leading()}<Search size={20} aria-hidden="true" />{/snippet}
					{#snippet trailing()}
						{#if query}
							<IconButton
								icon={X}
								label="Clear the search"
								onclick={() => (query = '')}
							/>
						{/if}
					{/snippet}
				</TextField>
			</Field.Root>
			<Field.Root>
				<Field.Label>Password</Field.Label>
				<TextField
					type={showPassword ? 'text' : 'password'}
					bind:value={password}
					autocomplete="new-password"
				>
					{#snippet leading()}<Lock size={20} aria-hidden="true" />{/snippet}
					{#snippet trailing()}
						<IconButton
							icon={showPassword ? EyeOff : Eye}
							label={showPassword ? 'Hide the password' : 'Show the password'}
							onclick={() => (showPassword = !showPassword)}
						/>
					{/snippet}
				</TextField>
				<Field.Helper>{password.length} characters.</Field.Helper>
			</Field.Root>
		</div>
	</section>

	<section aria-labelledby="field-states">
		<h2 id="field-states">Disabled and read-only</h2>
		<div class="fields">
			<Field.Root disabled>
				<Field.Label>Disabled</Field.Label>
				<TextField value="Can't change" />
				<Field.Helper>The whole field is disabled.</Field.Helper>
			</Field.Root>
			<Field.Root>
				<Field.Label>Read-only</Field.Label>
				<TextField value="Can select, can't edit" readonly />
			</Field.Root>
		</div>
	</section>

	<section aria-labelledby="field-text-area">
		<h2 id="field-text-area">Text area</h2>
		<p>
			<code>rows</code> sets the visible lines. With <code>autoGrow</code> the box grows with
			its text up to <code>maxRows</code>.
		</p>
		<div class="fields">
			<Field.Root>
				<Field.Label>Comment</Field.Label>
				<TextArea rows={4} placeholder="Four rows, then it scrolls" />
			</Field.Root>
			<Field.Root invalid={bio.length > bioLimit}>
				<Field.Label>Bio</Field.Label>
				<TextArea bind:value={bio} autoGrow maxRows={6} placeholder="Grows with its text" />
				<Field.Helper>{bio.length} of {bioLimit} characters.</Field.Helper>
				<Field.Error>{bio.length} of {bioLimit} characters: too long.</Field.Error>
			</Field.Root>
		</div>
	</section>

	<section aria-labelledby="field-custom-control">
		<h2 id="field-custom-control">Custom control</h2>
		<p>
			<code>Field.Control</code> passes the id, description and states to any control, here a native
			date input.
		</p>
		<div class="fields">
			<Field.Root>
				<Field.Label>Due date</Field.Label>
				<Field.Control>
					{#snippet children(props)}
						<input type="date" class="native" bind:value={date} {...props} />
					{/snippet}
				</Field.Control>
				<Field.Helper>Due on {date || 'no date'}.</Field.Helper>
			</Field.Root>
		</div>
	</section>
</main>

<style>
	.fields {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: var(--oito2-space-lg);
		align-items: start;
	}

	.native {
		height: var(--oito2-control-height);
		padding-inline: var(--oito2-space-sm);
		border: 1px solid var(--oito2-color-outline);
		border-radius: var(--oito2-radius-small);
		background: var(--oito2-color-surface-container-highest);
		color: var(--oito2-color-on-surface);
		font: var(--oito2-type-body-medium);
	}
</style>
