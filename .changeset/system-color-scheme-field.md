---
'@oito2/ui': minor
'@oito2/ui-settings': patch
---

`SystemSettings` gains `colorScheme` (`'light' | 'dark' | null`), the light or dark scheme the system asks for, matching `colorScheme` of oito2_ui's `Oito2SystemSettings`. `fallbackSystemSettings` and `composeSystemSettings` set it to `null` for now, and `sameSystemSettings` compares it.
