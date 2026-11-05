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
	import { SegmentedEntry } from '@oito2/ui';

	const ipSegments = [
		{ length: 3, hint: '000' },
		{ length: 3, hint: '000' },
		{ length: 3, hint: '000' },
		{ length: 3, hint: '000' }
	];
	const keySegments = Array.from({ length: 4 }, (_, index) => ({
		length: 4,
		hint: 'XXXX',
		numeric: false,
		label: `Key group ${index + 1} of 4`
	}));
	const timeSegments = [
		{ length: 2, hint: 'hh', label: 'Hours' },
		{ length: 2, hint: 'mm', label: 'Minutes' },
		{ length: 2, hint: 'ss', label: 'Seconds' }
	];

	let address = $state<readonly string[]>(['192', '168', '0', '1']);
	let key = $state<readonly string[]>([]);
	let duration = $state<readonly string[]>(['01', '30', '00']);
	let valid = $derived(
		address.length === 4 &&
			address.every((part) => part !== '' && Number(part) >= 0 && Number(part) <= 255)
	);
</script>

<main class="showcase-page">
	<p>
		<code>SegmentedEntry</code> is a row of short text fields joined by a
		<code>delimiter</code>, for values like IP addresses or license keys. Focus moves to the
		next segment when one fills up or when the delimiter is typed, and back to the previous one
		on Backspace in an empty segment. Bind
		<code>value</code>, one string per segment.
	</p>

	<section aria-labelledby="segmented-entry-ip">
		<h2 id="segmented-entry-ip">IP address</h2>
		<p>
			Each segment of <code>segments</code> sets its <code>length</code> and
			<code>hint</code>; segments take only digits unless <code>numeric</code> is false. The dot
			is the default delimiter.
		</p>
		<SegmentedEntry bind:value={address} segments={ipSegments} aria-label="IP address" />
		<p class="note">
			Address: {address.join('.') || '(empty)'} · {valid
				? 'Valid'
				: 'Each part must be 0 to 255'}
		</p>
	</section>

	<section aria-labelledby="segmented-entry-key">
		<h2 id="segmented-entry-key">License key</h2>
		<p>
			With <code>numeric: false</code> letters are accepted too, and <code>label</code> names each
			segment for assistive technologies instead of "Part 2 of 4".
		</p>
		<SegmentedEntry
			bind:value={key}
			segments={keySegments}
			delimiter="-"
			aria-label="License key"
		/>
		<p class="note">Key: {key.join('-') || '(empty)'}</p>
	</section>

	<section aria-labelledby="segmented-entry-duration">
		<h2 id="segmented-entry-duration">Duration</h2>
		<p>The <code>delimiter</code> can be any text, such as a colon.</p>
		<SegmentedEntry
			bind:value={duration}
			segments={timeSegments}
			delimiter=":"
			aria-label="Duration"
		/>
		<p class="note">Duration: {duration.join(':')}</p>
	</section>

	<section aria-labelledby="segmented-entry-disabled">
		<h2 id="segmented-entry-disabled">Disabled</h2>
		<SegmentedEntry
			value={['10', '0', '0', '1']}
			segments={ipSegments}
			disabled
			aria-label="Gateway (disabled)"
		/>
	</section>
</main>
