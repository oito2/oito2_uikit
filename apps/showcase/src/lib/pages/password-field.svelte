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
	import { Field, PasswordField } from '@oito2/ui';

	let password = $state('');
	let visible = $state(false);
	let next = $state('');
	let confirm = $state('');
	let tooShort = $derived(next.length > 0 && next.length < 8);
	let mismatch = $derived(confirm.length > 0 && confirm !== next);
</script>

<main class="showcase-page">
	<p>
		<code>PasswordField</code> is a password text field with a button that shows or hides the
		text, and a warning below it while Caps Lock is on. Password managers fill it through
		<code>autocomplete</code>.
	</p>

	<section aria-labelledby="password-field-basic">
		<h2 id="password-field-basic">Sign in</h2>
		<p>
			Bind <code>value</code> for the text and <code>visible</code> to know or set whether it shows.
			Turn Caps Lock on while the field has focus to see the warning.
		</p>
		<div class="fields">
			<Field.Root>
				<Field.Label>Password</Field.Label>
				<PasswordField bind:value={password} bind:visible />
			</Field.Root>
		</div>
		<p class="note">
			{password.length} characters · {visible ? 'Shown' : 'Hidden'}
		</p>
	</section>

	<section aria-labelledby="password-field-new">
		<h2 id="password-field-new">New password with validation</h2>
		<p>
			Use <code>autocomplete="new-password"</code> for a field that sets a new password.
			Inside a
			<code>Field.Root</code> the field takes the label, the helper and the error; the root's
			<code>invalid</code> shows the error.
		</p>
		<div class="fields">
			<Field.Root invalid={tooShort} required>
				<Field.Label>New password</Field.Label>
				<PasswordField bind:value={next} autocomplete="new-password" />
				<Field.Helper>At least 8 characters.</Field.Helper>
				<Field.Error>The password is too short.</Field.Error>
			</Field.Root>
			<Field.Root invalid={mismatch} required>
				<Field.Label>Confirm password</Field.Label>
				<PasswordField bind:value={confirm} autocomplete="new-password" />
				<Field.Error>The passwords don't match.</Field.Error>
			</Field.Root>
		</div>
	</section>

	<section aria-labelledby="password-field-options">
		<h2 id="password-field-options">Options and states</h2>
		<p>
			<code>invalid</code> marks a field on its own,
			<code>capsLockWarning=&#123;false&#125;</code>
			turns the warning off, and a disabled field can't be changed or revealed.
		</p>
		<div class="fields">
			<PasswordField value="wrong" invalid aria-label="Invalid password" />
			<PasswordField capsLockWarning={false} aria-label="PIN without the Caps Lock warning" />
			<PasswordField value="secret" disabled aria-label="Password (disabled)" />
		</div>
	</section>
</main>

<style>
	.fields {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 300px));
		gap: var(--oito2-space-md);
		align-items: start;
	}
</style>
