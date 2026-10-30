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

use std::collections::BTreeMap;

use serde::Serialize;

/// A GSettings value the plugin reports: a string or a boolean.
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(untagged)]
pub enum SettingValue {
    Text(String),
    Flag(bool),
}

/// The values the configuration files hold, already extracted.
#[derive(Debug, Clone, Default, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConfigValues {
    /// `ButtonsOnLeft` of `[org.kde.kdecoration2]` in `kwinrc`.
    pub kwin_buttons_on_left: Option<String>,
    /// `ButtonsOnRight` of `[org.kde.kdecoration2]` in `kwinrc`.
    pub kwin_buttons_on_right: Option<String>,
    /// `AccentColor` of `[General]` in `kdeglobals`, as `#RRGGBB`.
    pub kde_accent_color: Option<String>,
    /// `ColorScheme` of `[General]` in `kdeglobals`.
    pub kde_color_scheme: Option<String>,
    /// The `button_layout` property of `xfwm4.xml`.
    pub xfwm_button_layout: Option<String>,
    /// COSMIC's `show_minimize` flag.
    pub cosmic_show_minimize: Option<bool>,
    /// COSMIC's `show_maximize` flag.
    pub cosmic_show_maximize: Option<bool>,
}

/// Everything the webview needs to work out the system settings: the session variables,
/// the GSettings keys, the configuration values and the toolkit's accent and contrast.
/// `@oito2/ui-settings` turns it into a `SystemSettings`.
#[derive(Debug, Clone, Default, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RawSettings {
    /// `XDG_CURRENT_DESKTOP`.
    pub xdg_current_desktop: Option<String>,
    /// `DESKTOP_SESSION`.
    pub desktop_session: Option<String>,
    /// GSettings values by `schema/key`, for the keys whose schema is installed.
    pub gsettings: BTreeMap<String, SettingValue>,
    /// Values from `kwinrc`, `kdeglobals`, `xfwm4.xml` and the COSMIC settings.
    pub config: ConfigValues,
    /// The accent color of the toolkit or system (the XDG portal on Linux), as `#RRGGBB`.
    pub system_accent: Option<String>,
    /// Whether the system asks for high contrast.
    pub system_high_contrast: bool,
}

/// The GSettings keys the webview reads, by schema.
#[cfg(target_os = "linux")]
pub const GSETTINGS_KEYS: &[(&str, &str)] = &[
    ("org.gnome.desktop.wm.preferences", "button-layout"),
    ("org.cinnamon.desktop.wm.preferences", "button-layout"),
    ("org.mate.Marco.general", "button-layout"),
    ("org.gnome.desktop.interface", "accent-color"),
    ("org.gnome.desktop.interface", "gtk-theme"),
    ("org.gnome.desktop.a11y.interface", "high-contrast"),
];

/// The configuration files the plugin reads, relative to `XDG_CONFIG_HOME`.
#[cfg(any(target_os = "linux", test))]
pub mod files {
    pub const KWINRC: &str = "kwinrc";
    pub const KDEGLOBALS: &str = "kdeglobals";
    pub const XFWM: &str = "xfce4/xfconf/xfce-perchannel-xml/xfwm4.xml";
    pub const COSMIC_MINIMIZE: &str = "cosmic/com.system76.CosmicTk/v1/show_minimize";
    pub const COSMIC_MAXIMIZE: &str = "cosmic/com.system76.CosmicTk/v1/show_maximize";
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn serializes_for_the_webview() {
        let mut raw = RawSettings {
            xdg_current_desktop: Some("GNOME".into()),
            ..Default::default()
        };
        raw.gsettings.insert(
            "org.gnome.desktop.a11y.interface/high-contrast".into(),
            SettingValue::Flag(true),
        );
        raw.config.cosmic_show_minimize = Some(false);
        let json = serde_json::to_value(&raw).unwrap();
        assert_eq!(json["xdgCurrentDesktop"], "GNOME");
        assert_eq!(
            json["gsettings"]["org.gnome.desktop.a11y.interface/high-contrast"],
            true
        );
        assert_eq!(json["config"]["cosmicShowMinimize"], false);
        assert_eq!(json["systemAccent"], serde_json::Value::Null);
        assert_eq!(json["systemHighContrast"], false);
    }
}
