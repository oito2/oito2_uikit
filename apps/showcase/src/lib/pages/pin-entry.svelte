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
	import { PinEntry } from '@oito2/ui';

	let code = $state('');
	let wrong = $state(false);
	let status = $state('Type or paste 6 digits. The right code is 123456.');
	let pin = $state('');
	let voucher = $state('');
</script>

<main class="showcase-page">
	<p>
		<code>PinEntry</code> enters a short code, such as a PIN or a one-time code, in one cell per character.
		One input sits under the cells, so typing, deleting, pasting a whole code and one-time code autofill
		work as in any field.
	</p>

	<section aria-labelledby="pin-entry-verify">
		<h2 id="pin-entry-verify">Checking a code</h2>
		<p>
			When the last cell is filled the entry calls <code>onComplete</code> and gives up the
			focus. Check the code there and set <code>invalid</code> to draw the cells with the error
			border; editing the code clears the error.
		</p>
		<PinEntry
			bind:value={code}
			invalid={wrong}
			onValueChange={() => (wrong = false)}
			onComplete={(value) => {
				wrong = value !== '123456';
				status = wrong ? 'Wrong code.' : 'Verified.';
			}}
			aria-label="Verification code"
		/>
		<p class="note" aria-live="polite">Code: {code || '(empty)'} · {status}</p>
	</section>

	<section aria-labelledby="pin-entry-masked">
		<h2 id="pin-entry-masked">Masked PIN</h2>
		<p>
			With <code>obscure</code> each character shows as a dot; <code>length</code> sets the cells.
		</p>
		<PinEntry bind:value={pin} length={4} obscure aria-label="PIN" />
		<p class="note">{pin.length} of 4 digits</p>
	</section>

	<section aria-labelledby="pin-entry-letters">
		<h2 id="pin-entry-letters">Letters and digits</h2>
		<p>
			By default only digits are kept and the numeric keyboard opens. With
			<code>numeric=&#123;false&#125;</code> any character but white space is accepted.
		</p>
		<PinEntry bind:value={voucher} length={5} numeric={false} aria-label="Voucher" />
		<p class="note">Voucher: {voucher || '(empty)'}</p>
	</section>

	<section aria-labelledby="pin-entry-disabled">
		<h2 id="pin-entry-disabled">Disabled</h2>
		<p>A disabled entry ignores input and its cells fade.</p>
		<PinEntry value="12" length={4} disabled aria-label="PIN (disabled)" />
	</section>
</main>
