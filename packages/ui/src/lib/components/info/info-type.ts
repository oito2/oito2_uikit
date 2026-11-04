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

import CircleCheck from '@lucide/svelte/icons/circle-check';
import CircleX from '@lucide/svelte/icons/circle-x';
import Info from '@lucide/svelte/icons/info';
import Star from '@lucide/svelte/icons/star';
import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
import type { Localizations } from '../../l10n/localizations.js';
import type { InfoType } from '../../theme/css.js';
import type { IconComponent } from '../icon.js';

export { infoTypes, type InfoType } from '../../theme/css.js';

/** The icon that represents each kind of message. */
export const infoTypeIcons: Record<InfoType, IconComponent> = {
	information: Info as IconComponent,
	success: CircleCheck as IconComponent,
	warning: TriangleAlert as IconComponent,
	danger: CircleX as IconComponent,
	important: Star as IconComponent
};

/** Returns the localized name of `type` from `strings`, such as "Warning". */
export function infoTypeLabel(type: InfoType, strings: Localizations): string {
	switch (type) {
		case 'information':
			return strings.infoInformation;
		case 'success':
			return strings.infoSuccess;
		case 'warning':
			return strings.infoWarning;
		case 'danger':
			return strings.infoDanger;
		case 'important':
			return strings.infoImportant;
	}
}
