// Copyright (C) 2026  OITO2
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import type { Component } from 'svelte';

/** The props `@oito2/ui` passes to an icon component, such as a Lucide icon. */
export type IconProps = Record<string, unknown> & {
	size?: number | string;
	strokeWidth?: number | string;
	class?: string;
	'aria-hidden'?: boolean | 'true' | 'false';
};

/** An icon component, such as one from `@lucide/svelte`, rendered at the control's icon size. */
export type IconComponent = Component<IconProps>;
