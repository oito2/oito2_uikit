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

import AppWindow from '@lucide/svelte/icons/app-window';
import Blocks from '@lucide/svelte/icons/blocks';
import Braces from '@lucide/svelte/icons/braces';
import FileUp from '@lucide/svelte/icons/file-up';
import Keyboard from '@lucide/svelte/icons/keyboard';
import Layers from '@lucide/svelte/icons/layers';
import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
import ListTree from '@lucide/svelte/icons/list-tree';
import Palette from '@lucide/svelte/icons/palette';
import Ruler from '@lucide/svelte/icons/ruler';
import Shapes from '@lucide/svelte/icons/shapes';
import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
import Sparkles from '@lucide/svelte/icons/sparkles';
import type { IconComponent } from '@oito2/ui';
import type { Component } from 'svelte';

/** The group a showcase page is listed under. */
export type ShowcaseGroup = 'Components' | 'Theme';

/** A page of the showcase catalogue. */
export interface ShowcasePage {
	/** The address of the page, `/<slug>`, and the name of its source in `src/lib/pages/`. */
	readonly slug: string;
	/** The name in the list and the page header. */
	readonly title: string;
	/** The group it is listed under. */
	readonly group: ShowcaseGroup;
	/** The icon in the list. */
	readonly icon: IconComponent;
}

const icon = (component: unknown) => component as IconComponent;

/** The pages, by group and then alphabetically. */
export const showcasePages: readonly ShowcasePage[] = [
	{ slug: 'code', title: 'Code', group: 'Components', icon: icon(Braces) },
	{
		slug: 'inputs',
		title: 'Controls and entries',
		group: 'Components',
		icon: icon(SlidersHorizontal)
	},
	{ slug: 'data', title: 'Data and display', group: 'Components', icon: icon(ListTree) },
	{ slug: 'extras', title: 'Extras', group: 'Components', icon: icon(Sparkles) },
	{ slug: 'files', title: 'Files', group: 'Components', icon: icon(FileUp) },
	{ slug: 'interaction', title: 'Interaction', group: 'Components', icon: icon(Keyboard) },
	{
		slug: 'layout',
		title: 'Layout and navigation',
		group: 'Components',
		icon: icon(LayoutDashboard)
	},
	{ slug: 'overlays', title: 'Overlays and pickers', group: 'Components', icon: icon(Layers) },
	{ slug: 'window', title: 'Window chrome', group: 'Components', icon: icon(AppWindow) },
	{ slug: 'colors', title: 'Colors', group: 'Theme', icon: icon(Palette) },
	{ slug: 'foundation', title: 'Foundation', group: 'Theme', icon: icon(Ruler) },
	{ slug: 'icons', title: 'Icons', group: 'Theme', icon: icon(Shapes) },
	{ slug: 'material', title: 'Material theme', group: 'Theme', icon: icon(Blocks) }
];

/** Returns the page with `slug`, or `undefined`. */
export function findPage(slug: string | null | undefined): ShowcasePage | undefined {
	return showcasePages.find((page) => page.slug === slug);
}

const modules = import.meta.glob<{ default: Component }>('./pages/*.svelte');
const sources = import.meta.glob<string>('./pages/*.svelte', { query: '?raw', import: 'default' });

/** Loads the component of the page `slug`. */
export async function loadPage(slug: string): Promise<Component> {
	const load = modules[`./pages/${slug}.svelte`];
	if (!load) throw new Error(`No showcase page ${slug}`);
	return (await load()).default;
}

/** Loads the source of the page `slug`, without its license header. */
export async function loadSource(slug: string): Promise<string> {
	const load = sources[`./pages/${slug}.svelte`];
	if (!load) return '';
	return stripLicense(await load());
}

/** Returns `source` without a leading GPL license comment. */
export function stripLicense(source: string): string {
	return source
		.replace(/^\s*<!--[\s\S]*?GNU General Public License[\s\S]*?-->\s*/, '')
		.replace(/^\s*\/\/ Copyright[\s\S]*?licenses\/>\.\s*/, '');
}

/** The address of the page source on GitHub. */
export function sourceUrl(slug: string): string {
	return `https://github.com/oito2/oito2_uikit/blob/main/apps/showcase/src/lib/pages/${slug}.svelte`;
}

/** Returns the pages whose title contains `query`, ignoring case and accents. */
export function searchPages(query: string): readonly ShowcasePage[] {
	const fold = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
	const needle = fold(query.trim());
	return needle === ''
		? showcasePages
		: showcasePages.filter((page) => fold(page.title).includes(needle));
}
