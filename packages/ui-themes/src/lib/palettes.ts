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

// The official palettes of the theme families behind the presets, as hex colors.
// Catppuccin comes from @catppuccin/palette instead.

/** One Everforest palette: background layers from `bgDim` to `bg4`, text and accents. */
export interface EverforestPalette {
	readonly bgDim: string;
	readonly bg0: string;
	readonly bg1: string;
	readonly bg2: string;
	readonly bg3: string;
	readonly bg4: string;
	readonly fg: string;
	readonly red: string;
	readonly orange: string;
	readonly yellow: string;
	readonly green: string;
	readonly aqua: string;
	readonly blue: string;
	readonly purple: string;
	readonly grey0: string;
	readonly grey1: string;
	readonly grey2: string;
}

/** The Everforest palettes, at the medium background contrast. */
export const everforestPalettes: {
	readonly light: EverforestPalette;
	readonly dark: EverforestPalette;
} = {
	light: {
		bgDim: '#EFEBD4',
		bg0: '#FDF6E3',
		bg1: '#F4F0D9',
		bg2: '#EFEBD4',
		bg3: '#E6E2CC',
		bg4: '#E0DCC7',
		fg: '#5C6A72',
		red: '#F85552',
		orange: '#F57D26',
		yellow: '#DFA000',
		green: '#8DA101',
		aqua: '#35A77C',
		blue: '#3A94C5',
		purple: '#DF69BA',
		grey0: '#A6B0A0',
		grey1: '#939F91',
		grey2: '#829181'
	},
	dark: {
		bgDim: '#232A2E',
		bg0: '#2D353B',
		bg1: '#343F44',
		bg2: '#3D484D',
		bg3: '#475258',
		bg4: '#4F585E',
		fg: '#D3C6AA',
		red: '#E67E80',
		orange: '#E69875',
		yellow: '#DBBC7F',
		green: '#A7C080',
		aqua: '#83C092',
		blue: '#7FBBB3',
		purple: '#D699B6',
		grey0: '#7A8478',
		grey1: '#859289',
		grey2: '#9DA9A0'
	}
};

/** One Rosé Pine palette: base surfaces, text and the named accents. */
export interface RosePinePalette {
	readonly base: string;
	readonly surface: string;
	readonly overlay: string;
	readonly muted: string;
	readonly subtle: string;
	readonly text: string;
	readonly love: string;
	readonly gold: string;
	readonly rose: string;
	readonly pine: string;
	readonly foam: string;
	readonly iris: string;
}

/** The Rosé Pine palettes: the main and Moon dark variants and the Dawn light variant. */
export const rosePinePalettes: {
	readonly main: RosePinePalette;
	readonly moon: RosePinePalette;
	readonly dawn: RosePinePalette;
} = {
	main: {
		base: '#191724',
		surface: '#1F1D2E',
		overlay: '#26233A',
		muted: '#6E6A86',
		subtle: '#908CAA',
		text: '#E0DEF4',
		love: '#EB6F92',
		gold: '#F6C177',
		rose: '#EBBCBA',
		pine: '#31748F',
		foam: '#9CCFD8',
		iris: '#C4A7E7'
	},
	moon: {
		base: '#232136',
		surface: '#2A273F',
		overlay: '#393552',
		muted: '#6E6A86',
		subtle: '#908CAA',
		text: '#E0DEF4',
		love: '#EB6F92',
		gold: '#F6C177',
		rose: '#EA9A97',
		pine: '#3E8FB0',
		foam: '#9CCFD8',
		iris: '#C4A7E7'
	},
	dawn: {
		base: '#FAF4ED',
		surface: '#FFFAF3',
		overlay: '#F2E9E1',
		muted: '#9893A5',
		subtle: '#797593',
		text: '#464261',
		love: '#B4637A',
		gold: '#EA9D34',
		rose: '#D7827E',
		pine: '#286983',
		foam: '#56949F',
		iris: '#907AA9'
	}
};

/**
 * The Nord palette: Polar Night (`nord0`–`nord3`), Snow Storm (`nord4`–`nord6`), Frost
 * (`nord7`–`nord10`) and Aurora (`nord11`–`nord15`).
 */
export const nordPalette = {
	nord0: '#2E3440',
	nord1: '#3B4252',
	nord2: '#434C5E',
	nord3: '#4C566A',
	nord4: '#D8DEE9',
	nord5: '#E5E9F0',
	nord6: '#ECEFF4',
	nord7: '#8FBCBB',
	nord8: '#88C0D0',
	nord9: '#81A1C1',
	nord10: '#5E81AC',
	nord11: '#BF616A',
	nord12: '#D08770',
	nord13: '#EBCB8B',
	nord14: '#A3BE8C',
	nord15: '#B48EAD'
} as const;

/** One Dracula palette: background, current line, text and accents. */
export interface DraculaPalette {
	readonly background: string;
	readonly currentLine: string;
	readonly foreground: string;
	readonly comment: string;
	readonly cyan: string;
	readonly green: string;
	readonly orange: string;
	readonly pink: string;
	readonly purple: string;
	readonly red: string;
	readonly yellow: string;
}

/** The Dracula palette and its light variant, Alucard. */
export const draculaPalettes: {
	readonly dracula: DraculaPalette;
	readonly alucard: DraculaPalette;
} = {
	dracula: {
		background: '#282A36',
		currentLine: '#44475A',
		foreground: '#F8F8F2',
		comment: '#6272A4',
		cyan: '#8BE9FD',
		green: '#50FA7B',
		orange: '#FFB86C',
		pink: '#FF79C6',
		purple: '#BD93F9',
		red: '#FF5555',
		yellow: '#F1FA8C'
	},
	alucard: {
		background: '#FFFBEB',
		currentLine: '#6C664B',
		foreground: '#1F1F1F',
		comment: '#6C664B',
		cyan: '#036A96',
		green: '#14710A',
		orange: '#A34D14',
		pink: '#A3144D',
		purple: '#644AC9',
		red: '#CB3A2A',
		yellow: '#846E15'
	}
};
