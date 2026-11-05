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
	import Bot from '@lucide/svelte/icons/bot';
	import Building from '@lucide/svelte/icons/building';
	import { Avatar, AvatarGroup, Slider, type AvatarStatus, type IconComponent } from '@oito2/ui';

	const statuses: AvatarStatus[] = ['online', 'away', 'busy', 'offline'];
	const sizes = [24, 32, 40, 56, 72];

	const picture =
		'data:image/svg+xml,' +
		encodeURIComponent(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
				'<rect width="64" height="64" fill="#2190A4"/>' +
				'<circle cx="32" cy="26" r="12" fill="#F6F5F4"/>' +
				'<path d="M10 64c2-14 12-20 22-20s20 6 22 20z" fill="#F6F5F4"/></svg>'
		);

	const team = [
		{ name: 'Ana Souza', status: 'online' as const },
		{ name: 'Bruno Lima' },
		{ name: 'Carla Dias', status: 'busy' as const },
		{ name: 'Diego Rocha' },
		{ name: 'Eva Nunes' },
		{ name: 'Fábio Reis' },
		{ name: 'Gabriela Melo' }
	];

	let max = $state(4);
</script>

<main class="showcase-page">
	<p>
		<code>Avatar</code> pictures a person or thing: the image at <code>src</code> once it loads,
		otherwise the initials of <code>name</code> on a color picked from the name, otherwise an
		icon. Assistive technologies read the name and the status as one image.
		<code>AvatarGroup</code> overlaps several avatars and counts the rest.
	</p>

	<section aria-labelledby="avatar-content">
		<h2 id="avatar-content">Picture, initials and icon</h2>
		<div class="row">
			<Avatar src={picture} name="Helena Costa" />
			<Avatar name="Ana Souza" />
			<Avatar name="Bruno" />
			<Avatar name="Élodie Ñúñez" />
			<Avatar name="Carla Dias" background="#9141AC" />
			<Avatar icon={Bot as IconComponent} />
			<Avatar icon={Building as IconComponent} shape="square" />
			<Avatar />
		</div>
		<p class="note">
			The initials keep accents whole; <code>background</code> overrides the color picked from the
			name. Without a name, an avatar is decorative and hidden from assistive technologies.
		</p>
	</section>

	<section aria-labelledby="avatar-status">
		<h2 id="avatar-status">Status and shape</h2>
		<div class="row">
			{#each statuses as status (status)}
				<Avatar name="Ana Souza" {status} />
			{/each}
			{#each statuses as status (status)}
				<Avatar name="Bruno Lima" {status} shape="square" />
			{/each}
		</div>
	</section>

	<section aria-labelledby="avatar-sizes">
		<h2 id="avatar-sizes">Sizes</h2>
		<div class="row">
			{#each sizes as size (size)}
				<Avatar name="Diego Rocha" status="online" {size} />
			{/each}
		</div>
	</section>

	<section aria-labelledby="avatar-group">
		<h2 id="avatar-group">Groups</h2>
		<div class="row">
			<Slider bind:value={max} min={1} max={7} divisions={6} label="Most shown" />
		</div>
		<div class="column">
			<AvatarGroup label="Project members" avatars={team} {max} />
			<AvatarGroup label="Reviewers" avatars={team.slice(0, 3)} size={40} overlap={0} />
			<AvatarGroup label="Teams" avatars={team} {max} shape="square" overlap={0.5} />
		</div>
	</section>
</main>
