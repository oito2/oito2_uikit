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

import { describe, expect, it } from 'vitest';
import parity from '../../fixtures/parity/foundation.json';
import { detectDesktopEnvironment } from './desktop-environment.js';

describe('detectDesktopEnvironment', () => {
	it('matches oito2_ui', () => {
		for (const { xdgCurrentDesktop, desktopSession, result } of parity.desktopEnvironments) {
			expect(
				detectDesktopEnvironment({ xdgCurrentDesktop, desktopSession }),
				`${xdgCurrentDesktop} / ${desktopSession}`
			).toBe(result);
		}
	});

	it('defaults to unknown', () => {
		expect(detectDesktopEnvironment()).toBe('unknown');
	});

	it('ignores names inherited from Object', () => {
		expect(detectDesktopEnvironment({ xdgCurrentDesktop: 'constructor' })).toBe('unknown');
	});
});
