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

/** The state of a check box: checked, unchecked or mixed (some of its items checked). */
export type CheckedState = boolean | 'mixed';

/**
 * Returns the state of a check box after a click: unchecked becomes checked, checked
 * becomes mixed with `tristate` or unchecked otherwise, and mixed becomes unchecked.
 */
export function nextCheckedState(state: CheckedState, tristate: boolean): CheckedState {
	if (state === false) return true;
	if (state === true) return tristate ? 'mixed' : false;
	return false;
}
