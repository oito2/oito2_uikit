---
'@oito2/ui-settings': minor
---

`composeSystemSettings` now fills `SystemSettings.colorScheme`: the platform's light or dark preference (`RawSettings.colorScheme`, the settings portal on Linux), and on Linux, when the portal states no preference, the desktop's own store (GNOME's `color-scheme` key on the GNOME family, Cinnamon and MATE; a dark `kdeglobals` color scheme or global theme on KDE; the `is_dark` flag on COSMIC). `RawSettings` gains the optional `colorScheme`, `config.kdeLookAndFeelPackage` and `config.cosmicIsDark`, read as `null` from older plugins, and `isRawSettings` rejects a `colorScheme` other than `light`, `dark` or `null`.
