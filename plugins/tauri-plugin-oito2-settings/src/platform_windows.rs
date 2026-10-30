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

//! Windows sources: the accent color and the high-contrast preference, through the
//! Windows Runtime.

use windows::UI::ViewManagement::{AccessibilitySettings, UIColorType, UISettings};

use crate::raw::RawSettings;

/// Reads the system accent color and the high-contrast preference.
pub fn read() -> RawSettings {
    let system_accent = UISettings::new()
        .and_then(|settings| settings.GetColorValue(UIColorType::Accent))
        .ok()
        .map(|color| format!("#{:02X}{:02X}{:02X}", color.R, color.G, color.B));
    let system_high_contrast = AccessibilitySettings::new()
        .and_then(|settings| settings.HighContrast())
        .unwrap_or(false);
    RawSettings {
        system_accent,
        system_high_contrast,
        ..Default::default()
    }
}
